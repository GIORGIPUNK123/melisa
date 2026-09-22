import { MessageT, PublicProfileT, ConversationT } from '../../../types';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { useMessages } from '../hooks/useMessages';
import { useMessageReactions } from '../hooks/useMessageReactions';
import { decryptChatMessageContent as cryptoDecrypt } from '../utils/chatCrypto';
import { MessageInput } from './MessageInput';
import { BlockedComposer } from './BlockedComposer';
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
  onIncomingMessageSound?: (conversationId: string) => void;
  muted?: boolean;
  muteAvailable?: boolean;
  muteSaving?: boolean;
  muteError?: string | null;
  onToggleMute?: () => void;
  isBlocked?: (userId?: string | null) => boolean;
  isBlockedBy?: (userId?: string | null) => boolean;
  onUnblockUser?: (username: string, userId?: string) => void;
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
  muted = false,
  muteAvailable = true,
  muteSaving = false,
  muteError,
  onToggleMute,
  isBlocked,
  isBlockedBy,
  onUnblockUser,
}: Props) => {
  const handleIncomingMessage = (message: MessageT) => {
    onConversationActivity?.(message.conversation_id);
    if (!sameId(message.sender_id, currentUserId)) {
      onIncomingMessageSound?.(message.conversation_id);
    }
  };

  const { messages, isLoading, sendMessage } = useMessages(
    conversationId,
    members,
    currentUserId,
    privateKey,
    async (args) => cryptoDecrypt(args),
    handleIncomingMessage,
    conversationPreview?.type,
  );

  const { catalog, chipsByMessageId, toggleHeart, setReaction, removeMyReaction } =
    useMessageReactions(conversationId, currentUserId);

  const otherUser = members.find(
    (member) => !sameId(member.id, currentUserId),
  );
  const isGroup = conversationPreview?.type === 'group';
  const otherUserId = isGroup
    ? undefined
    : otherUser?.id || conversationPreview?.otherUserId;
  const blockedByMe = Boolean(otherUserId && isBlocked?.(otherUserId));
  const blockedMe = Boolean(otherUserId && isBlockedBy?.(otherUserId));
  const messagingBlocked = !isGroup && (blockedByMe || blockedMe);

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
        isGroup={isGroup}
        memberCount={members.length}
        blockedByMe={blockedByMe}
        muted={muted}
        muteAvailable={muteAvailable}
        muteSaving={muteSaving}
        muteError={muteError}
        onToggleMute={onToggleMute}
      />

      <div className='min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-5 sm:py-4'>
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

      {messagingBlocked ? (
        <BlockedComposer
          blockedByMe={blockedByMe}
          onUnblock={
            blockedByMe && otherUserId
              ? () =>
                  onUnblockUser?.(
                    otherUser?.username ||
                      conversationPreview?.otherUserNickname ||
                      'this user',
                    otherUserId,
                  )
              : undefined
          }
        />
      ) : (
        <MessageInput onSubmit={handleSend} />
      )}
    </div>
  );
};
