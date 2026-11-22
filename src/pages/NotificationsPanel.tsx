import { useCallback } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { PanelSidebar } from '../features/workspace/sidebar/PanelSidebar';
import { NotificationsList } from '../features/notifications/components/NotificationsList';
import { fetchNotificationsForUser } from '../features/notifications/hooks/useNotifications';
import { useAuth } from '../features/auth/hooks/useAuth';

export const NotificationsPanel = (props: { onlineUserIds: Set<string> }) => {
  const { user } = useAuth();
  const isLoading = useNotificationStore((state) => state.isLoading);
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );
  const refreshNotifications = useCallback(async () => {
    if (user?.id) await fetchNotificationsForUser(user.id, { silent: true });
  }, [user?.id]);

  return (
    <PanelSidebar
      isLoading={isLoading}
      currentUserId={undefined}
      showTabs={false}
      activeTab='notifications'
      onlineUserIds={props.onlineUserIds}
      className={activeConversationId ? 'hidden xl:flex' : 'flex'}
      onRefresh={refreshNotifications}
    >
      <NotificationsList />
    </PanelSidebar>
  );
};
