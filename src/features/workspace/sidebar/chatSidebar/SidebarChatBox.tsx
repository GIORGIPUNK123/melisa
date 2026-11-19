import { formatConversationTime } from '../../../../shared/utils/dates';
import { ConversationT } from '../../../../types';
import { SidebarChatUserCircle } from './SidebarChatUserCircle';

export const SidebarChatBox = (props: {
  active: boolean;
  onClick: () => void;
  conversation: ConversationT;
  hasUnread: boolean;
  online: boolean;
}) => {
  return (
    <div
      onClick={props.onClick}
      className={`flex items-center justify-between h-16 gap-3 px-3 duration-100 ease-in-out ${props.active ? 'bg-primary-soft' : 'hover:bg-sidebar'} rounded-tight cursor-pointer`}
    >
      <div className='flex gap-3 items-center'>
        <SidebarChatUserCircle
          firstLetter={props.conversation.name!.charAt(0)}
          avatarUrl={props.conversation.avatarUrl}
        />

        <div className='flex flex-col'>
          <span
            className={`text-sm font-semibold ${props.hasUnread ? 'text-foreground font-bold' : 'text-muted-foreground'}`}
          >
            {props.conversation.name}
          </span>
          <span
            className={`text-xs ${props.hasUnread ? 'text-primary font-medium' : 'text-subtle'}`}
          >
            {props.conversation.lastMessageTime
              ? formatConversationTime(props.conversation.lastMessageTime)
              : 'No messages'}
          </span>
        </div>
      </div>

      {/* 🟢 Render online dot badge only if the user is online */}
      {props.online && (
        <div className='flex justify-center items-center rounded-full bg-primary w-2.5 h-2.5' />
      )}
    </div>
  );
};
