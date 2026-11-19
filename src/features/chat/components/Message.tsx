import { Reply } from 'lucide-react';
import { useMemo } from 'react';
import { MessageReactionT, MessageT, ReactionTypeT } from '../../../types';
import { ChatAttachment } from './ChatAttachment';
import { ChatFilePayload, readChatFile } from '../utils/chatFiles';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  groupReactions,
  ReactionBadges,
  ReactionPicker,
} from './MessageReactions';

export const Message = (props: {
  message: MessageT;
  owner: boolean;
  openFile: (payload: ChatFilePayload) => Promise<Blob>;
  isSameSender?: boolean;
  conversationId: number;
  catalog: ReactionTypeT[];
  reactions: MessageReactionT[];
  onToggleReaction?: (reactionId: string) => void;
}) => {
  const {
    owner,
    openFile,
    message: msg,
    isSameSender,
    catalog,
    reactions,
    onToggleReaction,
  } = props;

  const { user } = useAuthStore();
  const file = readChatFile(msg.content);
  const viewableImage =
    file && !file.group && file.kind === 'image' ? file : null;

  const groupedReactions = useMemo(
    () => groupReactions(reactions, catalog, user?.id),
    [reactions, catalog, user?.id],
  );

  const myReactionId = reactions.find(
    (r) => r.user_id === user?.id,
  )?.reaction_id;

  return (
    <div
      className={`flex items-end mb-1 ${
        owner ? 'justify-end' : 'justify-start'
      }`}
    >
      <div className={`flex flex-col gap-1 ${owner ? 'items-end' : ''}`}>
        {!isSameSender && (
          <span className='px-1 text-xs text-muted'>
            {owner ? 'You' : msg.sender.nickname}
          </span>
        )}

        <div
          className={`flex gap-2 items-center ${owner ? 'flex-row-reverse' : ''}`}
        >
          {/* Message Content Bubble */}
          <div
            className={`break-words max-w-2xl shrink px-3 py-2 rounded-md flex justify-center text-xs text-foreground ${
              owner ? 'bg-primary/25' : 'bg-surface'
            }`}
          >
            {viewableImage ? (
              <ChatAttachment payload={viewableImage} openFile={openFile} />
            ) : (
              <span className='text-sm whitespace-pre-wrap text-foreground'>
                {msg.content}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex gap-1 items-center'>
            <ReactionPicker
              catalog={catalog}
              selectedReactionId={myReactionId}
              onSelect={(reactionId) => onToggleReaction?.(reactionId)}
            />

            {/* Reply Button */}
            <button
              type='button'
              aria-label='Reply to message'
              className='flex justify-center items-center p-2 rounded-md transition-colors cursor-pointer hover:bg-surface-hover focus:outline-none text-muted-foreground hover:text-foreground'
            >
              <Reply size={20} />
            </button>
          </div>
        </div>

        {/* Reaction Badges with Counts */}
        <ReactionBadges
          reactions={groupedReactions}
          onToggle={(reactionId) => onToggleReaction?.(reactionId)}
        />
      </div>
    </div>
  );
};
