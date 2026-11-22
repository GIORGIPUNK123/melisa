import { formatConversationTime } from '../../../../shared/utils/dates';
import { ConversationT } from '../../../../types';
import { SidebarChatUserCircle } from './SidebarChatUserCircle';

export const SidebarChatBox = (props: {
  active: boolean;
  onClick: () => void;
  conversation: ConversationT;
  hasUnread: boolean;
  unreadCount: number;
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
          online={props.online}
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
            {props.conversation.lastMessageAt
              ? formatConversationTime(props.conversation.lastMessageAt)
              : 'No messages'}
          </span>
        </div>
      </div>

      {props.unreadCount > 0 && (
        <span className='flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-background'>
          {props.unreadCount > 99 ? '99+' : props.unreadCount}
        </span>
      )}
    </div>
  );
};
