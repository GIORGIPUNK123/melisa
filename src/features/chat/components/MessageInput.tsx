import { FormEvent, useRef, useState } from 'react';
import { ui } from '../../../shared/ui';

interface MessageInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput = ({
  onSubmit,
  disabled,
  placeholder = 'Type a message...',
}: MessageInputProps) => {
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
    <div className='shrink-0 border-t border-slate-800 bg-slate-900 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-4'>
      <form onSubmit={handleSubmit} className='flex items-center gap-2'>
        <input
          ref={inputRef}
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={ui.input}
          autoComplete='off'
          enterKeyHint='send'
        />
        <button
          type='submit'
          disabled={disabled || !message.trim()}
          className={`${ui.btnPrimary} w-auto min-w-[4.5rem] px-4`}
        >
          Send
        </button>
      </form>
    </div>
  );
};
