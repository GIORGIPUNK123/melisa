import { useFormInput } from '../shared/hooks/useFormInput';
import { TextInput } from '../atoms/TextInput';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Loading } from '../components/Loading';
import * as yup from 'yup';
import { registerSchema } from '../features/auth/schemas/registerSchema';
import { handleBackdropClick } from '../shared/utils/modal';
import { BrandMark } from '../atoms/BrandMark';
import { APP_NAME } from '../shared/constants';

const EmailVerificationModal = (props: {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  navigate: (path: string) => void;
}) => {
  return (
    <div
      className={`${
        !props.isOpen ? 'hidden' : ''
      } fixed inset-0 flex justify-center items-center z-50 bg-black/60 backdrop-blur-sm p-4`}
      onClick={(event) =>
        handleBackdropClick(event, () => {
          props.setIsOpen(false);
          props.navigate('/login');
        })
      }
    >
      <div className='relative w-full max-w-md bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden'>
        <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500'></div>

        <div className='p-8'>
          <div className='flex flex-col items-center space-y-4 text-center'>
            {/* Email icon */}
            <div className='w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg'>
              <svg
                className='w-8 h-8 text-white'
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

            <h2 className='text-white text-2xl font-bold'>Check your email</h2>
            <p className='text-slate-400 text-sm'>
              We've sent you a verification link. Please check your inbox and
              click the link to activate your account.
            </p>

            <button
              onClick={() => {
                props.setIsOpen(false);
                props.navigate('/login');
              }}
              className='w-full py-3 px-6 mt-4 rounded-lg font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:scale-95 transition-all duration-200 shadow-lg'
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
    console.log('user: ', user);
    if (user && user !== 'loading') {
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
    console.log('response: ', response);
    if (response) {
      setIsOpen(true);
    }
  };

  if (user === 'loading') {
    return <Loading />;
  }
  if (user === null) {
    return (
      // Scroll inside #root (which is overflow:hidden globally for chat mobile).
      <div className='h-full overflow-y-auto overscroll-contain bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'>
        <EmailVerificationModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          navigate={navigate}
        />
        <div className='flex min-h-full items-center justify-center px-4 py-8 sm:py-12'>
          <div className='w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-7 shadow-xl backdrop-blur sm:px-8 sm:py-10'>
            <BrandMark subtitle='Private messaging' />
            <div className='mt-5 text-center sm:mt-6'>
              <h2 className='text-xl font-semibold text-white'>
                Create your {APP_NAME} account
              </h2>
              <p className='mt-1 text-slate-400'>Join in a few seconds</p>
            </div>

            <div className='mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-2'>
              <TextInput
                {...usernameInput}
                placeholder='Username'
                type='text'
                required={true}
                error={errors.username}
              />
              <TextInput
                {...nicknameInput}
                placeholder='Nickname'
                type='text'
                required={true}
                error={errors.nickname}
              />
              <div className='md:col-span-2'>
                <TextInput
                  {...emailInput}
                  placeholder='Email'
                  type='email'
                  required={true}
                  error={errors.email}
                />
              </div>
              <TextInput
                {...passwordInput}
                placeholder='Password'
                type='password'
                required={true}
                error={errors.password}
              />
              <TextInput
                {...repeatPasswordInput}
                placeholder='Repeat password'
                type='password'
                required={true}
                error={errors.repeatPassword}
              />
            </div>

            <button
              onClick={handleSubmit}
              className='mt-5 h-11 w-full rounded-lg bg-indigo-600 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-6'
              disabled={passwordInput.value !== repeatPasswordInput.value}
            >
              Create account
            </button>

            {authError ? (
              <p className='mt-4 text-center text-sm text-rose-400'>
                {authError}
              </p>
            ) : null}

            <div className='mt-5 text-center sm:mt-6'>
              <p className='text-sm text-slate-400'>
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className='font-medium text-indigo-400 hover:text-indigo-300'
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
