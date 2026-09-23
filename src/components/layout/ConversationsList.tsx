import { ConversationT } from '../../types';
import { formatConversationTime } from '../../shared/utils/dates';
import { ui } from '../../shared/ui';
import { IconUsers, IconVolumeOff } from '../../atoms';
import { ListSkeleton } from './ListSkeleton';

export const ConversationsList = (props: {
  onConversationSelect: (conversationId: string) => void;
  activeConversationId?: string | null;
  unreadCounts: Record<string, number>;
  conversations: ConversationT[];
  isLoading: boolean;
  refreshing?: boolean;
  isBlocked?: (userId?: string | null) => boolean;
  onCreateGroup?: () => void;
}) => {
  const { conversations, isLoading } = props;
  const showSkeleton = isLoading || Boolean(props.refreshing);

  return (
    <div className='flex flex-col'>
      {showSkeleton ? (
        <ListSkeleton
          withAction={Boolean(props.onCreateGroup)}
          rows={Math.max(conversations.length, 5)}
        />
      ) : props.onCreateGroup ? (
        <div className='px-2 pt-2'>
          <button
            type='button'
            onClick={props.onCreateGroup}
            className={`${ui.btnSecondary} gap-2 text-[13px]`}
          >
            <IconUsers size={16} />
            New group
          </button>
        </div>
      ) : null}
      {showSkeleton ? null : conversations.length === 0 ? (
        <div className='flex items-center justify-center px-6 py-10 text-center text-[13px] text-slate-400'>
          No chats yet. Add friends to start messaging.
        </div>
      ) : (
        <div className='space-y-0.5 p-2'>
          {conversations.map((conv) => {
            const isGroup = conv.type === 'group';
            const blocked = !isGroup && Boolean(props.isBlocked?.(conv.otherUserId));
            const isActive = props.activeConversationId === conv.id;

            return (
              <button
                key={conv.id}
                onClick={() => props.onConversationSelect(conv.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors ${
                  isActive ? 'bg-indigo-600' : 'hover:bg-slate-800/80'
                }`}
              >
                {conv.otherUserAvatar ? (
                  <img
                    src={conv.otherUserAvatar}
                    alt={conv.otherUserNickname}
                    className={`${ui.avatar} ${blocked ? 'opacity-70' : ''}`}
                  />
                ) : (
                  <div
                    className={`${ui.avatarFallback} ${
                      isGroup ? 'bg-indigo-600 text-white' : ''
                    }`}
                  >
                    {conv.otherUserNickname.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <div className={`${ui.name} min-w-0 flex-1`}>
                      {conv.otherUserNickname}
                    </div>
                    {conv.muted && (
                      <span
                        title='Muted'
                        className={`flex-shrink-0 ${
                          isActive ? 'text-indigo-100' : 'text-slate-400'
                        }`}
                      >
                        <IconVolumeOff size={14} />
                        <span className='sr-only'>Muted</span>
                      </span>
                    )}
                    {conv.lastMessageTime && (
                      <div
                        className={`ml-auto flex-shrink-0 text-[11px] ${
                          isActive ? 'text-indigo-100' : 'text-slate-500'
                        }`}
                      >
                        {formatConversationTime(conv.lastMessageTime)}
                      </div>
                    )}
                  </div>
                  {(isGroup || blocked) && (
                    <div
                      className={`mt-0.5 text-[12px] ${
                        isActive ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      {isGroup ? 'Group' : 'Blocked'}
                    </div>
                  )}
                </div>
                {props.unreadCounts[conv.id] > 0 &&
                  props.activeConversationId !== conv.id && (
                    <div className='flex min-w-[1.25rem] items-center justify-center rounded-full bg-indigo-600 px-1.5 py-0.5 text-[11px] font-semibold text-white'>
                      {props.unreadCounts[conv.id]}
                    </div>
                  )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
