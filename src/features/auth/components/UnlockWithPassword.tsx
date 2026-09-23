import { BrandMark } from '../../../atoms/BrandMark';
import { IconLock } from '../../../atoms/Icon';
import { ui } from '../../../shared/ui';

export const UnlockWithPassword = (props: {
  unlockPassword: string;
  setUnlockPassword: (password: string) => void;
  unlockError: string | null;
  unlocking: boolean;
  handleUnlock: () => Promise<void>;
  onLogout: () => void | Promise<void>;
  loggingOut?: boolean;
}) => {
  const {
    unlockPassword,
    setUnlockPassword,
    unlockError,
    unlocking,
    handleUnlock,
    onLogout,
    loggingOut = false,
  } = props;

  const busy = unlocking || loggingOut;

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-slate-900 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]'>
      <div className='w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl'>
        <div className='mb-6'>
          <BrandMark size='sm' subtitle='Unlock to continue' />
        </div>
        <div className='mb-5 flex items-center gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300'>
            <IconLock size={16} />
          </div>
          <div>
            <h3 className={ui.title}>Unlock your private key</h3>
            <p className={ui.subtitle}>
              Enter the password that encrypts your chats.
            </p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleUnlock();
          }}
        >
          <label className={ui.label}>Password</label>
          <input
            type='password'
            placeholder='Enter password'
            value={unlockPassword}
            onChange={(e) => setUnlockPassword(e.target.value)}
            className={ui.input}
            autoFocus
            required
            disabled={busy}
            autoComplete='current-password'
          />
          {unlockError && (
            <div className='mt-3 text-sm text-red-400'>{unlockError}</div>
          )}
          <button
            type='submit'
            disabled={busy || !unlockPassword}
            className={`${ui.btnPrimary} mt-4`}
          >
            {unlocking ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>

        <button
          type='button'
          onClick={() => void onLogout()}
          disabled={busy}
          className={`${ui.btnSecondary} mt-3`}
        >
          {loggingOut ? 'Logging out...' : 'Log out'}
        </button>
      </div>
    </div>
  );
};
