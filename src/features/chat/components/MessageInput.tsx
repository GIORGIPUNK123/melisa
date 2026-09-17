import { FormEvent, useRef, useState } from 'react';

interface MessageInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput = ({ onSubmit, disabled }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim() || disabled) return;

    onSubmit(message);
    setMessage('');
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <div className='shrink-0 border-t border-slate-700 bg-slate-900 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-4'>
      <form onSubmit={handleSubmit} className='flex gap-2 md:gap-3'>
        <input
          ref={inputRef}
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Type a message...'
          // 16px+ prevents iOS Safari from zooming on focus
          className='min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 md:px-4'
          autoComplete='off'
          enterKeyHint='send'
        />
        <button
          type='submit'
          disabled={!message.trim()}
          className='rounded-lg bg-indigo-600 px-4 py-2.5 text-base font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 md:px-6'
        >
          Send
        </button>
      </form>
    </div>
  );
};
