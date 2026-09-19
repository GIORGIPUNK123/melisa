import { IconLock } from '../../../atoms/Icon';
import { ui } from '../../../shared/ui';

export const BlockedComposer = (props: {
  blockedByMe: boolean;
  onUnblock?: () => void;
}) => {
  return (
    <div className='shrink-0 border-t border-slate-800 bg-slate-950/80 px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:px-4'>
      <div className='flex items-center gap-3'>
        <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400'>
          <IconLock size={16} />
        </div>

        <div className='min-w-0 flex-1'>
          <p className='text-[14px] font-medium text-slate-200'>
            {props.blockedByMe
              ? 'You blocked this user'
              : "You can't send messages to this user"}
          </p>
          <p className='mt-0.5 text-[12px] text-slate-500'>
            {props.blockedByMe
              ? "They can't message you either. Unblock to chat again."
              : 'Messaging is unavailable in this chat.'}
          </p>
        </div>

        {props.blockedByMe && props.onUnblock && (
          <button
            type='button'
            onClick={props.onUnblock}
            className={`${ui.btnCompact} flex-shrink-0`}
          >
            Unblock
          </button>
        )}
      </div>
    </div>
  );
};
