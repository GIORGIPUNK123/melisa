import { BrandMark } from '../../../atoms/BrandMark';
import { IconLock } from '../../../atoms/Icon';
const ui = {
  input:
    'h-11 w-full min-w-0 rounded-xl border border-border/80 bg-surface/80 px-3.5 text-[16px] text-foreground placeholder:text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-[15px]',
  label: 'mb-1.5 block text-[12px] font-medium text-muted',
  btnPrimary:
    'focus-ring inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary hover:bg-primary-strong px-4 text-[15px] font-semibold text-background transition disabled:cursor-not-allowed disabled:opacity-50',
  btnSecondary:
    'focus-ring inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-transparent px-4 text-[15px] font-medium text-muted-foreground transition hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50',
  btnCompact:
    'focus-ring inline-flex h-9 items-center justify-center rounded-xl bg-primary px-3.5 text-[13px] font-semibold text-background transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50',
  iconBtn:
    'focus-ring inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-muted transition hover:bg-surface-hover hover:text-foreground',
  title: 'text-[17px] font-semibold tracking-tight text-foreground',
  subtitle: 'text-[13px] leading-5 text-muted',
  name: 'truncate text-[15px] font-medium leading-5 text-foreground',
  meta: 'truncate text-[12px] leading-4 text-muted',
  section:
    'text-[11px] font-semibold uppercase tracking-[0.16em] text-subtle',
  avatar: 'h-10 w-10 flex-shrink-0 rounded-full object-cover',
  avatarFallback:
    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface text-[13px] font-semibold text-foreground',
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
    <div className='flex h-full w-full items-center justify-center bg-sidebar px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]'>
      <div className='p-6 w-full max-w-sm rounded-card border shadow-panel border-border bg-panel/80'>
        <div className='mb-6'>
          <BrandMark size='sm' subtitle='Unlock to continue' />
        </div>
        <div className='flex gap-3 items-center mb-5'>
          <div className='flex justify-center items-center w-10 h-10 rounded-xl border shrink-0 border-border bg-surface/80 text-muted-foreground'>
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
            <div className='mt-3 text-sm text-destructive'>{unlockError}</div>
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
