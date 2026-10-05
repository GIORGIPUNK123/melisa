import { Bell, BellOff, X } from 'lucide-react';
import { ConversationT } from '../../../types';

const Users = (props: {
  conversationMembers: ConversationT['conversationMembers'];
}) => {
  return (
    <div className='flex flex-col w-full gap-4 px-4 mt-4 items'>
      {props.conversationMembers.map((member) => (
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
          <div className='w-8 h-8'></div>
        </div>
      ))}
    </div>
  );
};

export const ChatInfo = (props: {
  isopen: boolean;
  setopen: (open: boolean) => void;
  conversation: ConversationT;
  userId: string;
}) => {
  const { conversation, userId } = props;
  return (
    <div
      className={`h-full bg-[#0E1621] shrink-0 w-72 flex-col items-center ${props.isopen ? 'flex' : 'hidden'}`}
    >
      <div className='flex items-end justify-end w-full pb-2 mr-8 h-14'>
        <div
          onClick={() => props.setopen(false)}
          className='p-1 cursor-pointer text-[#8192A4] hover:text-[#65E0C1] transition-colors duration-200'
        >
          <X color='' />
        </div>
      </div>
      <div className='font-semibold text-xl flex items-center justify-center bg-[#274d49] w-20 h-20 mt-4 rounded-full'>
        {conversation.name.charAt(0).toLocaleUpperCase()}
      </div>
      <span className='mt-4 text-[#F4F8FB] font-semibold'>
        {conversation.name}
      </span>
      <span
        className={`mt-4 text-[#F4F8FB] text-center  items-center ${conversation.type === 'direct' ? 'flex' : 'hidden'}`}
      >
        @
        {
          conversation.conversationMembers.find((m) => m.id !== userId)
            ?.username
        }
      </span>
      <div className='flex text-[#8192A4] items-center justify-between w-full px-4 mt-8 text-sm cursor-pointer'>
        <div className='py-2 w-full flex items-center gap-2 hover:bg-[#162231] px-2 rounded-md transition-colors duration-200'>
          <Bell className={`${conversation.muted ? 'hidden' : ''}`} />
          <BellOff className={`${conversation.muted ? '' : 'hidden'}`} />
          <span>
            {conversation.muted ? 'Unmute Notifications' : 'Mute Notifications'}
          </span>
        </div>
      </div>
      {conversation.type === 'group' && (
        <div className='w-full mt-4'>
          <Users conversationMembers={conversation.conversationMembers} />
        </div>
      )}
    </div>
  );
};
