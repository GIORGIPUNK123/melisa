interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const MessageInput = ({
  value,
  onChange,
  onSubmit,
  disabled,
  inputRef,
}: MessageInputProps) => {
  return (
    <div className='p-3 border-t md:p-4 border-slate-700 bg-slate-900'>
      <form onSubmit={onSubmit} className='flex gap-2 md:gap-3'>
        <input
          ref={inputRef}
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Type a message...'
          className='flex-1 px-3 py-2 text-sm text-white border rounded-lg md:px-4 md:text-base bg-slate-800 border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
          disabled={disabled}
        />
        <button
          type='submit'
          disabled={!value.trim() || disabled}
          className='px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg md:px-6 md:text-base hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {disabled ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
