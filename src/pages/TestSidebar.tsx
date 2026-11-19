import { Settings, UserPlus } from 'lucide-react';
import { ListSkeleton } from '../components/layout/ListSkeleton';
import { useChatStore } from '../store/useChatStore';
import { ConversationT, FriendT } from '../types';
import { SidebarChatBox } from './SidebarChatBox';
import { SidebarFriendBox } from './SidebarFriendBox';
import { useState } from 'react';
import { useNavigate } from 'react-router';

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
          ? 'text-[#F4F8FB] px-3 font-semibold'
          : 'text-[#8192A4] px-3 font-semibold'
      }`}
    >
      <span>{name}</span>
      <div
        className={`mt-2 px-5 h-0.5 ${isActive ? 'scale-100' : 'scale-0'} duration-100 bg-[#65E0C1] group-hover:bg-[#65E0C1] group-hover:scale-100`}
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
    <div className='flex items-center gap-2 mb-4 border-b border-[#162231] pb-2'>
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
    const currentMember = conversation.conversationMembers?.find(
      (m) => m.id === currentUserId,
    );
    const hasUnread = Boolean(
      conversation.lastMessageTime &&
      currentMember?.lastReadAt &&
      conversation.lastMessageTime > currentMember.lastReadAt,
    );

    return (
      <SidebarChatBox
        active={activeConversationId === conversation.id}
        onClick={() => setActiveConversationId(conversation.id)}
        key={conversation.id}
        conversation={conversation}
        hasUnread={hasUnread}
        online={conversation.conversationMembers.some((m) =>
          onlineUserIds.has(m.id !== currentUserId ? m.id : ''),
        )}
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

export const TestSidebar = ({
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
}) => {
  const navigate = useNavigate();
  const { activeConversationId, setActiveConversationId } = useChatStore();
  const [activeConversationType, setActiveConversationType] = useState<
    'all' | 'direct' | 'group'
  >('all');
  const filteredConversations = conversations.filter((conv) => {
    if (activeConversationType === 'all') return true;
    return conv.type === activeConversationType;
  });

  return (
    <div
      className={`${className} h-full w-full shrink-0 bg-[#0E1621] text-white xl:flex xl:w-80 xl:flex-col border-r border-[#162231]`}
    >
      <div className='overflow-y-auto flex-1 px-2 mt-3 w-full'>
        <div className='flex justify-between items-center'>
          <h2 className='text-[#F4F8FB] font-bold text-2xl ml-3 mb-4'>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h2>
          <div
            onClick={() => {
              navigate('/settings');
            }}
            className='xl:hidden text-[#8192A4] bg-[#162231] w-[42px] h-[42px] flex items-center justify-center rounded-lg p-1 cursor-pointer hover:scale-110 hover:text-white duration-200'
          >
            <Settings width={16} height={16} />
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
        ) : (
          <div className='mt-2'>
            {activeTab === 'friends' && onAddFriendClick && (
              <button
                type='button'
                onClick={onAddFriendClick}
                className='mb-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#65E0C1]/20 bg-[#65E0C1]/10 px-3 py-2 text-[13px] font-semibold text-[#65E0C1] transition hover:bg-[#65E0C1]/20'
              >
                <UserPlus size={16} />
                Add friend
              </button>
            )}
            <span className='text-[#56687B] font-bold text-xs ml-3'>
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
    </div>
  );
};
