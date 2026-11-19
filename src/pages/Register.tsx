import { useFormInput } from '../shared/hooks/useFormInput';
import { TextInput } from '../atoms/TextInput';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Loading } from '../components/Loading';
import * as yup from 'yup';
import { registerSchema } from '../features/auth/schemas/registerSchema';
import { passwordRuleMessage } from '../features/auth/passwordPolicy';
import { handleBackdropClick } from '../shared/utils/modal';
import { BrandMark } from '../atoms/BrandMark';
import { ui } from '../shared/ui';

const authPrimaryButton =
  'focus-ring inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-4 text-[15px] font-semibold text-background transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50';

const EmailVerificationModal = (props: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  navigate: (path: string) => void;
}) => {
  return (
    <div
      className={`${
        !props.isOpen ? 'hidden' : ''
      } fixed inset-0 flex justify-center items-center z-50 bg-background/60 backdrop-blur-sm p-4`}
      onClick={(event) =>
        handleBackdropClick(event, () => {
          props.setIsOpen(false);
          props.navigate('/login');
        })
      }
    >
      <div className='relative w-full max-w-md bg-linear-to-br from-panel to-sidebar rounded-card shadow-panel border border-border-strong overflow-hidden'>
        <div className='absolute left-0 right-0 top-0 h-1 bg-primary'></div>

        <div className='p-6 sm:p-8'>
          <div className='flex flex-col items-center space-y-4 text-center'>
            <div className='flex h-14 w-14 items-center justify-center rounded-card bg-primary shadow-lg'>
              <svg
                className='w-8 h-8 text-background'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                />
              </svg>
            </div>

            <h2 className={`${ui.title} text-foreground`}>Check your email</h2>
            <p className={`${ui.subtitle} text-muted`}>
              We've sent you a verification link. Please check your inbox and
              click the link to activate your account.
            </p>

            <button
              onClick={() => {
                props.setIsOpen(false);
                props.navigate('/login');
              }}
              className={`mt-2 ${authPrimaryButton}`}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Register = () => {
  const { user, authRegister, authError } = useAuth();
  const navigate = useNavigate();
  const emailInput = useFormInput('');
  const passwordInput = useFormInput('');
  const repeatPasswordInput = useFormInput('');
  const nicknameInput = useFormInput('');
  const usernameInput = useFormInput('');

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    repeatPassword?: string;
    nickname?: string;
    username?: string;
  }>({});

  const validateFields = async () => {
    try {
      await registerSchema.validate(
        {
          username: usernameInput.value,
          nickname: nicknameInput.value,
          email: emailInput.value,
          password: passwordInput.value,
          repeatPassword: repeatPasswordInput.value,
        },
        { abortEarly: false },
      );
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors: {
          email?: string;
          password?: string;
          repeatPassword?: string;
          nickname?: string;
          username?: string;
        } = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path as keyof typeof validationErrors] =
              error.message;
          }
        });
        setErrors(validationErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!(await validateFields())) {
      return;
    }
    const response = await authRegister(
      emailInput.value,
      passwordInput.value,
      usernameInput.value,
      nicknameInput.value,
    );
    if (response) {
      setIsOpen(true);
    }
  };
  if (!user) {
    return (
      // Scroll inside #root (which is overflow:hidden globally for chat mobile).
      <div className='h-full overflow-y-auto overscroll-contain bg-gradient-to-br from-background via-sidebar to-background pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'>
        <EmailVerificationModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          navigate={navigate}
        />
        <div className='flex justify-center items-center px-4 py-8 min-h-full sm:py-12'>
          <div className='w-full max-w-xl rounded-card border border-border-strong bg-panel/90 px-5 py-7 shadow-xl backdrop-blur sm:px-8 sm:py-9'>
            <BrandMark size='sm' subtitle='Create your account' />

            <div className='grid grid-cols-1 gap-3 mt-7 md:grid-cols-2'>
              <TextInput
                {...usernameInput}
                placeholder='Username'
                type='text'
                required={true}
                error={errors.username}
                variant='plain'
              />
              <TextInput
                {...nicknameInput}
                placeholder='Nickname'
                type='text'
                required={true}
                error={errors.nickname}
                variant='plain'
              />
              <div className='md:col-span-2'>
                <TextInput
                  {...emailInput}
                  placeholder='Email'
                  type='email'
                  required={true}
                  error={errors.email}
                  variant='plain'
                />
              </div>
              <TextInput
                {...passwordInput}
                placeholder={passwordRuleMessage}
                type='password'
                required={true}
                error={errors.password}
                variant='plain'
              />
              <TextInput
                {...repeatPasswordInput}
                placeholder='Repeat password'
                type='password'
                required={true}
                error={errors.repeatPassword}
                variant='plain'
              />
            </div>

            <button
              onClick={handleSubmit}
              className={`mt-5 cursor-pointer ${authPrimaryButton}`}
              disabled={passwordInput.value !== repeatPasswordInput.value}
            >
              Create account
            </button>

            {authError ? (
              <p className='focus-ring mt-4 text-sm text-center text-destructive'>
                {authError}
              </p>
            ) : null}

            <div className='mt-5 text-center sm:mt-6'>
              <p className='text-[13px] text-muted'>
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className='focus-ring cursor-pointer font-medium text-primary hover:text-primary-strong'
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return <Loading />;
};
