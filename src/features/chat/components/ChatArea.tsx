import { useAuth } from '../../../features/auth/hooks/useAuth';
import { EmptyChatState } from '../../../features/chat/components/EmptyChatState';
import { ConversationT } from '../../../types';
import { useMessages } from '../hooks/useMessages';
import { MessageList } from './MessageList';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { ChatInfo } from './ChatInfo';
import { useState } from 'react';
import { usePresenceStore } from '../../../store/usePresenceStore';
import { useMessageReactions } from '../hooks/useMessageReactions';

export const ChatArea = (props: {
  conversation?: ConversationT;
  onBack?: () => void;
  className?: string;
}) => {
  const { conversation, onBack, className = '' } = props;

  const { messages, openChatFile, sendMessage, toggleMute } = useMessages(
    conversation?.id ?? '',
  );
  const { user } = useAuth();
  const [chatInfoOpen, setChatInfoOpen] = useState(false);
  const onlineUserIds = usePresenceStore((state) => state.onlineUserIds);

  const { catalog, reactions, toggleReaction } = useMessageReactions(
    conversation?.id,
    user?.id ?? '',
  );
  if (!conversation) {
    return <EmptyChatState />;
  }

  const otherConversationMembers = conversation.conversationMembers.filter(
    (m) => m.id !== user!.id,
  );

  return (
    <div
      className={`${className} relative flex h-full min-h-0 w-full min-w-0 overflow-hidden bg-[#080D14]`}
    >
      <div className='flex flex-col w-full min-w-0 h-full min-h-0'>
        <ChatHeader
          onlineUserIds={onlineUserIds}
          otherConversationMembers={otherConversationMembers}
          toggle={() => setChatInfoOpen(!chatInfoOpen)}
          conversation={conversation}
          onBack={onBack}
          isActive={chatInfoOpen}
        />
        <MessageList
          messages={messages}
          userId={user!.id}
          openFile={openChatFile}
          conversationId={conversation.id}
          catalog={catalog}
          reactions={reactions}
          onToggleReaction={toggleReaction}
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
