import { FormEvent, useRef, useState } from 'react';
import { CameraCapture } from './CameraCapture';

interface MessageInputProps {
  onSubmit: (message: string) => void;
  onSendFile?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput = ({
  onSubmit,
  onSendFile,
  disabled,
  placeholder = 'Type a message...',
}: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraAvailable =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim() || disabled) return;

    onSubmit(message);
    setMessage('');
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const sendFile = (file: File | undefined) => {
    if (!file || disabled) return;
    onSendFile?.(file);
  };

  return (
    <div className='shrink-0 border-t border-slate-800 bg-slate-900 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-4 md:pt-4 md:pb-4'>
      {cameraOpen && (
        <CameraCapture
          onClose={() => setCameraOpen(false)}
          onCapture={(file) => {
            setCameraOpen(false);
            sendFile(file);
          }}
        />
      )}
      <form onSubmit={handleSubmit} className='flex items-center gap-2 md:gap-3'>
        <input
          ref={fileRef}
          type='file'
          className='hidden'
          onChange={(event) => {
            sendFile(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
        {cameraAvailable && (
          <button
            type='button'
            disabled={disabled}
            onClick={() => setCameraOpen(true)}
            aria-label='Take photo'
            className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50'
          >
            <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' aria-hidden='true'>
              <path
                d='M8 7.5 9.2 5.8A1.5 1.5 0 0 1 10.5 5h3a1.5 1.5 0 0 1 1.3.8L16 7.5h2.5A1.5 1.5 0 0 1 20 9v8.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5V9a1.5 1.5 0 0 1 1.5-1.5H8Z'
                stroke='currentColor'
                strokeWidth='1.6'
              />
              <circle cx='12' cy='13' r='3' stroke='currentColor' strokeWidth='1.6' />
            </svg>
          </button>
        )}
        <button
          type='button'
          disabled={disabled}
          onClick={() => fileRef.current?.click()}
          aria-label='Attach file'
          className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-50'
        >
          <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' aria-hidden='true'>
            <path
              d='m8.5 12.5 5.2-5.2a3 3 0 0 1 4.2 4.2l-6.4 6.4a4.2 4.2 0 0 1-6-6l6.8-6.8'
              stroke='currentColor'
              strokeWidth='1.6'
              strokeLinecap='round'
            />
          </svg>
        </button>
        <input
          ref={inputRef}
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className='min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 md:px-4'
          autoComplete='off'
          enterKeyHint='send'
        />
        <button
          type='submit'
          disabled={disabled || !message.trim()}
          className='shrink-0 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50'
        >
          Send
        </button>
      </form>
    </div>
  );
};
