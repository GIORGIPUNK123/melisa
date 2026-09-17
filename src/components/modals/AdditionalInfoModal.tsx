import { User } from '@supabase/supabase-js';
import { useFormInput } from '../../shared/hooks/useFormInput';
import { TextInput } from '../../atoms/TextInput';
import { useAdditionalInfo } from '../../features/friends/hooks/useAdditionalInfo';
import { useNavigate } from 'react-router';
import { APP_NAME } from '../../shared/constants';
import { IconUser } from '../../atoms/Icon';

export const AdditionalInfoModal = (props: {
  isOpen: boolean;
  user: User;
}) => {
  const navigate = useNavigate();
  const usernameInput = useFormInput('');
  const nicknameInput = useFormInput('');
  const { messageResponse, addAdditionalInfo, resetMessageResponse } =
    useAdditionalInfo(props.user?.id);
  const handleConfirmation = () => {
    resetMessageResponse();
    addAdditionalInfo(usernameInput.value, nicknameInput.value);
  };
  if (messageResponse === 'Additional info added successfully') {
    navigate(0);
  }
  return (
    <div
      className={`${
        !props.isOpen ? 'hidden' : ''
      } fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm`}
    >
      <div className='relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900 shadow-2xl'>
        <div className='p-6 sm:p-7'>
          <div className='flex flex-col space-y-5'>
            <div className='flex items-start gap-3'>
              <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300'>
                <IconUser size={18} />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-white'>
                  Welcome to {APP_NAME}
                </h2>
                <p className='mt-1 text-sm text-slate-400'>
                  Choose a username and nickname to get started.
                </p>
              </div>
            </div>

            <div className='w-full space-y-3'>
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

            {messageResponse && (
              <div
                className={`w-full rounded-lg border px-3 py-2 text-center text-sm font-medium ${
                  messageResponse.includes('success')
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                }`}
              >
                {messageResponse}
              </div>
            )}

            <button
              onClick={handleConfirmation}
              className='w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50'
              disabled={!usernameInput.value || !nicknameInput.value}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
