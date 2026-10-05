import { Message } from './Message';
import { MessageT } from '../../../types';

export const MessageList = (props: {
  messages: MessageT[];
  userId: string;
}) => {
  const { messages, userId } = props;
  return (
    <div className='flex-1 w-full p-4 overflow-y-auto'>
      <div className='text-sm'>
        {messages.map((msg, _) => {
          const owner = msg.sender.id === userId;
          return (
            <div
              key={_}
              className={`flex  ${owner ? 'justify-end' : 'justify-start items-end'} mb-2`}
            >
              {!owner && (
                <div className='mb-2 w-8 h-8 rounded-full bg-[#274D49] mr-2 flex items-center justify-center text-white'>
                  {msg.sender.nickname.charAt(0).toLocaleUpperCase()}
                </div>
              )}
              <Message message={msg} owner={owner} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
