import { useFormInput } from '../hooks/useFormInput';
import { TextInput } from '../atoms/TextInput';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Loading } from './Loading';
import { User } from '@supabase/supabase-js';

const LittleModal = (props: {
  isOpen: boolean;
  setIsOpen: any;
  navigate: any;
}) => {
  return (
    <div
      className={`${
        !props.isOpen ? 'hidden' : ''
      } fixed inset-0 flex justify-center items-start z-10`}
      style={{ marginTop: '20%' }} // Adjust this value as needed
    >
      <div className='relative w-full max-w-md p-6 bg-slate-800 rounded-lg'>
        <button
          onClick={() => {
            props.setIsOpen(false);
            props.navigate('/login');
          }}
          className='absolute top-4 right-4 text-white text-2xl hover:bg-slate-700 rounded-full w-10 h-10 flex items-center justify-center'
        >
          X
        </button>
        <div className='flex flex-col items-center'>
          <h2 className='text-white text-md'>Please verify your email</h2>
        </div>
      </div>
    </div>
  );
};

export const Register = (props: { user: 'loading' | User | null }) => {
  const { user } = props;
  const { authRegister, authError } = useAuth();
  const navigate = useNavigate();
  const emailInput = useFormInput('');
  const passwordInput = useFormInput('');
  const repeatPasswordInput = useFormInput('');

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (user && user !== 'loading') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    const response = await authRegister(emailInput.value, passwordInput.value);
    if (response) {
      setIsOpen(true);
    }
  };

  if (user === 'loading') {
    return <Loading />;
  }
  if (user === null) {
    return (
      <div className='flex h-screen bg-slate-900 justify-center items-center py-20'>
        <LittleModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          navigate={navigate}
        />
        <div className='flex flex-col items-center w-1/2 h-fit py-24 text-center mb-96 bg-slate-950 rounded-md'>
          <div className='my-20 w-full flex flex-col items-center'>
            <h2 className='text-white text-xl mb-10'>Register</h2>

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
            <TextInput
              {...repeatPasswordInput}
              placeholder='Password'
              type='password'
              required={true}
            />
            <button
              onClick={handleSubmit}
              className={`mt-2 h-10 rounded-md bg-slate-900 text-white hover:bg-slate-700 w-full max-w-xs`}
              disabled={passwordInput.value != repeatPasswordInput.value}
            >
              Register
            </button>
            <h2 className='text-white text-xl mt-10'>{authError}</h2>
          </div>
        </div>
      </div>
    );
  }
  return <Loading />;
};
