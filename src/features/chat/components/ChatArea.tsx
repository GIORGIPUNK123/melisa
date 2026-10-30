// import { Loading } from '../../../components/Loading';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { EmptyChatState } from '../../../features/chat/components/EmptyChatState';
import { ConversationT } from '../../../types';
import { useTestMessages } from './../../../pages/useTestMessages';
import { MessageList } from './MessageList';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { ChatInfo } from './ChatInfo';
import { useState } from 'react';
import { usePresenceStore } from '../../../store/usePresenceStore';

export const ChatArea = (props: { conversation?: ConversationT }) => {
  const { conversation } = props;

  // 1. All hooks must be called at the top level
  const { messages, openChatFile, sendMessage, toggleMute } = useTestMessages(
    conversation?.id ?? '',
  );
  const { user } = useAuth();
  const [chatInfoOpen, setChatInfoOpen] = useState(false);
  const onlineUserIds = usePresenceStore((state) => state.onlineUserIds);

  // 2. Conditional return comes AFTER all hooks
  if (!conversation) {
    return <EmptyChatState />;
  }

  const otherConversationMembers = conversation.conversationMembers.filter(
    (m) => m.id !== user!.id,
  );

  return (
    <div className='w-full bg-[#080D14] flex '>
      <div className='flex flex-col w-full h-full'>
        <ChatHeader
          onlineUserIds={onlineUserIds}
          otherConversationMembers={otherConversationMembers}
          toggle={() => setChatInfoOpen(!chatInfoOpen)}
          conversation={conversation}
        />
        <MessageList
          messages={messages}
          userId={user!.id}
          openFile={openChatFile}
        />
        <MessageInput
          onSubmit={(message) => {
            sendMessage(message);
          }}
        />
      </div>
      <ChatInfo
        onlineUserIds={onlineUserIds}
        otherConversationMembers={otherConversationMembers}
        isOpen={chatInfoOpen}
        setOpen={setChatInfoOpen}
        conversation={conversation}
        toggleMute={toggleMute}
      />
    </div>
  );
};
