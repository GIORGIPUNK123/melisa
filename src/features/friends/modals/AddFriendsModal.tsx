import { TextInput } from '../../../atoms/TextInput';
import { useFormInput } from '../../../shared/hooks/useFormInput';
import { useAddFriend } from '../hooks/useAddFriend';
import { User } from '@supabase/supabase-js';
import { handleBackdropClick } from '../../../shared/utils/modal';
import { IconUserPlus, IconX } from '../../../atoms/Icon';

export const AddFriendsModal = (props: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User;
}) => {
  const { messageResponse, addFriend, resetMessageResponse, isLoading } =
    useAddFriend();
  const userNameInput = useFormInput('', resetMessageResponse);
  const handleAddFriend = () => {
    addFriend(userNameInput.value);
  };

  const handleClose = () => {
    resetMessageResponse();
    userNameInput.reset();
    props.setIsOpen(false);
  };

  return (
    <div
      className={`${
        !props.isOpen ? 'hidden' : ''
      } fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm`}
      onClick={(event) => handleBackdropClick(event, handleClose)}
    >
      <div className='relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900 shadow-2xl'>
        <button
          onClick={handleClose}
          className='absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white'
          aria-label='Close add friend modal'
        >
          <IconX size={18} />
        </button>

        <div className='p-6 sm:p-7'>
          <div className='flex flex-col space-y-5'>
            <div className='flex items-start gap-3 pr-8'>
              <div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300'>
                <IconUserPlus size={18} />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-white'>Add friend</h2>
                <p className='mt-1 text-sm text-slate-400'>
                  Search by username to send a friend request.
                </p>
              </div>
            </div>

            <div className='w-full'>
              <TextInput
                {...userNameInput}
                placeholder='Username'
                type='text'
                required={true}
              />
            </div>

            {messageResponse && (
              <div
                className={`w-full rounded-lg border px-3 py-2 text-center text-sm font-medium ${
                  messageResponse.toLowerCase().includes('success')
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                }`}
              >
                {messageResponse}
              </div>
            )}

            <button
              onClick={handleAddFriend}
              disabled={!userNameInput.value || isLoading}
              className='w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isLoading ? 'Sending...' : 'Send request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
