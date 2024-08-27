import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Loading } from './Loading';
import { AddFriendsModal } from './AddFriendsModal';
import { supabase } from '../db/supabase';

export const Main = (props: { user: 'loading' | null | User }) => {
  const { user } = props;
  const [addFriendModalOpen, setAddFriendModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user == null) {
      // navigate('/login');
    }
  }, [user]);
  if (user == 'loading') {
    return <Loading />;
  } else if (user != null) {
    return (
      <div className='w-[100%] flex h-screen bg-slate-900 justify-between'>
        <AddFriendsModal
          isOpen={addFriendModalOpen}
          setIsOpen={setAddFriendModalOpen}
          user={user}
        />
        <div
          className={`flex flex-col justify-between items-center w-full max-w-md text-center border-r-2 border-white border-solid bg-slate-900`}
        >
          <div>
            <h1 className='my-2 text-2xl text-white'>CHATS</h1>
            {/* {chats.map((chat) => {
            return (
              <ClickableChatBlock
                key={chat.id}
                id={chat.id}
                selected={selectedChatId === chat.id}
                name={chat.name}
                latestMsg={chat.latestMsg}
                callback={setselectedChatId}
              />
            );
          })} */}
          </div>
          <div className='w-full'>
            <button
              onClick={async () => {
                const res = await supabase.auth.signOut();
                console.log('res: ', res);
              }}
              className='h-16 w-full text-center flex justify-center items-center hover:bg-slate-950 '
            >
              <h2 className='text-white text-xl'>Log Out</h2>
            </button>
            <button
              onClick={() => {
                setAddFriendModalOpen(true);
              }}
              className='h-16 w-full text-center flex justify-center items-center hover:bg-slate-950 '
            >
              <h2 className='text-white text-xl'>Add Friends</h2>
            </button>
          </div>
        </div>
        <div
          className={`flex flex-col items-center w-full text-center bg-slate-950`}
        >
          {/* {currentChat.type === 'person' ? (
            <PrivateChat otherPersonId={currentChat.id} />
          ) : null} */}
        </div>
        <div className='hidden flex-col items-center w-4/12 text-center bg-slate-900'>
          <h1>2</h1>
        </div>
      </div>
    );
  } else {
    return null;
  }
};
