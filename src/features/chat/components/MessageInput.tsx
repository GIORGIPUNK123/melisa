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
    <div className='p-3 border-t md:p-4 border-slate-700 bg-slate-900'>
      <form onSubmit={handleSubmit} className='flex gap-2 md:gap-3'>
        <input
          ref={inputRef}
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Type a message...'
          className='flex-1 px-3 py-2 text-sm text-white border rounded-lg md:px-4 md:text-base bg-slate-800 border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          autoComplete='off'
          autoFocus
        />
        <button
          type='submit'
          disabled={!message.trim()}
          className='px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg md:px-6 md:text-base hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Send
        </button>
      </form>
    </div>
  );
};
