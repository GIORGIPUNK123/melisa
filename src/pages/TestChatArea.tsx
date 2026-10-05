import { Loading } from '../components/Loading';
import { useAuth } from '../features/auth/hooks/useAuth';
import { EmptyChatState } from '../features/chat/components/EmptyChatState';
import { ConversationT } from '../types';
import { Message } from '../features/chat/components/Message';
import { useTestMessages } from './useTestMessages';

export const TestChatArea = (props: { conversation?: ConversationT }) => {
  const { conversation } = props;
  if (!conversation) {
    return <EmptyChatState />;
  }
  const { messages } = useTestMessages(conversation.id);
  const { user } = useAuth();
  if (user === 'loading' || user === null) {
    return <Loading />;
  }
  return (
    <div className='flex flex-col h-full w-full bg-[#080D14]'>
      <div className='flex items-center justify-between h-[60px] px-4 border-b-[1px] border-solid border-[#3d464fc7]'>
        <span className='font-semibold text-white'>{conversation.name}</span>
        <span className='text-[#56687B] text-sm'>
          {conversation.lastMessageTime}
        </span>
      </div>
      <div className='flex-1 p-4 overflow-y-auto'>
        <div className='text-sm'>
          {messages.map((msg, _) => {
            const owner = msg.sender.id === user.id;
            return (
              <div
                key={_}
                className={`flex items-center ${owner ? 'justify-end' : 'justify-start'} mb-2`}
              >
                {!owner && (
                  <div className='w-8 h-8 rounded-full bg-[#274D49] mr-2 flex items-center justify-center text-white'>
                    {msg.sender.nickname.charAt(0).toLocaleUpperCase()}
                  </div>
                )}
                <Message message={msg} owner={owner} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
