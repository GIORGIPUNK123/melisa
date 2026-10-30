import { Bell, BellOff, X } from 'lucide-react';
import { ConversationT } from '../../../types';

const Users = (props: {
  onlineUserIds: Set<string>;
  conversationMembers: ConversationT['conversationMembers'];
}) => {
  const { onlineUserIds, conversationMembers } = props;
  return (
    <div className='flex flex-col gap-4 px-4 mt-4 w-full items'>
      {conversationMembers.map((member) => (
        <div
          key={member.id}
          className='flex items-center justify-between w-full gap-2 px-2 py-2 hover:bg-[#162231] rounded-md cursor-pointer'
        >
          <img
            src={member.avatarUrl}
            alt={member.nickname.charAt(0).toLocaleUpperCase()}
            className='w-8 h-8 rounded-full flex items-center justify-center bg-[#274D49]'
          />
          <span className='text-[#F4F8FB]'>{member.nickname}</span>

          <div className='flex justify-center items-center w-8 h-8'>
            <div
              className={`${onlineUserIds.has(member.id) ? 'bg-[#65E0C1]' : 'bg-[#8192A4]'} rounded-full w-4 h-4`}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ChatInfo = (props: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  conversation: ConversationT;
  toggleMute: () => void;
  onlineUserIds: Set<string>;
  otherConversationMembers: ConversationT['conversationMembers'];
}) => {
  const {
    conversation,
    isOpen,
    setOpen,
    toggleMute,
    onlineUserIds,
    otherConversationMembers,
  } = props;
  return (
    <div
      className={`h-full bg-[#0E1621] shrink-0 w-72 flex-col items-center ${isOpen ? 'flex' : 'hidden'}`}
    >
      <div className='flex justify-end items-end pb-2 mr-8 w-full h-14'>
        <div
          onClick={() => setOpen(false)}
          className='p-1 cursor-pointer text-[#8192A4] hover:text-[#65E0C1] transition-colors duration-200'
        >
          <X color='' />
        </div>
      </div>
      <div className='relative font-semibold text-xl flex items-center justify-center bg-[#274d49] w-20 h-20 mt-4 rounded-full'>
        {conversation.name.charAt(0).toLocaleUpperCase()}
        <div
          className={`absolute -right-0 -bottom-0 w-2.5 h-2.5 ${onlineUserIds.has(otherConversationMembers[0]?.id) ? 'bg-[#65E0C1]' : 'bg-[#8192A4]'} rounded-full`}
        ></div>
      </div>
      <span className='mt-4 text-[#F4F8FB] font-semibold'>
        {conversation.name}
      </span>
      <span
        className={`mt-4 text-[#F4F8FB] text-center  items-center ${conversation.type === 'direct' ? 'flex' : 'hidden'}`}
      >
        @{otherConversationMembers[0].username}
      </span>
      <button
        onClick={() => toggleMute()}
        className='flex text-[#8192A4] items-center justify-between w-full px-4 mt-8 text-sm cursor-pointer'
      >
        <div className='py-2 w-full flex items-center gap-2 hover:bg-[#162231] px-2 rounded-md transition-colors duration-200'>
          <Bell className={`${conversation.muted ? 'hidden' : ''}`} />
          <BellOff className={`${conversation.muted ? '' : 'hidden'}`} />
          <span>
            {conversation.muted ? 'Unmute Notifications' : 'Mute Notifications'}
          </span>
        </div>
      </button>
      {conversation.type === 'group' && (
        <div className='mt-4 w-full'>
          <Users
            onlineUserIds={onlineUserIds}
            conversationMembers={conversation.conversationMembers}
          />
        </div>
      )}
    </div>
  );
};
