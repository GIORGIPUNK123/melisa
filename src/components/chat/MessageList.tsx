import { MessageT, PublicProfileT } from '../../types';

interface MessageListProps {
  messages: MessageT[];
  members: PublicProfileT[];
  currentUserId?: string;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const MessageList = ({
  messages,
  members,
  currentUserId,
  isLoading,
  messagesEndRef,
}: MessageListProps) => {
  const showSkeleton = isLoading || (messages.length > 0 && members.length === 0);

  if (showSkeleton) {
    return (
      <div className='space-y-4'>
        {Array.from({ length: 5 }).map((_, index) => {
          const isSelfMessage = index % 2 === 1;

          return (
            <div
              key={index}
              className={`flex gap-2 ${isSelfMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`w-full max-w-[75%] sm:max-w-sm md:max-w-md rounded-lg px-3 py-3 animate-pulse ${
                  isSelfMessage ? 'bg-indigo-600/40' : 'bg-slate-800/80'
                }`}
              >
                {!isSelfMessage && (
                  <div className='mb-2 h-3 w-24 rounded bg-slate-600/70' />
                )}
                <div className='space-y-2'>
                  <div className='h-3 w-5/6 rounded bg-slate-600/70' />
                  <div className='h-3 w-2/3 rounded bg-slate-600/70' />
                </div>
                <div className='mt-3 h-2 w-20 rounded bg-slate-700/70' />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full text-slate-400'>
        Loading messages...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className='flex items-center justify-center h-full text-slate-400'>
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-2 ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[75%] sm:max-w-sm md:max-w-md rounded-lg px-3 py-2 ${
              msg.sender_id === currentUserId
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-100'
            }`}
          >
            {msg.sender_id !== currentUserId && (
              <div className='mb-1 text-xs font-semibold text-slate-400'>
                {members.find((m) => m.id === msg.sender_id)?.nickname ||
                  members.find((m) => m.id === msg.sender_id)?.username ||
                  'Unknown'}
              </div>
            )}
            <p className='text-sm break-words'>{msg.content}</p>
            <div className='mt-1 text-xs opacity-70'>
              {new Date(msg.created_at).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </>
  );
};
