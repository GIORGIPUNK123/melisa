import { TextInput } from '../atoms/TextInput';
import { useFormInput } from '../hooks/useFormInput';
import { useAddFriend } from '../hooks/useAddFriend';
import { User } from '@supabase/supabase-js';

export const AddFriendsModal = (props: {
  isOpen: boolean;
  setIsOpen: any;
  user: User;
}) => {
  const { messageResponse, addFriend, resetMessageResponse, isLoading } =
    useAddFriend();
  const userNameInput = useFormInput('', resetMessageResponse);
  const handleAddFriend = () => {
    addFriend(props.user, userNameInput.value);
  };

  return (
    <div
      className={`${
        !props.isOpen ? 'hidden' : ''
      } fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4`}
    >
      <div className='relative w-full max-w-md overflow-hidden border shadow-2xl rounded-2xl border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900'>
        <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'></div>

        <button
          onClick={() => {
            resetMessageResponse();
            userNameInput.reset();
            props.setIsOpen(false);
          }}
          className='absolute flex items-center justify-center w-10 h-10 transition-colors rounded-full top-4 right-4 text-slate-300 hover:text-white hover:bg-slate-700/60'
          aria-label='Close add friend modal'
        >
          ✕
        </button>

        <div className='p-6 sm:p-8'>
          <div className='flex flex-col items-center space-y-5'>
            <div className='flex items-center justify-center text-2xl text-white rounded-full shadow-lg w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600'>
              👥
            </div>

            <div className='text-center'>
              <h2 className='text-2xl font-bold text-white'>Add Friend</h2>
              <p className='mt-1 text-sm text-slate-400'>
                Search by username to send a friend request
              </p>
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
                className={`w-full text-center py-2 px-4 rounded-lg text-sm font-medium ${
                  messageResponse.toLowerCase().includes('success')
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {messageResponse}
              </div>
            )}

            <button
              onClick={handleAddFriend}
              disabled={!userNameInput.value || isLoading}
              className='w-full px-6 py-3 font-semibold text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
