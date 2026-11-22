import { FormEvent, useRef, useState } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface MessageInputProps {
  onSubmit: (message: string) => void;
  // onSendFile?: (file: File) => void;
  disabled?: boolean;
}

export const MessageInput = ({
  onSubmit,
  // onSendFile,
  disabled,
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim() || disabled) return;

    onSubmit(message);
    setMessage('');
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  // const sendFile = (file: File | undefined) => {
  //   if (!file || disabled) return;
  //   onSendFile?.(file);
  // };

  return (
    <div className='shrink-0 border-t-[1px] border-solid border-border-strong bg-background px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-4 md:pt-4 md:pb-4'>
      <form
        onSubmit={handleSubmit}
        className='flex min-w-0 items-center gap-1.5 sm:gap-2 md:gap-3'
      >
        <button
          type='button'
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          aria-label='Attach file'
          className='focus-ring flex justify-center items-center w-11 h-11 rounded-lg shrink-0 text-muted-foreground hover:bg-surface-hover hover:text-foreground disabled:opacity-50'
        >
          <Paperclip className='w-5 h-5' />
        </button>
        <input
          ref={inputRef}
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Type a message...'
          disabled={disabled}
          className='min-w-0 flex-1 rounded-lg border border-border bg-panel-raised px-3 py-2.5 text-base text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 md:px-4'
          autoComplete='off'
          enterKeyHint='send'
        />
        <button
          type='submit'
          disabled={disabled || !message.trim()}
          aria-label='Send message'
          className='focus-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground transition-colors hover:bg-primary/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-4'
        >
          <Send className='w-5 h-5' />
        </button>
      </form>
    </div>
  );
};
