import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Loading } from '../components/Loading';
import { useAuth } from '../features/auth/hooks/useAuth';
import { UnlockWithPassword } from '../features/auth/components/UnlockWithPassword';
import { useAudioNotification } from '../features/notifications/hooks/useAudioNotification';
import { TestMain } from './TestMain';
import { usePresence } from '../shared/hooks/usePresence';
import { useGlobalChatSync } from '../features/chat/hooks/useGlobalChatSync';

export const Main = () => {
  const {
    user,
    authUnlock,
    authLogout,
    privateKey,
    isResolvingPrivateKey,
    isLoadingSession,
  } = useAuth();
  const navigate = useNavigate();
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { ensureEnabled: ensureMessageSoundEnabled } =
    useAudioNotification('ui/success_bling');
  const { ensureEnabled: ensureNotificationSound } = useAudioNotification(
    'notification/notification',
  );

  useGlobalChatSync(user?.id);
  const activeUserId =
    user && user !== null && privateKey && isLoadingSession === false
      ? user.id
      : undefined;
  usePresence(activeUserId);
  useEffect(() => {
    if (user === null) navigate('/login');
  }, [user, navigate]);

  const handleUnlock = async () => {
    if (unlocking || loggingOut || !unlockPassword) return;
    setUnlocking(true);
    setUnlockError(null);
    const ok = await authUnlock(unlockPassword);
    setUnlocking(false);
    if (!ok) {
      setUnlockError('Wrong password.');
    } else {
      setUnlockPassword('');
      void ensureMessageSoundEnabled();
      void ensureNotificationSound();
    }
  };

  const handleUnlockLogout = async () => {
    if (loggingOut || unlocking) return;
    setLoggingOut(true);
    setUnlockError(null);
    try {
      await authLogout();
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  if (isLoadingSession || isResolvingPrivateKey) return <Loading />;
  if (user === null) return <Loading />;

  if (!privateKey) {
    return (
      <UnlockWithPassword
        unlockPassword={unlockPassword}
        setUnlockPassword={setUnlockPassword}
        unlockError={unlockError}
        unlocking={unlocking}
        handleUnlock={handleUnlock}
        onLogout={handleUnlockLogout}
        loggingOut={loggingOut}
      />
    );
  }

  return <TestMain />;
};
