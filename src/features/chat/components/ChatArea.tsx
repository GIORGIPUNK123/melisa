import { MessageT, PublicProfileT, ConversationT } from '../../../types';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { useMessages } from '../hooks/useMessages';
import { decryptChatMessageContent as cryptoDecrypt } from '../utils/chatCrypto';
import { MessageInput } from './MessageInput';
import { sameId } from '../../../shared/utils/ids';

interface Props {
  conversationId: string;
  currentUserId: string;
  onToggleSidebar?: () => void;
  onToggleChatInfo?: () => void;
  privateKey: string;
  members: PublicProfileT[];
  conversationPreview?: ConversationT;
  onConversationActivity?: (conversationId: string) => void;
  onIncomingMessageSound?: () => void;
}

export const ChatArea = ({
  conversationId,
  currentUserId,
  onToggleSidebar,
  onToggleChatInfo,
  privateKey,
  members,
  conversationPreview,
  onConversationActivity,
  onIncomingMessageSound,
}: Props) => {
  const handleIncomingMessage = (message: MessageT) => {
    onConversationActivity?.(message.conversation_id);
    if (!sameId(message.sender_id, currentUserId)) {
      onIncomingMessageSound?.();
    }
  };

  const { messages, isLoading, sendMessage } = useMessages(
    conversationId,
    members,
    currentUserId,
    privateKey,
    async (args) => cryptoDecrypt(args),
    handleIncomingMessage,
  );

  const handleSend = async (text: string) => {
    onConversationActivity?.(conversationId);
    await sendMessage(text);
  };

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col bg-slate-900'>
      <ChatHeader
        members={members}
        currentUserId={currentUserId}
        onToggleSidebar={onToggleSidebar!}
        onToggleChatInfo={onToggleChatInfo!}
        fallbackName={conversationPreview?.otherUserNickname}
        fallbackAvatar={conversationPreview?.otherUserAvatar}
      />

      <div className='min-h-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-6'>
        <MessageList
          messages={messages}
          members={members}
          currentUserId={currentUserId}
          isLoading={isLoading}
        />
      </div>

      <MessageInput onSubmit={handleSend} />
    </div>
  );
};
