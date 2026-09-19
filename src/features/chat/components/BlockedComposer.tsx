import { IconLock } from '../../../atoms/Icon';

export const BlockedComposer = (props: {
  blockedByMe: boolean;
  onUnblock?: () => void;
}) => {
  return (
    <div className='shrink-0 border-t border-slate-800 bg-slate-950/80 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-5'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-400'>
          <IconLock size={18} />
        </div>

        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium text-slate-200'>
            {props.blockedByMe
              ? 'You blocked this user'
              : "You can't send messages to this user"}
          </p>
          <p className='mt-0.5 text-xs text-slate-500'>
            {props.blockedByMe
              ? "They can't message you either. Unblock to chat again."
              : 'Messaging is unavailable in this chat.'}
          </p>
        </div>

        {props.blockedByMe && props.onUnblock && (
          <button
            type='button'
            onClick={props.onUnblock}
            className='flex-shrink-0 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500'
          >
            Unblock
          </button>
        )}
      </div>
    </div>
  );
};
