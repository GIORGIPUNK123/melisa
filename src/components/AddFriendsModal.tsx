import { TextInput } from '../atoms/TextInput';
import { useFormInput } from '../hooks/useFormInput';
import { useAddFriend } from '../hooks/useAddFriend';
import { User } from '@supabase/supabase-js';

export const AddFriendsModal = (props: {
  isOpen: boolean;
  setIsOpen: any;
  user: User;
}) => {
  const { messageResponse, addFriend, resetMessageResponse } = useAddFriend();
  const userNameInput = useFormInput('', resetMessageResponse);
  const handleAddFriend = () => {
    addFriend(props.user, userNameInput.value);
  };

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
            resetMessageResponse();
            userNameInput.reset();
            props.setIsOpen(false);
          }}
          className='absolute top-4 right-4 text-white text-2xl hover:bg-slate-700 rounded-full w-10 h-10 flex items-center justify-center'
        >
          X
        </button>
        <div className='flex flex-col items-center'>
          <h2 className='text-white text-xl mb-4'>Add Friend</h2>
          <TextInput
            {...userNameInput}
            placeholder='Username'
            type='text'
            required={true}
          />
          <h2 className='text-white text-md'>{messageResponse}</h2>
          <button
            onClick={handleAddFriend}
            className='text-white text-md mt-5 w-56 h-12 rounded-md hover:bg-slate-900 bg-slate-800'
          >
            Add Friend
          </button>
        </div>
      </div>
    </div>
  );
};
