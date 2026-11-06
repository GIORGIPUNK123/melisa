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
}) => {
  const { catalog, selectedReactionId, onSelect } = props;
  const [isOpen, setIsOpen] = useState(false);
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

  const handleSelect = (reactionId: string) => {
    onSelect(reactionId);
    setIsOpen(false);
  };

  return (
    <div
      className='inline-flex relative justify-center items-center'
      ref={pickerRef}
    >
      <button
        type='button'
        aria-label='Add reaction'
        onClick={() => setIsOpen((open) => !open)}
        className='p-2 rounded-md hover:bg-[#162231] cursor-pointer flex items-center justify-center focus:outline-none transition-colors text-gray-300 hover:text-white'
      >
        <FaceSlightlySmilingPlus size={20} />
      </button>

      {isOpen && (
        <div className='absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 p-1.5 bg-[#1e2d3d]/90 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg'>
          {catalog.map((reaction) => (
            <button
              key={reaction.uid}
              type='button'
              title={reaction.name}
              aria-label={`React with ${reaction.name}`}
              onClick={() => handleSelect(reaction.uid)}
              className={`p-1.5 rounded-full hover:bg-[#2c3e50] hover:scale-125 transition-transform duration-150 cursor-pointer flex items-center justify-center text-base ${
                selectedReactionId === reaction.uid
                  ? 'bg-[#274D49] scale-125'
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
          className={`px-2 py-0.5 rounded-full flex items-center gap-1 text-xs border transition-all cursor-pointer ${
            reaction.hasReacted
              ? 'bg-[#274D49]/80 border-[#3d7570] text-white'
              : 'bg-[#162231]/80 border-gray-700/60 text-gray-300 hover:bg-[#1e2d3d]'
          }`}
        >
          <span>{reaction.emoji}</span>
          {reaction.count > 1 && (
            <span className='font-semibold text-[11px]'>{reaction.count}</span>
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
