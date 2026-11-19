import { useFormInput } from '../shared/hooks/useFormInput';
import { TextInput } from '../atoms/TextInput';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Loading } from '../components/Loading';
import { BrandMark } from '../atoms/BrandMark';
import { ForgotPasswordModal } from '../features/auth/components/ForgotPasswordModal';
import { useAudioNotification } from '../features/notifications/hooks/useAudioNotification';

const authPrimaryButton =
  'inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#65E0C1] px-4 text-[15px] font-semibold text-[#07110F] transition hover:bg-[#7BE9CE] disabled:cursor-not-allowed disabled:opacity-50';

export const Login = () => {
  const { user, authLogin, authError, isResolvingPrivateKey } = useAuth();
  const navigate = useNavigate();
  const emailInput = useFormInput('');
  const passwordInput = useFormInput('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const { ensureEnabled } = useAudioNotification('ui/success_bling');
  const { ensureEnabled: ensureNotificationSound } = useAudioNotification(
    'notification/notification',
  );

  useEffect(() => {
    if (user && user !== 'loading' && !isResolvingPrivateKey) {
      navigate('/');
    }
  }, [user, isResolvingPrivateKey, navigate]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    const success = await authLogin(emailInput.value, passwordInput.value);
    setIsLoading(false);

    if (success) {
      void ensureEnabled();
      void ensureNotificationSound();
      navigate('/');
    }
  };

  if (user === 'loading' || isResolvingPrivateKey || isLoading) {
    return <Loading />;
  }

  if (user === null) {
    return (
      // Scroll inside #root (which is overflow:hidden globally for chat mobile).
      <div className='h-full overflow-y-auto overscroll-contain bg-gradient-to-br from-[#080D14] via-[#0B131D] to-[#080D14] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'>
        <div className='flex justify-center items-center px-4 py-8 min-h-full sm:py-12'>
          <div className='px-5 py-7 w-full max-w-md rounded-2xl border shadow-xl backdrop-blur border-[#1B2A3A] bg-[#0E1621]/90 sm:px-8 sm:py-9'>
            <BrandMark size='sm' subtitle='Private messaging' />

            <form onSubmit={handleSubmit} className='mt-7 space-y-3'>
              <TextInput
                {...emailInput}
                placeholder='Email'
                type='email'
                required={true}
                variant='plain'
              />
              <TextInput
                {...passwordInput}
                placeholder='Password'
                type='password'
                required={true}
                variant='plain'
              />

              <button
                type='submit'
                disabled={
                  isLoading || !emailInput.value || !passwordInput.value
                }
                className={`${authPrimaryButton} mt-2`}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <button
              type='button'
              onClick={() => setIsForgotPasswordOpen(true)}
              className='cursor-pointer mt-4 block w-full text-center text-[13px] font-medium text-[#65E0C1] transition hover:text-[#7BE9CE]'
            >
              Forgot password?
            </button>

            {authError && (
              <p className='mt-4 text-sm text-center text-rose-400'>
                {authError}
              </p>
            )}

            <div className='mt-5 text-center sm:mt-6'>
              <p className='text-[13px] text-[#8192A4]'>
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className='font-medium text-[#65E0C1] cursor-pointer hover:text-[#7BE9CE]'
                >
                  Create one
                </button>
              </p>
            </div>
          </div>
        </div>
        <ForgotPasswordModal
          isOpen={isForgotPasswordOpen}
          onClose={() => setIsForgotPasswordOpen(false)}
        />
      </div>
    );
  }
  return <Loading />;
};
