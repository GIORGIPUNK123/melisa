import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { PanelSidebar } from '../features/workspace/sidebar/PanelSidebar';
import { NotificationsList } from '../features/notifications/components/NotificationsList';

export const NotificationsPanel = (props: { onlineUserIds: Set<string> }) => {
  const isLoading = useNotificationStore((state) => state.isLoading);
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );

  return (
    <PanelSidebar
      isLoading={isLoading}
      currentUserId={undefined}
      showTabs={false}
      activeTab='notifications'
      onlineUserIds={props.onlineUserIds}
      className={activeConversationId ? 'hidden xl:flex' : 'flex'}
    >
      <NotificationsList />
    </PanelSidebar>
  );
};
