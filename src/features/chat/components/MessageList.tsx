import { useEffect, useRef } from 'react';
import { MessageT, PublicProfileT } from '../../../types';
import { sameId } from '../../../shared/utils/ids';

interface MessageListProps {
  messages: MessageT[];
  members: PublicProfileT[];
  currentUserId?: string;
  isLoading: boolean;
}

export const MessageList = ({
  messages,
  members,
  currentUserId,
  isLoading,
}: MessageListProps) => {
  // 1. Create a reference anchor to attach to the bottom element
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // 2. Snap instantly to the bottom when the message room first completely finishes loading
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      scrollToBottom('auto');
    }
  }, [isLoading]);

  // 3. Smoothly animate down when the live message count changes (new messages incoming)
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages.length]);

  const showSkeleton = isLoading && messages.length === 0;

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
                  <div className='w-24 h-3 mb-2 rounded bg-slate-600/70' />
                )}
                <div className='space-y-2'>
                  <div className='w-5/6 h-3 rounded bg-slate-600/70' />
                  <div className='w-2/3 h-3 rounded bg-slate-600/70' />
                </div>
                <div className='w-20 h-2 mt-3 rounded bg-slate-700/70' />
              </div>
            </div>
          );
        })}
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
          className={`flex gap-2 ${sameId(msg.sender_id, currentUserId) ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[75%] sm:max-w-sm md:max-w-md rounded-lg px-3 py-2 ${
              sameId(msg.sender_id, currentUserId)
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-100'
            }`}
          >
            {!sameId(msg.sender_id, currentUserId) && (
              <div className='mb-1 text-xs font-semibold text-slate-400'>
                {members.find((m) => sameId(m.id, msg.sender_id))?.nickname ||
                  members.find((m) => sameId(m.id, msg.sender_id))?.username ||
                  'Unknown'}
              </div>
            )}
            <p className='text-sm break-words'>{msg.content}</p>
            <div className='mt-1 text-xs opacity-70'>
              {new Date(msg.created_at).toLocaleTimeString([], {
                timeStyle: 'short',
              })}
            </div>
          </div>
        </div>
      ))}

      {/* 4. Target anchor placed perfectly at the absolute end of our fragment view */}
      <div ref={messagesEndRef} />
    </>
  );
};
