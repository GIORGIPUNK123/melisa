import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { User } from '@supabase/supabase-js';
import { AxiosError } from 'axios';
import { supabase } from '../../../db/supabase';
import { api } from '../../../api/instance';
import { AESGCMDecrypt, AESGCMEncrypt } from '../utils/cryptoFunctions';
import argon2 from 'argon2-browser/dist/argon2-bundled.min.js';
import { encodeBase64 } from 'tweetnacl-ts';
import { passwordError } from '../passwordPolicy';

const isInvalidSessionError = (error: any): boolean => {
  const status = error?.status ?? error?.statusCode ?? error?.__isAuthError;
  const message = String(error?.message ?? '').toLowerCase();

  return (
    status === 401 ||
    status === 403 ||
    message.includes('jwt') ||
    message.includes('session') ||
    message.includes('invalid') ||
    message.includes('forbidden')
  );
};

type AuthContextValue = {
  authLogin: (email: string, password: string) => Promise<boolean>;
  authLogout: () => Promise<void>;
  authError: string | null;
  fetchUser: () => Promise<void>;
  fetchPrivateKey: (userId: string, password: string) => Promise<string | null>;
  authRegister: (
    email: string,
    password: string,
    username: string,
    nickname: string,
  ) => Promise<boolean>;
  user: 'loading' | User | null;
  privateKey: string | null;
  isResolvingPrivateKey: boolean;
  authUnlock: (password: string) => Promise<boolean>;
  changeEncryptionPassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ ok: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<'loading' | User | null>('loading');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isResolvingPrivateKey, setIsResolvingPrivateKey] = useState(false);

  const [privateKey, setPrivateKey] = useState<string | null>(null);

  // Decode base64 to Uint8Array in browser
  const base64ToUint8Array = useCallback(
    (base64: string, fieldName: string = 'unknown') => {
      try {
        let padded = base64;
        const padding = base64.length % 4;
        if (padding) {
          padded = base64 + '='.repeat(4 - padding);
        }
        const binaryString = atob(padded);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      } catch (err) {
        throw new Error(`Invalid base64 for ${fieldName}: ${err}`);
      }
    },
    [],
  );

  // Fetch and decrypt private key (independent from login)
  const fetchPrivateKey = useCallback(
    async (userId: string, password: string) => {
      try {
        type userDataT = {
          id: string;
          email: string;
          username: string;
          nickname: string;
          avatar_url: string | null;
          status: string;
          public_key: string;
          encrypted_private_key: string;
          iv: string;
          salt: string;
        };
        const { data: responseData } = await api.get<
          userDataT | { result: userDataT }
        >(`/userinfo/${userId}`);
        const userData =
          'result' in responseData ? responseData.result : responseData;
        if (!userData) throw new Error('Failed to fetch user data');
        if (!userData.salt || !userData.iv || !userData.encrypted_private_key) {
          throw new Error(
            'User profile missing encryption data (salt/iv/encrypted_private_key). Account may need to re-register.',
          );
        }
        const saltArray = base64ToUint8Array(userData.salt, 'salt');
        const ivArray = base64ToUint8Array(userData.iv, 'iv');

        let passwordKey: Uint8Array;
        try {
          const hashResult = await argon2.hash({
            pass: password,
            salt: saltArray,
            time: 3, // Must match backend default (timeCost: 3)
            mem: 65536, // KiB - must match backend default (memoryCost: 65536)
            hashLen: 32,
            parallelism: 4, // Must match backend default
            type: argon2.ArgonType.Argon2id,
          });
          passwordKey = new Uint8Array(hashResult.hash);
        } catch (e: any) {
          console.error('Argon2 key derivation failed:', e?.message ?? e);
          throw new Error(
            'Key derivation failed. Try a different browser or device.',
          );
        }

        let decryptedPrivateKey: string;
        try {
          decryptedPrivateKey = await AESGCMDecrypt(
            userData.encrypted_private_key,
            passwordKey,
            ivArray,
          );
        } catch (e: any) {
          console.error('Decryption failed:', e?.message ?? e);
          throw new Error('Wrong password or corrupted key data.');
        }

        setPrivateKey(decryptedPrivateKey);
        return decryptedPrivateKey;
      } catch (err: any) {
        const msg = err?.response?.data?.error
          ? `API: ${err.response.data.error}`
          : err?.message || 'Failed to fetch private key';
        console.error('fetchPrivateKey failed:', msg, err);
        setAuthError(msg);
        setPrivateKey(null);
        return null;
      }
    },
    [base64ToUint8Array],
  );

  // Fetch the current user from Supabase
  const fetchUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setUser(null);
        return;
      }

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        if (error && isInvalidSessionError(error)) {
          await supabase.auth.signOut({ scope: 'local' });
          setUser(null);
          return;
        }

        setUser(data.user ?? null);
        return;
      }

      setUser(data.user);
    } catch (error: any) {
      if (isInvalidSessionError(error)) {
        await supabase.auth.signOut({ scope: 'local' });
      }
      setUser(null);
    }
  }, []);

  // Handle login
  const authLogin = useCallback(
    async (email: string, password: string) => {
      setUser('loading');
      setAuthError(null);
      setIsResolvingPrivateKey(true);

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw new Error(error.message);
        if (!data.user) throw new Error('Login failed');

        await fetchPrivateKey(data.user.id, password);
        // Keep the session even if key unwrap fails (e.g. password was
        // changed without re-wrapping). Unlock screen can use the old password.
        setUser(data.user);
        return true;
      } catch (err: any) {
        setAuthError(err.message || 'Login error');
        setUser(null);
        return false;
      } finally {
        setIsResolvingPrivateKey(false);
      }
    },
    [fetchPrivateKey],
  );

  // Re-unlock / re-decrypt private key using password (for reloads or redirects)
  const authUnlock = useCallback(
    async (password: string) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) return false;

        const key = await fetchPrivateKey(userId, password);
        return key !== null;
      } catch (err) {
        console.error('authUnlock failed:', err);
        return false;
      }
    },
    [fetchPrivateKey],
  );

  // Re-wrap private key with a new password and update auth password
  const changeEncryptionPassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        if (!userId) {
          return { ok: false, error: 'Not authenticated' };
        }
        const passwordProblem = passwordError(newPassword || '');
        if (passwordProblem) {
          return { ok: false, error: passwordProblem };
        }

        // Decrypt with the password that currently wraps the key
        const plaintextKey = await fetchPrivateKey(userId, currentPassword);
        if (!plaintextKey) {
          return {
            ok: false,
            error:
              'Current password is wrong for your encryption key. If you recently changed login password, try the previous one here.',
          };
        }

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const hashResult = await argon2.hash({
          pass: newPassword,
          salt,
          time: 3,
          mem: 65536,
          hashLen: 32,
          parallelism: 4,
          type: argon2.ArgonType.Argon2id,
        });
        const passwordKey = new Uint8Array(hashResult.hash);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedPrivateKeyBase64 = await AESGCMEncrypt(
          plaintextKey,
          passwordKey,
          iv,
        );

        await api.put('/friends/settings', {
          password: newPassword,
          encrypted_private_key: encryptedPrivateKeyBase64,
          iv: encodeBase64(iv),
          salt: encodeBase64(salt),
        });

        setPrivateKey(plaintextKey);

        return { ok: true };
      } catch (err: any) {
        const message =
          err?.response?.data?.error ||
          err?.message ||
          'Failed to update password';
        return { ok: false, error: message };
      }
    },
    [fetchPrivateKey],
  );

  // Handle registration
  const authRegister = useCallback(
    async (
      email: string,
      password: string,
      username: string,
      nickname: string,
    ) => {
      setUser('loading');
      setAuthError(null);
      try {
        await api.post('/auth/register', {
          email,
          password,
          username,
          nickname,
        });

        setUser(null);
        return true;
      } catch (err: unknown) {
        const axiosError = err as AxiosError<{ error?: string }>;
        const errorMessage =
          axiosError.response?.data?.error || 'Registration Error';
        setAuthError(errorMessage);
        setUser(null);
        return false;
      }
    },
    [],
  );

  // Handle logout
  const authLogout = useCallback(async () => {
    await supabase.auth.signOut();
    // Clear sensitive state on logout
    setPrivateKey(null);
    setIsResolvingPrivateKey(false);
    setUser(null);
  }, []);

  useEffect(() => {
    fetchUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [fetchUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      authLogin,
      authLogout,
      authError,
      fetchUser,
      fetchPrivateKey,
      authRegister,
      user,
      privateKey,
      isResolvingPrivateKey,
      authUnlock,
      changeEncryptionPassword,
    }),
    [
      authLogin,
      authLogout,
      authError,
      fetchUser,
      fetchPrivateKey,
      authRegister,
      user,
      privateKey,
      isResolvingPrivateKey,
      authUnlock,
      changeEncryptionPassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
