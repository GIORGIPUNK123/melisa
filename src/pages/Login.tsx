import { useFormInput } from '../shared/hooks/useFormInput';
import { TextInput } from '../atoms/TextInput';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Loading } from '../components/Loading';
import { BrandMark } from '../atoms/BrandMark';

export const Login = () => {
  const { user, authLogin, authError, isResolvingPrivateKey } = useAuth();
  const navigate = useNavigate();
  const emailInput = useFormInput('');
  const passwordInput = useFormInput('');
  const [isLoading, setIsLoading] = useState(false);

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
      navigate('/');
    }
  };

  if (user === 'loading' || isResolvingPrivateKey || isLoading) {
    return <Loading />;
  }

  if (user === null) {
    return (
      // Scroll inside #root (which is overflow:hidden globally for chat mobile).
      <div className='h-full overflow-y-auto overscroll-contain bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'>
        <div className='flex min-h-full items-center justify-center px-4 py-8 sm:py-12'>
          <div className='w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-7 shadow-xl backdrop-blur sm:px-8 sm:py-10'>
            <BrandMark subtitle='Private messaging' />

            <form onSubmit={handleSubmit} className='mt-6 space-y-4 sm:mt-8'>
              <TextInput
                {...emailInput}
                placeholder='Email'
                type='email'
                required={true}
              />
              <TextInput
                {...passwordInput}
                placeholder='Password'
                type='password'
                required={true}
              />

              <button
                type='submit'
                disabled={isLoading || !emailInput.value || !passwordInput.value}
                className='mt-6 h-11 w-full rounded-lg bg-indigo-600 font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {authError && (
              <p className='mt-4 text-center text-sm text-rose-400'>
                {authError}
              </p>
            )}

            <div className='mt-5 text-center sm:mt-6'>
              <p className='text-sm text-slate-400'>
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className='font-medium text-indigo-400 hover:text-indigo-300'
                >
                  Create one
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
