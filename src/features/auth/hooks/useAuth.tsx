import { useAuthStore } from '../../../store/useAuthStore';

export const useAuth = () => {
  return {
    user: useAuthStore((s) => s.user),
    profile: useAuthStore((s) => s.profile),
    privateKey: useAuthStore((s) => s.privateKey),
    authError: useAuthStore((s) => s.authError),
    isResolvingPrivateKey: useAuthStore((s) => s.isResolvingPrivateKey),
    isLoadingSession: useAuthStore((s) => s.isLoadingSession),

    authLogin: useAuthStore((s) => s.authLogin),
    authLogout: useAuthStore((s) => s.authLogout),
    authRegister: useAuthStore((s) => s.authRegister),
    authUnlock: useAuthStore((s) => s.authUnlock),
    changeEncryptionPassword: useAuthStore((s) => s.changeEncryptionPassword),
    fetchPrivateKey: useAuthStore((s) => s.fetchPrivateKey),
    fetchUser: useAuthStore((s) => s.initializeAuth),
  };
};
