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
      className='fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
      onClick={(event) => handleBackdropClick(event, props.onClose)}
    >
      <div className='overflow-hidden w-full max-w-md rounded-2xl border shadow-2xl border-[#1B2A3A] bg-[#0E1621]'>
        <div className='px-6 py-4 border-b border-[#1B2A3A]'>
          <h2 className='text-[17px] font-semibold tracking-tight text-[#EEF3F8]'>
            Forgot password?
          </h2>
          <p className='text-[13px] leading-5 text-[#8192A4]'>
            Enter your email address to reset your password.
          </p>
        </div>

        <form
          className='p-6 space-y-4'
          onSubmit={(event) => event.preventDefault()}
        >
          <label
            className='mb-1.5 block text-[12px] font-medium text-[#8192A4]'
            htmlFor='forgot-password-email'
          >
            Email address
          </label>
          <input
            id='forgot-password-email'
            {...emailInput}
            type='email'
            placeholder='you@example.com'
            className='h-11 w-full min-w-0 rounded-xl border border-[#243648] bg-[#0A1018]/80 px-3.5 text-[16px] text-[#EEF3F8] placeholder:text-[#56687B] outline-none transition focus:border-[#65E0C1] focus:ring-2 focus:ring-[#65E0C1]/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-[15px]'
            autoFocus
            autoComplete='email'
            required
          />

          <div className='flex gap-3 pt-1'>
            <button
              type='button'
              onClick={props.onClose}
              className={`inline-flex flex-1 justify-center items-center px-4 w-full h-11 font-medium bg-transparent rounded-xl border transition border-[#243648] text-[15px] text-[#C8D4E0] hover:bg-[#162231] hover:text-[#EEF3F8] disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={!hasValidEmail}
              className={`inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#65E0C1] hover:bg-[#7BE9CE] px-4 text-[15px] font-semibold text-[#07110F] transition disabled:cursor-not-allowed disabled:opacity-50 flex-1`}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
