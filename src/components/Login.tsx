import { useFormInput } from '../hooks/useFormInput'; // Adjust the path as needed
import { TextInput } from '../atoms/TextInput';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { Loading } from './Loading';
import { User } from '@supabase/supabase-js';

export const Login = (props: { user: 'loading' | User | null }) => {
  const { user } = props;
  const { authLogin, authError } = useAuth();
  const navigate = useNavigate();
  const emailInput = useFormInput('');
  const passwordInput = useFormInput('');

  useEffect(() => {
    if (user && user !== 'loading') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    const response = await authLogin(emailInput.value, passwordInput.value);
    console.log('response: ', response);
  };

  if (user === 'loading') {
    return <Loading />;
  }

  if (user === null) {
    return (
      <div className='flex h-screen bg-slate-900 justify-center items-center py-20'>
        <div className='flex flex-col items-center w-1/2 h-fit py-24 text-center mb-96 bg-slate-950 rounded-md'>
          <div className='my-20 w-full flex flex-col items-center'>
            <h2 className='text-white text-xl mb-10'>Login</h2>
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
              onClick={handleSubmit}
              className='mt-2 h-10 rounded-md bg-slate-900 text-white hover:bg-slate-700 w-full max-w-xs'
            >
              Log In
            </button>
            <h2 className='text-white text-xl mt-10'>{authError}</h2>
            <h2
              className='text-white text-md cursor-pointer'
              onClick={() => {
                navigate('/register');
              }}
            >
              Create account here
            </h2>
          </div>
        </div>
      </div>
    );
  }
  return <Loading />;
};
