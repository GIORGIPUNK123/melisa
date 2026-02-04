import { User } from '@supabase/supabase-js';
import { useFormInput } from '../hooks/useFormInput';
import { TextInput } from '../atoms/TextInput';
import { useAdditionalInfo } from '../hooks/useAdditionalInfo';
import { useNavigate } from 'react-router';

export const AdditionalInfoModal = (props: {
  isOpen: boolean;
  // setIsOpen: any;
  user: User;
}) => {
  const navigate = useNavigate();
  const usernameInput = useFormInput('');
  const nicknameInput = useFormInput('');
  const { messageResponse, addAdditionalInfo, resetMessageResponse } =
    useAdditionalInfo(props.user?.id);
  const handleConfirmation = () => {
    resetMessageResponse();
    addAdditionalInfo(props.user, usernameInput.value, nicknameInput.value);
  };
  if (messageResponse === 'Additional info added successfully') {
    navigate(0);
  }
  return (
    <div
      className={`${
        !props.isOpen ? 'hidden' : ''
      } fixed inset-0 flex justify-center items-center z-50 bg-black/60 backdrop-blur-sm p-4`}
    >
      <div className='relative w-full max-w-md overflow-hidden border shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-slate-700/50'>
        {/* Decorative gradient overlay */}
        <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'></div>

        <div className='p-6 sm:p-8'>
          <div className='flex flex-col items-center space-y-6'>
            {/* Icon/Avatar placeholder */}
            <div className='flex items-center justify-center w-16 h-16 rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-purple-600'>
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
                  d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                />
              </svg>
            </div>

            {/* Header */}
            <div className='space-y-2 text-center'>
              <h2 className='text-2xl font-bold text-white'>
                Complete Your Profile
              </h2>
              <p className='text-sm text-slate-400'>
                Let's get you started with a username and nickname
              </p>
            </div>

            {/* Form inputs */}
            <div className='w-full space-y-4'>
              <TextInput
                {...usernameInput}
                placeholder='Username'
                type='text'
                required={true}
              />
              <TextInput
                {...nicknameInput}
                placeholder='Nickname'
                type='text'
                required={true}
              />
            </div>

            {/* Message response */}
            {messageResponse && (
              <div
                className={`w-full text-center py-2 px-4 rounded-lg text-sm font-medium ${
                  messageResponse.includes('success')
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {messageResponse}
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={handleConfirmation}
              className='w-full px-6 py-3 font-semibold text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-95 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={!usernameInput.value || !nicknameInput.value}
            >
              Confirm & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
