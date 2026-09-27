import argon2 from 'argon2-browser/dist/argon2-bundled.min.js';
import { encodeBase64 } from 'tweetnacl-ts';
import { api } from '../../../api/instance';
import { AESGCMDecrypt, AESGCMEncrypt } from '../utils/cryptoFunctions';
import { passwordError } from '../passwordPolicy';

type UserData = {
  encrypted_private_key: string;
  iv: string;
  salt: string;
};

const base64ToUint8Array = (base64: string, fieldName: string) => {
  try {
    const padding = base64.length % 4;
    const padded = padding ? base64 + '='.repeat(4 - padding) : base64;
    const binaryString = atob(padded);
    const bytes = new Uint8Array(binaryString.length);

    for (let index = 0; index < binaryString.length; index++) {
      bytes[index] = binaryString.charCodeAt(index);
    }

    return bytes;
  } catch (error) {
    throw new Error(`Invalid base64 for ${fieldName}: ${error}`);
  }
};

const derivePasswordKey = async (password: string, salt: Uint8Array) => {
  try {
    const hashResult = await argon2.hash({
      pass: password,
      salt,
      time: 3,
      mem: 65536,
      hashLen: 32,
      parallelism: 4,
      type: argon2.ArgonType.Argon2id,
    });

    return new Uint8Array(hashResult.hash);
  } catch (error: any) {
    console.error('Argon2 key derivation failed:', error?.message ?? error);
    throw new Error(
      'Key derivation failed. Try a different browser or device.',
    );
  }
};

const getUserData = async (userId: string): Promise<UserData> => {
  const { data: responseData } = await api.get<UserData | { result: UserData }>(
    `/userinfo/${userId}`,
  );
  const userData =
    'result' in responseData ? responseData.result : responseData;

  if (!userData) throw new Error('Failed to fetch user data');
  if (!userData.salt || !userData.iv || !userData.encrypted_private_key) {
    throw new Error(
      'User profile missing encryption data (salt/iv/encrypted_private_key). Account may need to re-register.',
    );
  }

  return userData;
};

export const fetchPrivateKey = async (
  userId: string,
  password: string,
): Promise<string> => {
  const userData = await getUserData(userId);
  const salt = base64ToUint8Array(userData.salt, 'salt');
  const iv = base64ToUint8Array(userData.iv, 'iv');
  const passwordKey = await derivePasswordKey(password, salt);

  try {
    return await AESGCMDecrypt(userData.encrypted_private_key, passwordKey, iv);
  } catch (error: any) {
    console.error('Decryption failed:', error?.message ?? error);
    throw new Error('Wrong password.');
  }
};

export const changePrivateKeyPassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const passwordProblem = passwordError(newPassword);
  if (passwordProblem) throw new Error(passwordProblem);

  const plaintextKey = await fetchPrivateKey(userId, currentPassword);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordKey = await derivePasswordKey(newPassword, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedPrivateKey = await AESGCMEncrypt(
    plaintextKey,
    passwordKey,
    iv,
  );

  await api.put('/friends/settings', {
    password: newPassword,
    encrypted_private_key: encryptedPrivateKey,
    iv: encodeBase64(iv),
    salt: encodeBase64(salt),
  });

  return plaintextKey;
};
