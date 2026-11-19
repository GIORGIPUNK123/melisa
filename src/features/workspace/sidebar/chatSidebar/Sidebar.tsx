import { ListSkeleton } from '../../../../components/layout/ListSkeleton';
import { useChatStore } from '../../../../store/useChatStore';
import { ConversationT } from '../../../../types';
import { SidebarChatBox } from './SidebarChatBox';
import { useEffect, useState } from 'react';

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
          ? 'text-foreground px-3 font-semibold'
          : 'text-muted px-3 font-semibold'
      }`}
    >
      <span>{name}</span>
      <div
        className={` mt-2 px-5 h-0.5 ${isActive ? 'scale-100' : 'scale-0'} duration-100 bg-primary group-hover:bg-primary group-hover:scale-100`}
      />
    </div>
  );
};

export const Sidebar = ({
  conversations,
  isLoading,
  unreadCounts,
}: {
  conversations: ConversationT[];
  isLoading: boolean;
  unreadCounts?: Record<string, number>;
}) => {
  const { activeConversationId, setActiveConversationId } = useChatStore();
  const [activeType, setActiveType] = useState<'all' | 'direct' | 'group'>(
    'all',
  );
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId, setActiveConversationId]);
  const filteredConversations = conversations.filter((conv) => {
    if (activeType === 'all') return true;
    return conv.type === activeType;
  });
  return (
    <div className='w-80 shrink-0 h-full bg-panel flex flex-col  text-foreground'>
      <div className='flex flex-col mt-3 ml-5'>
        <span className='font-bold text-xs text-primary'>YOUR INBOX</span>
        <span className='pt-4 text-2xl font-semiBold'>Messages</span>
      </div>
      <div className='h-[60px] mt-4 flex gap-1 items-end pb-4  border-b-[1px] border-solid border-border-strong'>
        <SidebarTab
          name='All'
          isActive={activeType === 'all'}
          onClick={() => setActiveType('all')}
        />
        <SidebarTab
          name='Chats'
          isActive={activeType === 'direct'}
          onClick={() => setActiveType('direct')}
        />
        <SidebarTab
          name='Groups'
          isActive={activeType === 'group'}
          onClick={() => setActiveType('group')}
        />
      </div>
      <div className='px-2 mt-3 min-h-0 flex-1 overflow-y-auto'>
        <span className='text-subtle font-bold text-xs ml-3'>
          RECENT CONVERSATIONS
        </span>
        {isLoading ? (
          <ListSkeleton rows={Math.max(conversations.length, 5)} />
        ) : (
          <div className='mt-2'>
            {filteredConversations.map((conversation) => (
              <SidebarChatBox
                active={activeConversationId === conversation.id}
                onClick={() => setActiveConversationId(conversation.id)}
                key={conversation.id}
                conversation={conversation}
                unreadCount={unreadCounts?.[String(conversation.id)]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
