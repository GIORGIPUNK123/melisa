import { useFormInput } from '../../../shared/hooks/useFormInput';
import { handleBackdropClick } from '../../../shared/utils/modal';

export const ForgotPasswordModal = (props: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const emailInput = useFormInput('');
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);

  if (!props.isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-[70] flex items-center justify-center bg-background/60 p-4 backdrop-blur-sm'
      onClick={(event) => handleBackdropClick(event, props.onClose)}
    >
      <div className='overflow-hidden w-full max-w-md rounded-card border shadow-panel border-border-strong bg-panel'>
        <div className='px-6 py-4 border-b border-border-strong'>
          <h2 className='text-[17px] font-semibold tracking-tight text-foreground'>
            Forgot password?
          </h2>
          <p className='text-[13px] leading-5 text-muted'>
            Enter your email address to reset your password.
          </p>
        </div>

        <form
          className='p-6 space-y-4'
          onSubmit={(event) => event.preventDefault()}
        >
          <label
            className='mb-1.5 block text-[12px] font-medium text-muted'
            htmlFor='forgot-password-email'
          >
            Email address
          </label>
          <input
            id='forgot-password-email'
            {...emailInput}
            type='email'
            placeholder='you@example.com'
            className='h-11 w-full min-w-0 rounded-xl border border-border-strong bg-sidebar/80 px-3.5 text-[16px] text-foreground placeholder:text-subtle outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-[15px]'
            autoFocus
            autoComplete='email'
            required
          />

          <div className='flex gap-3 pt-1'>
            <button
              type='button'
              onClick={props.onClose}
              className={`inline-flex flex-1 justify-center items-center px-4 w-full h-11 font-medium bg-transparent rounded-xl border transition border-border-strong text-[15px] text-muted-foreground hover:bg-surface-hover hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={!hasValidEmail}
              className={`inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary hover:bg-primary-strong px-4 text-[15px] font-semibold text-background transition disabled:cursor-not-allowed disabled:opacity-50 flex-1`}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
