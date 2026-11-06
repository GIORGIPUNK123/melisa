import { useRef, useEffect } from 'react';
import { Message } from './Message';
import { MessageReactionT, MessageT, ReactionTypeT } from '../../../types';
import { ChatFilePayload } from '../utils/chatFiles';

export const MessageList = (props: {
  messages: MessageT[];
  userId: string;
  openFile: (payload: ChatFilePayload) => Promise<Blob>;
  conversationId: number;
  catalog: ReactionTypeT[];
  reactions: MessageReactionT[];
  onToggleReaction: (
    userId: string,
    conversationId: number,
    messageId: string,
    reactionId: string,
  ) => void;
}) => {
  const {
    messages,
    userId,
    catalog,
    openFile,
    conversationId,
    reactions,
    onToggleReaction,
  } = props;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messageContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    };

    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(scrollToBottom);
    });

    const observer = new ResizeObserver(scrollToBottom);
    if (messageContentRef.current) {
      observer.observe(messageContentRef.current);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [messages]);

  return (
    <div
      ref={scrollContainerRef}
      className='overflow-y-auto flex-1 w-full min-h-0'
    >
      <div ref={messageContentRef} className='p-4 space-y-1 text-sm'>
        {messages.map((msg, index) => {
          const owner = msg.sender.id === userId;
          const prevMsg = messages[index - 1];
          const isSameSender = prevMsg && prevMsg.sender.id === msg.sender.id;

          return (
            <div
              key={msg.id || index}
              className={`flex ${
                owner ? 'justify-end' : 'justify-start items-end'
              } ${isSameSender ? 'mb-1' : 'mb-3'}`}
            >
              {!owner && (
                <div className='flex-shrink-0 mr-2 w-8'>
                  {!isSameSender ? (
                    <div className='w-8 h-8 rounded-full bg-[#274D49] flex items-center justify-center text-white'>
                      {msg.sender.nickname.charAt(0).toLocaleUpperCase()}
                    </div>
                  ) : (
                    <div className='w-8' />
                  )}
                </div>
              )}

              <Message
                message={msg}
                owner={owner}
                openFile={openFile}
                isSameSender={isSameSender}
                conversationId={conversationId}
                catalog={catalog}
                reactions={reactions.filter((r) => r.message_id === msg.id)}
                onToggleReaction={(reactionId) =>
                  onToggleReaction(userId, conversationId, msg.id, reactionId)
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
