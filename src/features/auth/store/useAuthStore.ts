import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { AxiosError } from 'axios';
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
import { supabase } from '../../../db/supabase';
import { PublicProfileT } from '../../../types';

interface AuthState {
  // State
  user: User | null;
  profile: PublicProfileT | null;
  privateKey: string | null;
  authError: string | null;
  isResolvingPrivateKey: boolean;
  isLoadingSession: boolean;

  // Actions
  initializeAuth: () => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<PublicProfileT | null>;
  fetchPrivateKey: (userId: string, password: string) => Promise<string | null>;
  authLogin: (email: string, password: string) => Promise<boolean>;
  authRegister: (
    email: string,
    password: string,
    username: string,
    nickname: string,
  ) => Promise<boolean>;
  authLogout: () => Promise<void>;
  authUnlock: (password: string) => Promise<boolean>;
  changeEncryptionPassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ ok: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  privateKey: null,
  authError: null,
  isResolvingPrivateKey: false,
  isLoadingSession: true,

  fetchUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      set({ profile: data });
      return data;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      set({ profile: null });
      return null;
    }
  },

  fetchPrivateKey: async (userId: string, password: string) => {
    try {
      const decryptedPrivateKey = await fetchPrivateKeyService(
        userId,
        password,
      );
      set({ privateKey: decryptedPrivateKey });
      return decryptedPrivateKey;
    } catch (err: any) {
      const msg = err?.response?.data?.error
        ? `API: ${err.response.data.error}`
        : err?.message || 'Failed to fetch private key';
      console.error('fetchPrivateKey failed:', msg, err);
      set({ authError: msg, privateKey: null });
      return null;
    }
  },

  initializeAuth: async () => {
    set({ isLoadingSession: true });
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        set({ user: currentUser });
        await get().fetchUserProfile(currentUser.id);
      } else {
        set({ user: null, profile: null, privateKey: null });
      }
    } catch (error: any) {
      if (isInvalidSessionError(error)) {
        await supabase.auth.signOut({ scope: 'local' });
      }
      set({ user: null, profile: null, privateKey: null });
    } finally {
      set({ isLoadingSession: false });
    }
  },

  authLogin: async (email: string, password: string) => {
    set({ authError: null, isResolvingPrivateKey: true });

    try {
      const loggedInUser = await login(email, password);

      // Fetch private key & public profile concurrently
      await Promise.all([
        get().fetchPrivateKey(loggedInUser.id, password),
        get().fetchUserProfile(loggedInUser.id),
      ]);

      set({ user: loggedInUser });
      return true;
    } catch (err: any) {
      set({
        authError: err.message || 'Login error',
        user: null,
        profile: null,
        privateKey: null,
      });
      return false;
    } finally {
      set({ isResolvingPrivateKey: false });
    }
  },

  authRegister: async (
    email: string,
    password: string,
    username: string,
    nickname: string,
  ) => {
    set({ authError: null });
    try {
      await register(email, password, username, nickname);
      return true;
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ error?: string }>;
      const errorMessage =
        axiosError.response?.data?.error || 'Registration Error';
      set({ authError: errorMessage });
      return false;
    }
  },

  authUnlock: async (password: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) return false;

      const key = await get().fetchPrivateKey(userId, password);
      return key !== null;
    } catch (err) {
      console.error('authUnlock failed:', err);
      return false;
    }
  },

  changeEncryptionPassword: async (
    currentPassword: string,
    newPassword: string,
  ) => {
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

      set({ privateKey: plaintextKey });
      return { ok: true };
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to update password';
      return { ok: false, error: message };
    }
  },

  authLogout: async () => {
    await logout();
    set({
      user: null,
      profile: null,
      privateKey: null,
      isResolvingPrivateKey: false,
    });
  },
}));
