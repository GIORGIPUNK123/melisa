import { ConversationT } from '../../types';
import { formatConversationTime } from '../../shared/utils/dates';

export const ConversationsList = (props: {
  onConversationSelect: (conversationId: string) => void;
  activeConversationId?: string | null;
  unreadCounts: Record<string, number>;
  conversations: ConversationT[];
  isLoading: boolean;
  isBlocked?: (userId?: string | null) => boolean;
}) => {
  const { conversations, isLoading } = props;

  return (
    <div className='flex flex-col h-full'>
      {isLoading ? (
        <div className='flex items-center justify-center py-8 text-slate-400'>
          Loading chats...
        </div>
      ) : conversations.length === 0 ? (
        <div className='flex items-center justify-center py-8 text-sm text-slate-400'>
          No chats yet. Add friends to start chatting!
        </div>
      ) : (
        <div className='flex-1 p-2 space-y-1 overflow-y-auto'>
          {conversations.map((conv) => {
            const blocked = Boolean(props.isBlocked?.(conv.otherUserId));
            const isActive = props.activeConversationId === conv.id;

            return (
            <button
              key={conv.id}
              onClick={() => props.onConversationSelect(conv.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                isActive
                  ? 'bg-indigo-600'
                  : 'hover:bg-slate-800'
              }`}
            >
              {conv.otherUserAvatar ? (
                <img
                  src={conv.otherUserAvatar}
                  alt={conv.otherUserNickname}
                  className={`flex-shrink-0 object-cover w-10 h-10 rounded-full ${
                    blocked ? 'opacity-70' : ''
                  }`}
                />
              ) : (
                <div className='flex items-center justify-center flex-shrink-0 w-10 h-10 text-sm font-semibold text-slate-100 rounded-full bg-slate-700'>
                  {conv.otherUserNickname.charAt(0).toUpperCase()}
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <div className='font-medium text-white truncate'>
                    {conv.otherUserNickname}
                  </div>
                  {conv.lastMessageTime && (
                    <div
                      className={`ml-auto flex-shrink-0 text-[11px] ${
                        isActive ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      {formatConversationTime(conv.lastMessageTime)}
                    </div>
                  )}
                </div>
                {blocked && (
                  <div
                    className={`text-xs truncate ${
                      isActive ? 'text-indigo-100' : 'text-slate-400'
                    }`}
                  >
                    Blocked
                  </div>
                )}
              </div>
              {props.unreadCounts[conv.id] > 0 &&
                props.activeConversationId !== conv.id && (
                <div className='flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full min-w-[1.5rem]'>
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
