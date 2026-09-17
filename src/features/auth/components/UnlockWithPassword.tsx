import { BrandMark } from '../../../atoms/BrandMark';

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
    <div className='flex h-[100dvh] w-full items-center justify-center bg-slate-900 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]'>
      <div className='w-full max-w-sm rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-2xl'>
        <div className='mb-6'>
          <BrandMark size='sm' subtitle='Unlock to continue' />
        </div>
        <div className='mb-5 flex items-center gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-300'>
            🔐
          </div>
          <div>
            <h3 className='text-lg font-semibold text-white'>
              Unlock your private key
            </h3>
            <p className='text-sm text-slate-400'>
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
          <label className='block text-xs font-medium uppercase tracking-wide text-slate-400'>
            Password
          </label>
          <input
            type='password'
            placeholder='Enter password'
            value={unlockPassword}
            onChange={(e) => setUnlockPassword(e.target.value)}
            className='mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-base text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30'
            autoFocus
            required
            disabled={busy}
            autoComplete='current-password'
          />
          {unlockError && (
            <div className='mt-3 text-sm text-red-400'>{unlockError}</div>
          )}
          <p className='mt-3 text-xs leading-relaxed text-slate-500'>
            If you changed your login password recently, try your{' '}
            <span className='text-slate-300'>previous</span> password here. Login
            and chat encryption can get out of sync.
          </p>
          <button
            type='submit'
            disabled={busy || !unlockPassword}
            className='mt-4 w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-600/60'
          >
            {unlocking ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>

        <button
          type='button'
          onClick={() => void onLogout()}
          disabled={busy}
          className='mt-3 w-full rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
        >
          {loggingOut ? 'Logging out...' : 'Log out'}
        </button>
      </div>
    </div>
  );
};
