import { useCallback } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useRequestStore } from '../store/useRequestStore';
import { PanelSidebar } from '../features/workspace/sidebar/PanelSidebar';
import { RequestsList } from '../features/friends/components/RequestsList';
import { fetchPendingRequests } from '../features/friends/hooks/usePendingRequests';

export const RequestsPanel = (props: { onlineUserIds: Set<string> }) => {
  const isLoading = useRequestStore((state) => state.isLoading);
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );
  const refreshRequests = useCallback(
    async () => fetchPendingRequests({ silent: true }),
    [],
  );

  return (
    <PanelSidebar
      isLoading={isLoading}
      currentUserId={undefined}
      showTabs={false}
      activeTab='requests'
      onlineUserIds={props.onlineUserIds}
      className={activeConversationId ? 'hidden xl:flex' : 'flex'}
      onRefresh={refreshRequests}
    >
      <RequestsList />
    </PanelSidebar>
  );
};
