import { useFormInput } from '../shared/hooks/useFormInput';
import { TextInput } from '../atoms/TextInput';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Loading } from '../components/Loading';
import * as yup from 'yup';
import { registerSchema } from '../features/auth/schemas/registerSchema';
import { handleBackdropClick } from '../shared/utils/modal';

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
      <div className='flex items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'>
        <EmailVerificationModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          navigate={navigate}
        />
        <div className='w-full max-w-xl px-8 py-10 border shadow-xl rounded-2xl border-slate-800 bg-slate-900/70 backdrop-blur'>
          <div className='flex flex-col items-center text-center'>
            <h2 className='text-3xl font-semibold text-white'>
              Create account
            </h2>
            <p className='mt-2 text-slate-400'>
              Join the conversation in seconds
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 mt-8 md:grid-cols-2'>
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
            className='w-full mt-6 font-medium text-white bg-indigo-600 rounded-lg h-11 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={passwordInput.value !== repeatPasswordInput.value}
          >
            Create account
          </button>

          {authError ? (
            <p className='mt-4 text-sm text-center text-rose-400'>
              {authError}
            </p>
          ) : null}
        </div>
      </div>
    );
  }
  return <Loading />;
};
