import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Loading } from '../components/Loading';
import { useAuth } from '../features/auth/hooks/useAuth';
import { UnlockWithPassword } from '../features/auth/components/UnlockWithPassword';
import { useAudioNotification } from '../features/notifications/hooks/useAudioNotification';
import { AppSidebar } from '../features/workspace/sidebar/appSidebar/AppSidebar';
import { useChatStore } from '../store/useChatStore';
import { usePresence } from '../shared/hooks/usePresence';
import { useGlobalChatSync } from '../features/chat/hooks/useGlobalChatSync';
import { ChatArea } from '../features/chat/components/ChatArea';
import { supabase } from '../db/supabase';
import { fetchConversations } from '../features/chat/utils/conversationFunctions';
import { usePendingRequestsSync } from '../features/friends/hooks/usePendingRequests';
import { useNotificationsSync } from '../features/notifications/hooks/useNotifications';
import { NotificationToast } from '../features/notifications/components/NotificationToast';

const LiveDataSync = ({ userId }: { userId: string }) => {
  usePendingRequestsSync(userId);
  useNotificationsSync(userId);
  return null;
};

export const Main = (props: { onlineUserIds: Set<string> }) => {
  const navigate = useNavigate();
  const {
    user,
    authUnlock,
    authLogout,
    privateKey,
    isResolvingPrivateKey,
    isLoadingSession,
  } = useAuth();

  const path = useLocation().pathname;

  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { conversations, setConversations, activeConversationId } =
    useChatStore();

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
  }, [user]);

  useEffect(() => {
    const loadConversations = async () => {
      if (!user?.id) return;
      const data = await fetchConversations(supabase, user.id);
      setConversations(data);
    };
    loadConversations();
  }, [user]);

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId,
  );

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

  async function handleUnlock() {
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
  }

  async function handleUnlockLogout() {
    if (loggingOut || unlocking) return;
    setLoggingOut(true);
    setUnlockError(null);
    try {
      await authLogout();
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  }
  return (
    <div className='flex-col-reverse xl:flex-row relative flex w-full h-full min-w-0 overflow-hidden bg-[#080D14]'>
      <LiveDataSync userId={user.id} />
      <NotificationToast />
      <div
        className={`${activeConversationId || path === '/settings' ? 'hidden' : ''} xl:flex`}
      >
        <AppSidebar />
      </div>

      <div className='flex overflow-hidden flex-1 w-full min-w-0 h-full min-h-0'>
        <Outlet />

        {path !== '/settings' &&
          path !== '/requests' &&
          path !== '/friends/requests' &&
          path !== '/notifications' && (
            <ChatArea
              conversation={activeConversation}
              onBack={() =>
                useChatStore.getState().setActiveConversationId(null)
              }
              className={
                activeConversation
                  ? 'flex flex-1 min-w-0'
                  : 'hidden flex-1 min-w-0 xl:flex'
              }
              onlineUserIds={props.onlineUserIds}
            />
          )}
      </div>
    </div>
  );
};
