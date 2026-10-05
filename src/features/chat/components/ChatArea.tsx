import { Loading } from '../../../components/Loading';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { EmptyChatState } from '../../../features/chat/components/EmptyChatState';
import { ConversationT } from '../../../types';
import { useTestMessages } from './../../../pages/useTestMessages';
import { MessageList } from './MessageList';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { ChatInfo } from './ChatInfo';
import { useState } from 'react';

export const ChatArea = (props: { conversation?: ConversationT }) => {
  const { conversation } = props;
  if (!conversation) {
    return <EmptyChatState />;
  }
  const { messages } = useTestMessages(conversation.id);
  const { user } = useAuth();
  const [chatInfoOpen, setChatInfoOpen] = useState(false);
  return (
    <div className='w-full bg-[#080D14] flex '>
      {user === 'loading' || user === null ? (
        <Loading />
      ) : (
        <>
          <div className='flex flex-col w-full h-full'>
            <ChatHeader
              toggle={() => setChatInfoOpen(!chatInfoOpen)}
              conversation={conversation}
            />
            <MessageList messages={messages} userId={user.id} />
            <MessageInput
              onSubmit={(message) => {
                console.log('message: ', message);
              }}
            />
          </div>
          <ChatInfo
            userId={user.id}
            isopen={chatInfoOpen}
            setopen={setChatInfoOpen}
            conversation={conversation}
          />
        </>
      )}
    </div>
  );
};
