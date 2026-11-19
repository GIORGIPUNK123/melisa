import { useChatStore } from '../store/useChatStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { TestSidebar } from './TestSidebar';
import { NotificationsList } from './NotificationsList';

export const NotificationsPanel = (props: { onlineUserIds: Set<string> }) => {
  const isLoading = useNotificationStore((state) => state.isLoading);
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );

  return (
    <TestSidebar
      isLoading={isLoading}
      currentUserId={undefined}
      showTabs={false}
      activeTab='notifications'
      onlineUserIds={props.onlineUserIds}
      className={activeConversationId ? 'hidden xl:flex' : 'flex'}
    >
      <NotificationsList />
    </TestSidebar>
  );
};
