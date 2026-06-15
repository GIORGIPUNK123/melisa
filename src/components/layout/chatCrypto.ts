import {
  box,
  box_open,
  randomBytes,
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64,
} from 'tweetnacl-ts';
import type { MessageT, PublicProfileT } from '../../types';

type DecryptChatMessageArgs = {
  message: MessageT;
  membersList: PublicProfileT[];
  currentUserId: string | null;
  privateKey: string | null;
};

export const decryptChatMessageContent = async ({
  message,
  membersList,
  currentUserId,
  privateKey,
}: DecryptChatMessageArgs): Promise<string> => {
  if (!message.content.startsWith('enc:')) {
    return message.content;
  }

  if (!currentUserId || !privateKey) {
    return '[Encrypted message: locked]';
  }

  const senderId = message.sender_id;
  const senderPublicKey = membersList.find(
    (member) => member.id === senderId,
  )?.public_key;
  const selfPublicKey = membersList.find(
    (member) => member.id === currentUserId,
  )?.public_key;

  if (!senderPublicKey || !selfPublicKey) {
    return '[Encrypted message: missing key]';
  }

  if (message.content.startsWith('enc:v2:')) {
    const parts = message.content.split(':');
    if (parts.length < 6) {
      return '[Encrypted message: invalid payload]';
    }

    const nonceSelf = decodeBase64(parts[2]);
    const cipherSelf = decodeBase64(parts[3]);
    const noncePeer = decodeBase64(parts[4]);
    const cipherPeer = decodeBase64(parts[5]);

    const nonce = senderId === currentUserId ? nonceSelf : noncePeer;
    const cipher = senderId === currentUserId ? cipherSelf : cipherPeer;
    const pubKey = senderId === currentUserId ? selfPublicKey : senderPublicKey;

    const opened = box_open(
      cipher,
      nonce,
      decodeBase64(pubKey),
      decodeBase64(privateKey),
    );

    if (!opened) {
      return '[Encrypted message: failed to decrypt]';
    }

    return encodeUTF8(opened);
  }

  if (message.content.startsWith('enc:v1:')) {
    const parts = message.content.split(':');
    if (parts.length < 4) {
      return '[Encrypted message: invalid payload]';
    }

    if (senderId === currentUserId) {
      return '[Encrypted message: sender copy not available]';
    }

    const nonce = decodeBase64(parts[2]);
    const cipher = decodeBase64(parts[3]);
    const opened = box_open(
      cipher,
      nonce,
      decodeBase64(senderPublicKey),
      decodeBase64(privateKey),
    );

    if (!opened) {
      return '[Encrypted message: failed to decrypt]';
    }

    return encodeUTF8(opened);
  }

  return '[Encrypted message: unknown format]';
};

export const buildEncryptedChatMessageContent = (
  messageContent: string,
  senderPublicKey: string,
  recipientPublicKey: string,
  privateKey: string,
): string => {
  const nonceSelf = randomBytes(24);
  const noncePeer = randomBytes(24);

  const cipherSelf = box(
    decodeUTF8(messageContent),
    nonceSelf,
    decodeBase64(senderPublicKey),
    decodeBase64(privateKey),
  );

  const cipherPeer = box(
    decodeUTF8(messageContent),
    noncePeer,
    decodeBase64(recipientPublicKey),
    decodeBase64(privateKey),
  );

  return `enc:v2:${encodeBase64(nonceSelf)}:${encodeBase64(
    cipherSelf,
  )}:${encodeBase64(noncePeer)}:${encodeBase64(cipherPeer)}`;
};
