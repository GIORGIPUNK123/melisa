import { useChatStore } from '../store/useChatStore';
import { useRequestStore } from '../store/useRequestStore';
import { TestSidebar } from './TestSidebar';
import { RequestsList } from './RequestsList';

export const RequestsPanel = (props: { onlineUserIds: Set<string> }) => {
  const isLoading = useRequestStore((state) => state.isLoading);
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );

  return (
    <TestSidebar
      isLoading={isLoading}
      currentUserId={undefined}
      showTabs={false}
      activeTab='requests'
      onlineUserIds={props.onlineUserIds}
      className={activeConversationId ? 'hidden xl:flex' : 'flex'}
    >
      <RequestsList />
    </TestSidebar>
  );
};
