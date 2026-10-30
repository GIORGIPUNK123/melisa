import { useRef, useEffect } from 'react';
import { Message } from './Message';
import { MessageT } from '../../../types';
import { ChatFilePayload } from '../utils/chatFiles';

export const MessageList = (props: {
  messages: MessageT[];
  userId: string;
  openFile: (payload: ChatFilePayload) => Promise<Blob>;
}) => {
  const { messages, userId } = props;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <div ref={scrollContainerRef} className='overflow-y-auto flex-1 w-full'>
      <div className='p-4 space-y-1 text-sm'>
        {messages.map((msg, index) => {
          const owner = msg.sender.id === userId;
          const prevMsg = messages[index - 1];
          const isSameSender = prevMsg && prevMsg.sender.id === msg.sender.id;

          return (
            <div
              key={msg.id || index}
              className={`flex ${owner ? 'justify-end' : 'justify-start items-end'} ${
                isSameSender ? 'mb-1' : 'mb-3'
              }`}
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
                openFile={props.openFile}
                isSameSender={isSameSender}
              />
            </div>
          );
        })}

        <div ref={messagesEndRef} className='clear-both h-0' />
      </div>
    </div>
  );
};
