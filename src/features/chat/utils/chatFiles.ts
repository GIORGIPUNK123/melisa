import {
  decodeBase64,
  encodeBase64,
  randomBytes,
  secretbox,
  secretbox_open,
} from 'tweetnacl-ts';
import { supabase } from '../../../db/supabase';
import { PublicProfileT } from '../../../types';
import { sameId } from '../../../shared/utils/ids';
import { unwrapGroupKey, wrapGroupKey } from './chatCrypto';

export const CHAT_MEDIA_BUCKET = 'chat-media';
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export type ChatFileKind = 'image' | 'file';

export type ChatFileWrap = {
  userId: string;
  nonce: string;
  keyBox: string;
};

// file:v1 is the envelope for any attachment. Images use kind "image".
// Other files can use kind "file" later without a new message format.
export type ChatFilePayload = {
  v: 1;
  kind: ChatFileKind;
  mime: string;
  name: string;
  path: string;
  nonce: string;
  group: boolean;
  wrappedBy?: string;
  wraps?: ChatFileWrap[];
};

export const encodeChatFile = (payload: ChatFilePayload) =>
  `file:v1:${JSON.stringify(payload)}`;

export const readChatFile = (content: string): ChatFilePayload | null => {
  if (!content.startsWith('file:v1:')) return null;
  try {
    const payload = JSON.parse(content.slice('file:v1:'.length)) as ChatFilePayload;
    if (payload?.v !== 1 || !payload.path || !payload.nonce || !payload.kind) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

const canvasBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not read that image'))),
      'image/jpeg',
      0.82,
    );
  });

const fileExtension = (name: string) => {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] || '';
};

const isSvgFile = (file: File) =>
  file.type === 'image/svg+xml' || fileExtension(file.name) === 'svg';

const isPreviewImage = (mime: string, name: string) =>
  mime === 'image/svg+xml' ||
  fileExtension(name) === 'svg' ||
  (mime.startsWith('image/') && mime !== 'image/svg+xml');

export const prepareChatFile = async (file: File) => {
  const name = file.name || 'file';
  if (!file.size) throw new Error('That file is empty');
  if (file.size > MAX_FILE_BYTES) throw new Error('File must be under 10 MB');

  if (isSvgFile(file)) {
    return {
      bytes: new Uint8Array(await file.arrayBuffer()),
      mime: 'image/svg+xml',
      name,
      kind: 'image' as const,
    };
  }

  const mime = file.type || 'application/octet-stream';
  const raster =
    mime.startsWith('image/') && mime !== 'image/gif' && mime !== 'image/svg+xml';

  if (raster) {
    try {
      const bitmap = await createImageBitmap(file);
      const maxEdge = 1600;
      const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        bitmap.close();
        throw new Error('Could not read that image');
      }
      context.drawImage(bitmap, 0, 0, width, height);
      bitmap.close();
      const blob = await canvasBlob(canvas);
      if (blob.size > MAX_FILE_BYTES) throw new Error('File must be under 10 MB');
      const baseName = name.replace(/\.[^.]+$/, '');
      return {
        bytes: new Uint8Array(await blob.arrayBuffer()),
        mime: 'image/jpeg',
        name: `${baseName}.jpg`,
        kind: 'image' as const,
      };
    } catch (err) {
      if (err instanceof Error && err.message === 'File must be under 10 MB') throw err;
    }
  }

  return {
    bytes: new Uint8Array(await file.arrayBuffer()),
    mime,
    name,
    kind: isPreviewImage(mime, name) ? ('image' as const) : ('file' as const),
  };
};

export const sealChatFile = (
  bytes: Uint8Array,
  options: {
    groupKey: Uint8Array | null;
    members: PublicProfileT[];
    senderId: string;
    senderPrivateKey: string;
  },
) => {
  const fileNonce = randomBytes(24);

  if (options.groupKey) {
    const cipher = secretbox(bytes, fileNonce, options.groupKey);
    if (!cipher) throw new Error('Could not encrypt file');
    return {
      cipher,
      nonce: encodeBase64(fileNonce),
      group: true as const,
    };
  }

  const fileKey = randomBytes(32);
  const cipher = secretbox(bytes, fileNonce, fileKey);
  if (!cipher) throw new Error('Could not encrypt file');

  const wraps: ChatFileWrap[] = [];
  for (const member of options.members) {
    if (!member.public_key) continue;
    const wrapped = wrapGroupKey(
      fileKey,
      member.public_key,
      options.senderPrivateKey,
    );
    wraps.push({ userId: member.id, ...wrapped });
  }

  if (!wraps.some((wrap) => sameId(wrap.userId, options.senderId))) {
    throw new Error('Missing encryption keys for this conversation.');
  }
  if (wraps.length < 2) {
    throw new Error('Missing encryption keys for this conversation.');
  }

  return {
    cipher,
    nonce: encodeBase64(fileNonce),
    group: false as const,
    wrappedBy: options.senderId,
    wraps,
  };
};

export const uploadChatFile = async (
  conversationId: string,
  cipher: Uint8Array,
) => {
  const path = `${conversationId}/${crypto.randomUUID()}`;
  const { error } = await supabase.storage
    .from(CHAT_MEDIA_BUCKET)
    .upload(path, cipher, {
      contentType: 'application/octet-stream',
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || 'Could not upload file');
  }

  return path;
};

export const downloadChatFile = async (path: string) => {
  const { data, error } = await supabase.storage
    .from(CHAT_MEDIA_BUCKET)
    .download(path);

  if (error || !data) {
    throw new Error(error?.message || 'Could not download file');
  }

  return new Uint8Array(await data.arrayBuffer());
};

export const openChatFileBytes = (
  cipher: Uint8Array,
  payload: ChatFilePayload,
  options: {
    privateKey: string;
    groupKey: Uint8Array | null;
    members: PublicProfileT[];
    currentUserId: string;
  },
) => {
  const nonce = decodeBase64(payload.nonce);
  let fileKey: Uint8Array | null = null;

  if (payload.group) {
    fileKey = options.groupKey;
  } else {
    const wrap = payload.wraps?.find((item) =>
      sameId(item.userId, options.currentUserId),
    );
    const senderKey = options.members.find((member) =>
      sameId(member.id, payload.wrappedBy),
    )?.public_key;
    if (wrap && senderKey) {
      fileKey = unwrapGroupKey(
        wrap.keyBox,
        wrap.nonce,
        senderKey,
        options.privateKey,
      );
    }
  }

  if (!fileKey) return null;
  return secretbox_open(cipher, nonce, fileKey);
};
