import { RefreshCw, Settings, UserPlus } from 'lucide-react';
import { ListSkeleton } from '../../../components/layout/ListSkeleton';
import { useChatStore } from '../../../store/useChatStore';
import { ConversationT, FriendT } from '../../../types';
import { SidebarChatBox } from './chatSidebar/SidebarChatBox';
import { SidebarFriendBox } from './chatSidebar/SidebarFriendBox';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { isConversationUnread } from '../../../shared/utils/unread';
import {
  PullToRefresh,
  type PullToRefreshHandle,
} from './PullToRefresh';
import { useRefreshConversations } from '../../chat/hooks/useRefreshConversations';

const SidebarTab = (props: {
  name: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  const { name, isActive, onClick } = props;
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer text-xs h-fit group text-center ${
        isActive
          ? 'px-3 font-semibold text-foreground'
          : 'px-3 font-semibold text-muted'
      }`}
    >
      <span>{name}</span>
      <div
        className={`mt-2 px-5 h-0.5 ${isActive ? 'scale-100' : 'scale-0'} duration-100 bg-primary group-hover:bg-primary group-hover:scale-100`}
      />
    </div>
  );
};
const Tabs = (props: {
  activeConversationType: 'all' | 'direct' | 'group';
  setActiveConversationType: (type: 'all' | 'direct' | 'group') => void;
}) => {
  const { activeConversationType, setActiveConversationType } = props;
  return (
    <div className='flex gap-2 items-center pb-2 mb-4 border-b border-border'>
      <SidebarTab
        name='All'
        isActive={activeConversationType === 'all'}
        onClick={() => setActiveConversationType('all')}
      />
      <SidebarTab
        name='Direct'
        isActive={activeConversationType === 'direct'}
        onClick={() => setActiveConversationType('direct')}
      />
      <SidebarTab
        name='Groups'
        isActive={activeConversationType === 'group'}
        onClick={() => setActiveConversationType('group')}
      />
    </div>
  );
};

const ListConversations = (props: {
  convos: ConversationT[];
  currentUserId: string;
  activeConversationId: number;
  setActiveConversationId: (id: number) => void;

  onlineUserIds: Set<string>;
}) => {
  const {
    convos,
    currentUserId,
    activeConversationId,
    setActiveConversationId,
    onlineUserIds,
  } = props;
  return convos.map((conversation) => {
    const hasUnread = isConversationUnread(conversation, currentUserId);
    const unreadCount =
      conversation.conversationMembers.find(
        (member) => member.id === currentUserId,
      )?.unreadCount ?? 0;
    return (
      <SidebarChatBox
        active={activeConversationId === conversation.id}
        onClick={() => setActiveConversationId(conversation.id)}
        key={conversation.id}
        conversation={conversation}
        hasUnread={hasUnread}
        unreadCount={unreadCount}
        online={
          conversation.type === 'direct' &&
          conversation.conversationMembers.some((m) =>
            onlineUserIds.has(m.id !== currentUserId ? m.id : ''),
          )
        }
      />
    );
  });
};
const ListFriends = (props: {
  friends: FriendT[];
  onClick: (friend: FriendT) => void;
  activeConversationId: number | null;
  setActiveConversationId: (id: number) => void;
  onlineUserIds: Set<string>;
}) => {
  const { friends, activeConversationId, setActiveConversationId } = props;
  return friends.map((friend, _) => {
    return (
      <SidebarFriendBox
        active={activeConversationId === friend.conversationId}
        onClick={() => setActiveConversationId(friend.conversationId!)}
        key={_}
        friend={friend}
        online={props.onlineUserIds.has(friend.userId)}
      />
    );
  });
};

export const PanelSidebar = ({
  conversations = [],
  isLoading,
  currentUserId,
  className = '',
  showTabs,
  activeTab,
  friends,
  handleFriendClick,
  onlineUserIds,
  onAddFriendClick,
  onRefresh,
  children,
}: {
  conversations?: ConversationT[];
  friends?: FriendT[];
  isLoading: boolean;
  currentUserId: string | undefined;
  className?: string;
  title?: string;
  showTabs: boolean;
  activeTab: 'messages' | 'friends' | 'requests' | 'notifications';
  handleFriendClick?: (conversationId: number) => any;
  onlineUserIds: Set<string>;
  onAddFriendClick?: () => void;
  onRefresh?: () => Promise<void>;
  children?: ReactNode;
}) => {
  const navigate = useNavigate();
  const { activeConversationId, setActiveConversationId } = useChatStore();
  const [activeConversationType, setActiveConversationType] = useState<
    'all' | 'direct' | 'group'
  >('all');
  const pullRef = useRef<PullToRefreshHandle>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshConversations = useRefreshConversations();

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshConversations(),
      onRefresh ? onRefresh() : Promise.resolve(),
    ]);
  }, [refreshConversations, onRefresh]);

  const handleRefresh = useCallback(async () => {
    if (pullRef.current) await pullRef.current.refresh();
    else await refreshAll();
  }, [refreshAll]);

  const filteredConversations = conversations.filter((conv) => {
    if (activeConversationType === 'all') return true;
    return conv.type === activeConversationType;
  });

  return (
    <div
      className={`w-full h-full border-r ${className} shrink-0 bg-panel text-foreground xl:flex xl:w-80 xl:flex-col border-border`}
    >
      <PullToRefresh
        ref={pullRef}
        onRefresh={refreshAll}
        onRefreshingChange={setIsRefreshing}
        className='flex-1 w-full'
      >
        <div className='px-2 pt-3'>
          <div className='flex justify-between items-center gap-2'>
            <h2 className='mb-4 ml-3 text-2xl font-bold text-foreground'>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => void handleRefresh()}
                disabled={isRefreshing}
                title='Refresh'
                aria-label='Refresh'
                className='group hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-solid border-border-strong bg-transparent text-subtle transition-all duration-200 hover:border-primary/40 hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 xl:flex'
              >
                <RefreshCw
                  width={15}
                  height={15}
                  className={
                    isRefreshing
                      ? 'refresh-spin'
                      : 'transition-transform duration-300 group-hover:-rotate-45'
                  }
                />
              </button>
              <div
                onClick={() => {
                  navigate('/settings');
                }}
                className='xl:hidden text-muted bg-surface w-10.5 h-10.5 flex items-center justify-center rounded-lg p-1 cursor-pointer hover:scale-110 hover:text-foreground duration-200'
              >
                <Settings width={16} height={16} />
              </div>
            </div>
          </div>

        {showTabs && (
          <Tabs
            activeConversationType={activeConversationType}
            setActiveConversationType={setActiveConversationType}
          />
        )}

        {isLoading ? (
          <ListSkeleton rows={Math.max(conversations.length, 5)} />
        ) : children ? (
          <div className='mt-2'>{children}</div>
        ) : (
          <div className='mt-2'>
            {activeTab === 'friends' && onAddFriendClick && (
              <button
                type='button'
                onClick={onAddFriendClick}
                className='focus-ring mb-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary-soft px-3 py-2 text-[13px] font-semibold text-primary transition hover:bg-primary-soft'
              >
                <UserPlus size={16} />
                Add friend
              </button>
            )}
            <span className='ml-3 text-xs font-bold text-subtle'>
              {activeTab === 'friends' ? 'ALL FRIENDS' : 'RECENT CONVERSATIONS'}
            </span>
            {activeTab === 'friends' ? (
              <ListFriends
                friends={friends!}
                onClick={(friend) =>
                  handleFriendClick?.(friend.conversationId!)
                }
                activeConversationId={activeConversationId!}
                setActiveConversationId={setActiveConversationId}
                onlineUserIds={onlineUserIds}
              />
            ) : (
              <ListConversations
                onlineUserIds={onlineUserIds}
                convos={filteredConversations}
                currentUserId={currentUserId!}
                activeConversationId={activeConversationId!}
                setActiveConversationId={setActiveConversationId}
              />
            )}
          </div>
        )}
        </div>
      </PullToRefresh>
    </div>
  );
};
