import { useFormInput } from '../../../shared/hooks/useFormInput';
import { ui } from '../../../shared/ui';
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
      className='fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
      onClick={(event) => handleBackdropClick(event, props.onClose)}
    >
      <div className='w-full max-w-md overflow-hidden border shadow-2xl rounded-2xl border-slate-700/50 bg-slate-900'>
        <div className='px-6 py-4 border-b border-slate-700'>
          <h2 className={ui.title}>Forgot password?</h2>
          <p className={`${ui.subtitle} mt-1`}>
            Enter your email address to reset your password.
          </p>
        </div>

        <form
          className='p-6 space-y-4'
          onSubmit={(event) => event.preventDefault()}
        >
          <label className={ui.label} htmlFor='forgot-password-email'>
            Email address
          </label>
          <input
            id='forgot-password-email'
            {...emailInput}
            type='email'
            placeholder='you@example.com'
            className={ui.input}
            autoFocus
            autoComplete='email'
            required
          />

          <div className='flex gap-3 pt-1'>
            <button
              type='button'
              onClick={props.onClose}
              className={`${ui.btnSecondary} flex-1`}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={!hasValidEmail}
              className={`${ui.btnPrimary} flex-1`}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
