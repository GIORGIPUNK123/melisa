import { useFormInput } from '../shared/hooks/useFormInput';
import { TextInput } from '../atoms/TextInput';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Loading } from '../components/Loading';

export const Login = () => {
  const { user, authLogin, authError } = useAuth();
  const navigate = useNavigate();
  const emailInput = useFormInput('');
  const passwordInput = useFormInput('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user !== 'loading') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    const success = await authLogin(emailInput.value, passwordInput.value);
    setIsLoading(false);

    if (success) {
      navigate('/');
    }
  };

  if (user === 'loading') {
    return <Loading />;
  }

  if (user === null) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center px-4 py-12'>
        <div className='w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur px-8 py-10 shadow-xl'>
          <div className='flex flex-col items-center text-center'>
            <h2 className='text-white text-3xl font-semibold'>Welcome back</h2>
            <p className='text-slate-400 mt-2'>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className='mt-8 space-y-4'>
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
              className='mt-6 h-11 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 w-full disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {authError && (
            <p className='mt-4 text-sm text-center text-rose-400'>
              {authError}
            </p>
          )}

          <div className='mt-6 text-center'>
            <p className='text-slate-400 text-sm'>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className='text-indigo-400 hover:text-indigo-300 font-medium'
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }
  return <Loading />;
};
