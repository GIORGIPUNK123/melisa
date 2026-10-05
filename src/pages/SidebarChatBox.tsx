import { formatConversationTime } from '../shared/utils/dates';
import { ConversationT } from '../types';
import { SidebarChatUserCircle } from './SidebarChatUserCircle';

export const SidebarChatBox = (props: {
  active: boolean;
  onClick: () => void;
  conversation: ConversationT;
}) => {
  return (
    <div
      onClick={props.onClick}
      className={`flex items-center justify-between h-16 gap-3 px-3 duration-100 ease-in-out ${props.active ? 'bg-[#65E0C11C]' : 'hover:bg-[#0A1018]'} rounded-[3.5px] cursor-pointer`}
    >
      <div className='flex items-center gap-3'>
        <SidebarChatUserCircle
          firstLetter={props.conversation.name!.charAt(0)}
          avatarUrl={props.conversation.otherUserAvatar}
        />

        <div className='flex flex-col '>
          <span className='text-sm font-semibold text-white'>
            {props.conversation.name}
          </span>
          <span className='text-xs text-[#56687B]'>
            {props.conversation.lastMessageTime
              ? formatConversationTime(props.conversation.lastMessageTime)
              : 'No messages'}
          </span>
        </div>
      </div>
      <div className='text-sm font-bold flex justify-center items-center rounded-full bg-[#65E0C1] w-5 h-5 text-[#07110F]'>
        2
      </div>
    </div>
  );
};
