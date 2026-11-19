import { useEffect, useRef, useState } from 'react';
import { FaceSlightlySmilingPlus } from 'lucide-react';
import { MessageReactionT, ReactionTypeT } from '../../../types';

export interface GroupedReaction {
  reactionId: string;
  userReactionId?: string;
  emoji: string;
  name: string;
  count: number;
  hasReacted: boolean;
  userIds: string[];
}

export const ReactionPicker = (props: {
  catalog: ReactionTypeT[];
  selectedReactionId?: string;
  onSelect: (reactionId: string) => void;
  up?: boolean;
}) => {
  const { catalog, selectedReactionId, onSelect, up } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(true);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect();

      // Finds the scrollable MessageList parent, or falls back to the viewport top (0)
      const scrollContainer = pickerRef.current.closest(
        '.overflow-y-auto, .overflow-auto, .overflow-y-scroll',
      );
      const containerTop = scrollContainer
        ? scrollContainer.getBoundingClientRect().top
        : 0;

      const spaceAbove = rect.top - containerTop;

      // Your menu has p-1.5 + p-1.5 + text-base (~44px) + mb-2 (8px) = ~56px
      setOpenUp(spaceAbove >= 60);
    }

    setIsOpen((open) => !open);
  };

  const handleSelect = (reactionId: string) => {
    onSelect(reactionId);
    setIsOpen(false);
  };

  // Use manual `up` prop if explicitly passed, otherwise use auto-calculated `openUp`
  const shouldOpenUp = up ?? openUp;

  return (
    <div
      className='inline-flex relative justify-center items-center'
      ref={pickerRef}
    >
      <button
        type='button'
        aria-label='Add reaction'
        aria-haspopup='menu'
        aria-expanded={isOpen}
        onClick={handleToggle}
        className={`flex items-center justify-center rounded-lg p-2 transition-colors cursor-pointer hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
          selectedReactionId
            ? 'text-primary'
            : 'text-muted hover:text-foreground'
        }`}
      >
        <FaceSlightlySmilingPlus size={20} />
      </button>

      {isOpen && (
        <div
          role='menu'
          aria-label='Choose a reaction'
          className={`pr-px absolute ${shouldOpenUp ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 z-20 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-xl border border-border-strong bg-panel/95 p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur`}
        >
          {catalog.map((reaction) => (
            <button
              key={reaction.uid}
              type='button'
              role='menuitem'
              title={reaction.name}
              aria-label={`React with ${reaction.name}`}
              aria-pressed={selectedReactionId === reaction.uid}
              onClick={() => handleSelect(reaction.uid)}
              className={`flex items-center justify-center rounded-full p-1.5 text-base transition-all duration-150 cursor-pointer hover:scale-110 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                selectedReactionId === reaction.uid
                  ? 'scale-110 bg-primary-soft ring-1 ring-primary/40'
                  : ''
              }`}
            >
              {reaction.reaction}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const ReactionBadges = (props: {
  reactions: GroupedReaction[];
  onToggle: (reactionId: string) => void;
}) => {
  const { reactions, onToggle } = props;

  if (reactions.length === 0) return null;

  return (
    <div className='flex flex-wrap gap-1 px-1 text-xs select-none'>
      {reactions.map((reaction) => (
        <button
          key={reaction.reactionId}
          type='button'
          onClick={() => onToggle(reaction.reactionId)}
          title={reaction.name}
          aria-pressed={reaction.hasReacted}
          className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
            reaction.hasReacted
              ? 'border-primary/40 bg-primary-soft text-primary'
              : 'border-border-strong bg-surface/80 text-muted hover:bg-surface-hover hover:text-foreground'
          }`}
        >
          <span>{reaction.emoji}</span>
          {reaction.count > 1 && (
            <span className='text-[11px] font-semibold text-foreground'>
              {reaction.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export const groupReactions = (
  reactions: MessageReactionT[],
  catalog: ReactionTypeT[],
  currentUserId?: string,
): GroupedReaction[] => {
  const grouped = new Map<string, GroupedReaction>();

  for (const reaction of reactions) {
    const catalogItem = catalog.find(
      (item) => item.uid === reaction.reaction_id,
    );
    const emoji = catalogItem?.reaction || reaction.reaction?.reaction || '👍';
    const name = catalogItem?.name || reaction.reaction?.name || '';
    const isMine = reaction.user_id === currentUserId;
    const existing = grouped.get(reaction.reaction_id);

    if (existing) {
      existing.count += 1;
      existing.userIds.push(reaction.user_id);
      if (isMine) {
        existing.hasReacted = true;
        existing.userReactionId = reaction.id;
      }
      continue;
    }

    grouped.set(reaction.reaction_id, {
      reactionId: reaction.reaction_id,
      userReactionId: isMine ? reaction.id : undefined,
      emoji,
      name,
      count: 1,
      hasReacted: isMine,
      userIds: [reaction.user_id],
    });
  }

  return Array.from(grouped.values());
};
