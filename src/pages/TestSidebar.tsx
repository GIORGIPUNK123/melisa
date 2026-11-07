import { Settings } from 'lucide-react';
import { ListSkeleton } from '../components/layout/ListSkeleton';
import { useChatStore } from '../store/useChatStore';
import { ConversationT } from '../types';
import { SidebarChatBox } from './SidebarChatBox';
import { useState } from 'react';
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
        className={` mt-2 px-5 h-0.5 ${isActive ? 'scale-100' : 'scale-0'} duration-100 bg-[#65E0C1] group-hover:bg-[#65E0C1] group-hover:scale-100`}
      />
    </div>
  );
};

export const TestSidebar = ({
  conversations,
  isLoading,
  currentUserId, // 👈 Accept currentUserId here
  className = '',
}: {
  conversations: ConversationT[];
  isLoading: boolean;
  currentUserId: string | undefined;
  className?: string;
}) => {
  const { activeConversationId, setActiveConversationId } = useChatStore();
  const [activeType, setActiveType] = useState<'all' | 'direct' | 'group'>(
    'all',
  );

  const filteredConversations = conversations.filter((conv) => {
    if (activeType === 'all') return true;
    return conv.type === activeType;
  });

  return (
    <div
      className={`${className} h-full w-full shrink-0 bg-[#0E1621] text-white xl:flex xl:w-80 xl:flex-col`}
    >
      {/* ... header and tabs ... */}
      <div className='px-2 mt-3 w-full'>
        <div className='flex justify-between items-center'>
          <h2 className='text-[#F4F8FB] font-bold text-2xl ml-3 mb-4'>
            Messages
          </h2>
          <div className='xl:hidden  text-[#8192A4] bg-[#162231] w-[42px] h-[42px] flex items-center justify-center rounded-lg p-1 cursor-pointer hover:scale-110 hover:text-white duration-200'>
            <Settings width={16} height={16} />
          </div>
        </div>

        {isLoading ? (
          <ListSkeleton rows={Math.max(conversations.length, 5)} />
        ) : (
          <div className='mt-2'>
            <span className='text-[#56687B] font-bold text-xs ml-3'>
              RECENT CONVERSATIONS
            </span>
            {filteredConversations.map((conversation) => {
              // 🔍 Calculate unread status dynamically
              const currentMember = conversation.conversationMembers.find(
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
                  hasUnread={hasUnread} // 👈 Pass boolean state down
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
