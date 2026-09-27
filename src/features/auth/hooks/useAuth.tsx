import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { AxiosError } from 'axios';
import { supabase } from '../../../db/supabase';
import {
  getCurrentUser,
  isInvalidSessionError,
  login,
  logout,
  register,
} from '../services/authService';
import {
  changePrivateKeyPassword,
  fetchPrivateKey as fetchPrivateKeyService,
} from '../services/privateKeyService';

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

  const fetchPrivateKey = useCallback(
    async (userId: string, password: string) => {
      try {
        const decryptedPrivateKey = await fetchPrivateKeyService(
          userId,
          password,
        );
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
    [],
  );

  const fetchUser = useCallback(async () => {
    try {
      setUser(await getCurrentUser());
    } catch (error: any) {
      if (isInvalidSessionError(error)) {
        await supabase.auth.signOut({ scope: 'local' });
      }
      setUser(null);
    }
  }, []);

  const authLogin = useCallback(
    async (email: string, password: string) => {
      setUser('loading');
      setAuthError(null);
      setIsResolvingPrivateKey(true);

      try {
        const loggedInUser = await login(email, password);

        await fetchPrivateKey(loggedInUser.id, password);
        setUser(loggedInUser);
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
        const plaintextKey = await changePrivateKeyPassword(
          userId,
          currentPassword,
          newPassword,
        );

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
        await register(email, password, username, nickname);

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

  const authLogout = useCallback(async () => {
    await logout();
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
