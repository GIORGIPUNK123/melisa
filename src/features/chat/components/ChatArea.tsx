import { MessageT, PublicProfileT, ConversationT } from '../../../types';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { useMessages } from '../hooks/useMessages';
import { useMessageReactions } from '../hooks/useMessageReactions';
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
  isBlocked?: (userId?: string | null) => boolean;
  isBlockedBy?: (userId?: string | null) => boolean;
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
  isBlocked,
  isBlockedBy,
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

  const { catalog, chipsByMessageId, toggleHeart, setReaction, removeMyReaction } =
    useMessageReactions(conversationId, currentUserId);

  const otherUser = members.find(
    (member) => !sameId(member.id, currentUserId),
  );
  const blockedByMe = Boolean(otherUser && isBlocked?.(otherUser.id));
  const blockedMe = Boolean(otherUser && isBlockedBy?.(otherUser.id));
  const messagingBlocked = blockedByMe || blockedMe;

  const handleSend = async (text: string) => {
    if (messagingBlocked) return;
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

      <div className='min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4 md:p-6'>
        <MessageList
          messages={messages}
          members={members}
          currentUserId={currentUserId}
          isLoading={isLoading}
          catalog={catalog}
          chipsByMessageId={chipsByMessageId}
          onToggleHeart={messagingBlocked ? undefined : toggleHeart}
          onSetReaction={messagingBlocked ? undefined : setReaction}
          onRemoveMyReaction={messagingBlocked ? undefined : removeMyReaction}
        />
      </div>

      {messagingBlocked && (
        <div className='border-t border-slate-800 px-4 py-2 text-center text-sm text-slate-400'>
          {blockedByMe
            ? 'You blocked this user. Unblock them to send messages.'
            : "You can't message this user."}
        </div>
      )}

      <MessageInput
        onSubmit={handleSend}
        disabled={messagingBlocked}
        placeholder={
          blockedByMe
            ? 'You blocked this user'
            : blockedMe
              ? "You can't message this user"
              : 'Type a message...'
        }
      />
    </div>
  );
};
