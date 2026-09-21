import { useEffect, useRef, useState } from 'react';
import {
  MessageT,
  PublicProfileT,
  ReactionChipT,
  ReactionTypeT,
} from '../../../types';
import { sameId } from '../../../shared/utils/ids';
import {
  formatChatDayLabel,
  formatMessageTime,
  isSameLocalDay,
} from '../../../shared/utils/dates';
import {
  hapticLongPress,
  hapticSelection,
} from '../../../shared/utils/haptic';

interface MessageListProps {
  messages: MessageT[];
  members: PublicProfileT[];
  currentUserId?: string;
  isLoading: boolean;
  catalog?: ReactionTypeT[];
  chipsByMessageId?: Map<string, ReactionChipT[]>;
  onToggleHeart?: (messageId: string) => void;
  onSetReaction?: (messageId: string, reactionId: string) => void;
  onRemoveMyReaction?: (messageId: string) => void;
}

const LONG_PRESS_MS = 450;
const MOVE_THRESHOLD_PX = 10;

const ReactionPlusIcon = () => (
  <svg
    viewBox='0 0 20 20'
    fill='none'
    className='h-4 w-4'
    aria-hidden='true'
  >
    <path
      d='M10 4.5v11M4.5 10h11'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
    />
  </svg>
);

export const MessageList = ({
  messages,
  members,
  currentUserId,
  isLoading,
  catalog = [],
  chipsByMessageId,
  onToggleHeart,
  onSetReaction,
  onRemoveMyReaction,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [pickerForMessageId, setPickerForMessageId] = useState<string | null>(
    null,
  );

  const clearLongPress = () => {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    touchStartRef.current = null;
  };

  const openPicker = (messageId: string) => {
    setPickerForMessageId(messageId);
    hapticLongPress();
  };

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      scrollToBottom('auto');
    }
  }, [isLoading]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages.length]);

  useEffect(() => {
    const closePicker = () => setPickerForMessageId(null);
    window.addEventListener('click', closePicker);
    window.addEventListener('touchstart', closePicker);
    return () => {
      window.removeEventListener('click', closePicker);
      window.removeEventListener('touchstart', closePicker);
      clearLongPress();
    };
  }, []);

  const showSkeleton = isLoading && messages.length === 0;

  if (showSkeleton) {
    return (
      <div className='space-y-4'>
        {Array.from({ length: 5 }).map((_, index) => {
          const isSelfMessage = index % 2 === 1;

          return (
            <div
              key={index}
              className={`flex gap-2 ${isSelfMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`w-full max-w-[75%] sm:max-w-sm md:max-w-md rounded-lg px-3 py-3 animate-pulse ${
                  isSelfMessage ? 'bg-indigo-600/40' : 'bg-slate-800/80'
                }`}
              >
                {!isSelfMessage && (
                  <div className='w-24 h-3 mb-2 rounded bg-slate-600/70' />
                )}
                <div className='space-y-2'>
                  <div className='w-5/6 h-3 rounded bg-slate-600/70' />
                  <div className='w-2/3 h-3 rounded bg-slate-600/70' />
                </div>
                <div className='w-20 h-2 mt-3 rounded bg-slate-700/70' />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className='flex items-center justify-center h-full text-slate-400'>
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((msg, index) => {
        const previous = messages[index - 1];
        const showDayLabel =
          !previous || !isSameLocalDay(previous.created_at, msg.created_at);
        const isSelf = sameId(msg.sender_id, currentUserId);
        const chips = chipsByMessageId?.get(msg.id) || [];
        const canReact = !msg.id.startsWith('temp-');
        const pickerOpen = pickerForMessageId === msg.id;

        const addButton =
          canReact && catalog.length > 0 ? (
            <div className='relative flex shrink-0 items-center self-center'>
              <button
                type='button'
                onClick={(event) => {
                  event.stopPropagation();
                  setPickerForMessageId((current) =>
                    current === msg.id ? null : msg.id,
                  );
                }}
                className={`hidden h-7 w-7 items-center justify-center rounded-md text-slate-500 opacity-0 transition-all duration-150 hover:bg-slate-700 hover:text-slate-100 group-hover:opacity-100 md:flex ${
                  pickerOpen
                    ? '!flex !opacity-100 bg-slate-700 text-slate-100'
                    : ''
                }`}
                title='Add reaction'
                aria-label='Add reaction'
              >
                <ReactionPlusIcon />
              </button>
            </div>
          ) : null;

        const picker =
          pickerOpen && canReact && catalog.length > 0 ? (
            <div
              className={`absolute bottom-full z-20 mb-2 flex items-center gap-1 rounded-xl border border-slate-600/60 bg-slate-800/90 px-1.5 py-1.5 shadow-xl backdrop-blur-md ${
                isSelf
                  ? 'reaction-picker-in-right right-0'
                  : 'reaction-picker-in-left left-0'
              }`}
              onClick={(event) => event.stopPropagation()}
              onTouchStart={(event) => event.stopPropagation()}
            >
              {catalog.map((reaction) => (
                <button
                  key={reaction.uid}
                  type='button'
                  onClick={() => {
                    hapticSelection();
                    onSetReaction?.(msg.id, reaction.uid);
                    setPickerForMessageId(null);
                  }}
                  className='flex h-10 w-10 items-center justify-center rounded-lg text-[22px] leading-none transition hover:bg-slate-700/80 hover:scale-110 active:scale-95'
                  title={reaction.name}
                >
                  {reaction.reaction}
                </button>
              ))}
            </div>
          ) : null;

        return (
          <div key={msg.id}>
            {showDayLabel && (
              <div className='flex justify-center py-2'>
                <span className='rounded-full border border-slate-700/80 bg-slate-800/80 px-3 py-1 text-[11px] font-medium text-slate-300'>
                  {formatChatDayLabel(msg.created_at)}
                </span>
              </div>
            )}
          <div
            className={`group flex gap-1.5 py-0.5 ${isSelf ? 'justify-end' : 'justify-start'}`}
          >
            {isSelf && addButton}

            <div
              className={`relative max-w-[75%] sm:max-w-sm md:max-w-md ${
                chips.length ? 'mb-4' : ''
              }`}
            >
              {picker}

              <div
                onDoubleClick={() => {
                  if (canReact) onToggleHeart?.(msg.id);
                }}
                onContextMenu={(event) => {
                  if (canReact) event.preventDefault();
                }}
                onTouchStart={(event) => {
                  if (!canReact || catalog.length === 0) return;
                  const touch = event.touches[0];
                  if (!touch) return;
                  clearLongPress();
                  touchStartRef.current = { x: touch.clientX, y: touch.clientY };
                  longPressTimerRef.current = window.setTimeout(() => {
                    openPicker(msg.id);
                    longPressTimerRef.current = null;
                  }, LONG_PRESS_MS);
                }}
                onTouchMove={(event) => {
                  const start = touchStartRef.current;
                  const touch = event.touches[0];
                  if (!start || !touch) return;
                  const dx = Math.abs(touch.clientX - start.x);
                  const dy = Math.abs(touch.clientY - start.y);
                  if (dx > MOVE_THRESHOLD_PX || dy > MOVE_THRESHOLD_PX) {
                    clearLongPress();
                  }
                }}
                onTouchEnd={clearLongPress}
                onTouchCancel={clearLongPress}
                className={`select-none rounded-2xl px-3 py-2 transition-colors duration-150 [-webkit-touch-callout:none] ${
                  isSelf
                    ? 'bg-indigo-600 text-white group-hover:bg-indigo-500'
                    : 'bg-slate-800 text-slate-100 group-hover:bg-slate-700'
                }`}
              >
                {!isSelf && (
                  <div className='mb-1 text-[12px] font-semibold text-slate-300'>
                    {members.find((m) => sameId(m.id, msg.sender_id))
                      ?.nickname ||
                      members.find((m) => sameId(m.id, msg.sender_id))
                        ?.username ||
                      'Unknown'}
                  </div>
                )}
                <p className='break-words text-[15px] leading-5'>{msg.content}</p>
                <div className='mt-1 text-[11px] opacity-70'>
                  {formatMessageTime(msg.created_at)}
                </div>
              </div>

              {chips.length > 0 && (
                <div
                  className={`absolute -bottom-3.5 flex flex-wrap gap-1 ${
                    isSelf ? 'left-1' : 'right-1'
                  }`}
                >
                  {chips.map((chip) => (
                    <button
                      key={chip.reactionId}
                      type='button'
                      onClick={(event) => {
                        event.stopPropagation();
                        if (!canReact) return;
                        if (chip.reactedByMe) {
                          onRemoveMyReaction?.(msg.id);
                        }
                      }}
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[13px] leading-none shadow-sm transition ${
                        chip.reactedByMe
                          ? 'border-indigo-400/40 bg-slate-900/95 text-slate-100'
                          : 'border-slate-600 bg-slate-900/95 text-slate-200'
                      } ${chip.reactedByMe ? 'cursor-pointer hover:bg-slate-800' : 'cursor-default'}`}
                      title={
                        chip.reactedByMe
                          ? 'Remove your reaction'
                          : `${chip.count} ${chip.name}`
                      }
                    >
                      <span className='text-[15px] leading-none'>
                        {chip.emoji}
                      </span>
                      {chip.count > 1 && (
                        <span className='text-[12px] font-medium opacity-80'>
                          {chip.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!isSelf && addButton}
          </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </>
  );
};
