import { useEffect, useState } from 'react';
import { getPersonById } from '../functions/getPersonById';
import { MessageBlock } from './MessageBlock';
import { getUserMessages } from '../functions/getUserMessages';
import { MessageType, UserType } from '../types';
import { sendPrivate } from '../functions/sendMessage';
import { socket } from '../socket';

export const PrivateChat = (props: { otherPersonId: number }) => {
  const { otherPersonId } = props;
  const loggedInId = 2;

  const [otherPerson, setOtherPerson] = useState<UserType>();
  const [otherPersonMessages, setOtherPersonMessages] = useState<MessageType[]>(
    []
  );
  const [loggedInMessages, setLoggedInMessages] = useState<MessageType[]>([]);

  const [inputText, setInputText] = useState<string>('');

  const mergedMessages = [...loggedInMessages, ...otherPersonMessages].sort(
    (a, b) => {
      if (a.sent_datetime > b.sent_datetime) {
        return 1;
      } else if (a.sent_datetime < b.sent_datetime) {
        return -1;
      }
      return 0;
    }
  );

  useEffect(() => {
    const getChatInfo = async () => {
      setOtherPerson(await getPersonById(otherPersonId));
      setOtherPersonMessages(await getUserMessages(otherPersonId, loggedInId));
      setLoggedInMessages(await getUserMessages(loggedInId, otherPersonId));
    };

    // getChatInfo();
  }, [otherPersonId]);
  socket.on(`${loggedInId + otherPersonId}`, (data) => {
    console.log('data: ', data);
  });

  console.log('mergedMessages:', mergedMessages);
  const sendMsg = async (
    text: string,
    sender_id: number,
    reciever_id: number
  ) => {
    await sendPrivate(text, sender_id, reciever_id);
  };

  return otherPerson ? (
    <div className='flex flex-col w-full h-full'>
      <div className='flex justify-between w-full h-20'>
        <div className='flex justify-between w-full'>
          <h1 className='my-6 ml-16 text-3xl text-white'>
            {otherPerson.nickname}
          </h1>
          <div className='flex justify-between items-center mr-16 w-60 text-center'>
            <div className='text-xl text-white cursor-pointer'>search</div>
            <div className='text-xl text-white cursor-pointer'>call</div>
            <div className='text-xl text-white cursor-pointer'>sidebar</div>
          </div>
        </div>
      </div>
      <div className='h-2 bg-white' />
      <div className='flex-grow mx-8'>
        {mergedMessages.map((msg) => (
          <MessageBlock
            key={msg.id}
            message={msg.message}
            other={msg.from_id !== loggedInId}
          />
        ))}
      </div>
      <div className='flex items-center mb-4 h-12'>
        <input
          className='px-4 mx-8 w-full h-full rounded outline-none'
          type='text'
          name='text'
          id='text'
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
          }}
        />
        <button
          onClick={() => {
            sendMsg(inputText, loggedInId, otherPersonId);
            setInputText('');
          }}
          className='px-8 mr-8 h-full font-semibold text-purple-700 bg-transparent rounded border border-purple-700 hover:bg-purple-700 hover:text-white hover:border-transparent'
        >
          Send
        </button>
      </div>
    </div>
  ) : (
    <div className='flex items-end h-20'>
      <h1 className='my-2 text-2xl text-white'>LOADING</h1>
    </div>
  );
};
