import { encodeBase64 } from 'tweetnacl-ts';

export const AESGCMEncrypt = async (
  plaintext: string,
  keyBytes: Uint8Array,
  iv: Uint8Array,
) => {
  // Ensure proper Uint8Arrays (copy the data to avoid any offset issues)
  const keyData = new Uint8Array(keyBytes);
  const ivData = new Uint8Array(iv);

  // Import key for AES-GCM encryption
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    'AES-GCM',
    false,
    ['encrypt'],
  );

  // Encode plaintext
  const encoded = new TextEncoder().encode(plaintext);

  // Encrypt
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivData },
    cryptoKey,
    encoded,
  );

  // Convert encrypted ArrayBuffer to Base64
  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const ciphertextBase64 = encodeBase64(encryptedBytes);

  return ciphertextBase64;
};

export const AESGCMDecrypt = async (
  ciphertextBase64: string,
  keyBytes: Uint8Array,
  iv: Uint8Array,
) => {
  // Ensure we have proper Uint8Arrays (copy the data to avoid any offset issues)
  const keyData = new Uint8Array(keyBytes);
  const ivData = new Uint8Array(iv);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    'AES-GCM',
    false,
    ['decrypt'],
  );

  // Decode base64 ciphertext (standard base64 from backend)
  const binaryStr = atob(ciphertextBase64);
  const ciphertextBytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    ciphertextBytes[i] = binaryStr.charCodeAt(i);
  }

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivData },
    cryptoKey,
    ciphertextBytes,
  );

  return new TextDecoder().decode(decryptedBuffer);
};
