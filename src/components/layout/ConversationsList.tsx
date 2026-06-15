import { ConversationT } from '../../types';

export const ConversationsList = (props: {
  onConversationSelect: (conversationId: string) => void;
  activeConversationId?: string | null;
  unreadCounts: Record<string, number>;
  conversations: ConversationT[];
  isLoading: boolean;
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
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => props.onConversationSelect(conv.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                props.activeConversationId === conv.id
                  ? 'bg-indigo-600'
                  : 'hover:bg-slate-800'
              }`}
            >
              {conv.otherUserAvatar ? (
                <img
                  src={conv.otherUserAvatar}
                  alt={conv.otherUserNickname}
                  className='flex-shrink-0 object-cover w-10 h-10 rounded-full'
                />
              ) : (
                <div className='flex items-center justify-center flex-shrink-0 w-10 h-10 text-sm font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
                  {conv.otherUserNickname.charAt(0).toUpperCase()}
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <div
                  className={`font-medium truncate ${
                    props.activeConversationId === conv.id
                      ? 'text-white'
                      : 'text-white'
                  }`}
                >
                  {conv.otherUserNickname}
                </div>
              </div>
              {props.unreadCounts[conv.id] > 0 && (
                <div className='flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full min-w-[1.5rem]'>
                  {props.unreadCounts[conv.id]}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
