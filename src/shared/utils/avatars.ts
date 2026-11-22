import { supabase } from '../../db/supabase';

export const AVATAR_BUCKET = 'avatars';
export const AVATAR_SIGNED_URL_TTL = 60 * 60;
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const AVATAR_PATH_PREFIX = `${AVATAR_BUCKET}/`;
const AVATAR_FILE_NAME = 'avatar';
const AVATAR_UPDATED_EVENT = 'melisa:avatar-updated';
const MIME_BY_EXTENSION: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};
const ALLOWED_MIME_TYPES = new Set(Object.values(MIME_BY_EXTENSION));

type CachedAvatarUrl = {
  url: string;
  expiresAt: number;
};

const signedUrlCache = new Map<string, CachedAvatarUrl>();

export const isAvatarStoragePath = (value?: string | null): boolean =>
  typeof value === 'string' &&
  value.trim().startsWith(AVATAR_PATH_PREFIX) &&
  value.trim().slice(AVATAR_PATH_PREFIX.length).includes('/');

const toObjectPath = (storagePath: string): string =>
  storagePath.startsWith(AVATAR_PATH_PREFIX)
    ? storagePath.slice(AVATAR_PATH_PREFIX.length)
    : storagePath;

const getContentType = (file: File): string => {
  const mimeType = file.type.toLowerCase() === 'image/jpg'
    ? 'image/jpeg'
    : file.type.toLowerCase();

  if (ALLOWED_MIME_TYPES.has(mimeType)) return mimeType;

  const extension = file.name.split('.').pop()?.toLowerCase();
  const fromName = extension ? MIME_BY_EXTENSION[extension] : undefined;
  if (fromName) return fromName;

  throw new Error('Use a PNG, JPG, WebP, GIF, or AVIF image.');
};

export const validateAvatarFile = (file: File): string => {
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('Profile photos must be 5 MB or smaller.');
  }

  return getContentType(file);
};

export const uploadAvatar = async (
  userId: string,
  file: File,
): Promise<string> => {
  const contentType = validateAvatarFile(file);
  const objectPath = `${userId}/${AVATAR_FILE_NAME}`;
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(objectPath, file, {
      contentType,
      cacheControl: '0',
      upsert: true,
    });

  if (error) {
    throw new Error(error.message || 'Could not upload profile photo');
  }

  return `${AVATAR_PATH_PREFIX}${objectPath}`;
};

export const deleteAvatarObject = async (
  storagePath: string | null | undefined,
  userId: string,
): Promise<void> => {
  const path = storagePath?.trim();
  const expectedPath = `${AVATAR_PATH_PREFIX}${userId}/${AVATAR_FILE_NAME}`;
  if (path !== expectedPath) return;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([`${userId}/${AVATAR_FILE_NAME}`]);

  if (error) {
    throw new Error(error.message || 'Could not remove profile photo');
  }
};

export const getCachedAvatarUrl = (
  value?: string | null,
): string | null | undefined => {
  const source = value?.trim();
  if (!source || !isAvatarStoragePath(source)) return undefined;

  const cached = signedUrlCache.get(source);
  if (!cached || cached.expiresAt <= Date.now() + 60_000) return undefined;

  return cached.url;
};

export const clearAvatarUrlCache = (value?: string | null): void => {
  const source = value?.trim();
  if (!source) return;

  signedUrlCache.delete(source);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<string>(AVATAR_UPDATED_EVENT, { detail: source }),
    );
  }
};

export const subscribeToAvatarUpdates = (
  listener: (storagePath: string) => void,
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: Event) => {
    listener((event as CustomEvent<string>).detail);
  };

  window.addEventListener(AVATAR_UPDATED_EVENT, handler);
  return () => window.removeEventListener(AVATAR_UPDATED_EVENT, handler);
};

export const resolveAvatarUrl = async (
  value?: string | null,
): Promise<string | null> => {
  const source = value?.trim();
  if (!source) return null;

  // Existing HTTP avatar URLs stay supported for backwards compatibility.
  if (!isAvatarStoragePath(source)) return source;

  const cached = getCachedAvatarUrl(source);
  if (cached) return cached;

  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .createSignedUrl(toObjectPath(source), AVATAR_SIGNED_URL_TTL);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Could not load profile photo');
  }

  signedUrlCache.set(source, {
    url: data.signedUrl,
    expiresAt: Date.now() + AVATAR_SIGNED_URL_TTL * 1000,
  });

  return data.signedUrl;
};
