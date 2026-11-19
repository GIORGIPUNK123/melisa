import { BrandMark } from '../../../atoms/BrandMark';
import { IconLock } from '../../../atoms/Icon';
const ui = {
  input:
    'h-11 w-full min-w-0 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3.5 text-[16px] text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-50 md:text-[15px]',
  label: 'mb-1.5 block text-[12px] font-medium text-slate-400',
  btnPrimary:
    'inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#377767] hover:bg-[#50b098] px-4 text-[15px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50',
  btnSecondary:
    'inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-700 bg-transparent px-4 text-[15px] font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50',
  btnCompact:
    'inline-flex h-9 items-center justify-center rounded-xl bg-indigo-600 px-3.5 text-[13px] font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50',
  iconBtn:
    'inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white',
  title: 'text-[17px] font-semibold tracking-tight text-white',
  subtitle: 'text-[13px] leading-5 text-slate-400',
  name: 'truncate text-[15px] font-medium leading-5 text-white',
  meta: 'truncate text-[12px] leading-4 text-slate-400',
  section:
    'text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500',
  avatar: 'h-10 w-10 flex-shrink-0 rounded-full object-cover',
  avatarFallback:
    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-[13px] font-semibold text-slate-100',
};

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
    <div className='flex h-full w-full items-center justify-center bg-[#0A1018] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]'>
      <div className='p-6 w-full max-w-sm rounded-2xl border shadow-2xl border-slate-800 bg-[#0E1621]/80'>
        <div className='mb-6'>
          <BrandMark size='sm' subtitle='Unlock to continue' />
        </div>
        <div className='flex gap-3 items-center mb-5'>
          <div className='flex justify-center items-center w-10 h-10 rounded-xl border shrink-0 border-slate-700 bg-slate-800/80 text-slate-300'>
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
            className={`${ui.btnPrimary} mt-4 cursor-pointer`}
          >
            {unlocking ? 'Unlocking...' : 'Unlock'}
          </button>
        </form>

        <button
          type='button'
          onClick={() => void onLogout()}
          disabled={busy}
          className={`${ui.btnSecondary} mt-3 cursor-pointer`}
        >
          {loggingOut ? 'Logging out...' : 'Log out'}
        </button>
      </div>
    </div>
  );
};
