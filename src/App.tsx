import { useEffect, useState } from 'react';
import { ClickableChatBlock } from './components/ClickableChatBlock';
import { PrivateChat } from './components/PrivateChat';
import { socket } from './socket';
const chats = [
  { id: 1, name: 'chara', latestMsg: 'biwo vera magviandeba', type: 'person' },
  { id: 2, name: 'yura', latestMsg: 'biwo vera magviandeba', type: 'person' },
];
export const App = () => {
  const [selectedChatId, setselectedChatId] = useState<number>();
  const [isConnected, setIsConnected] = useState(socket.connected);
  useEffect(() => {
    setselectedChatId(chats[0].id);
  }, []);
  const currentChat = chats.find(({ id }) => id === selectedChatId);
  console.log('current chat: ', currentChat);
  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return currentChat ? (
    <>
      <div className='w-[100%] flex h-screen  bg-slate-900 justify-between'>
        <div className='flex flex-col items-center w-full max-w-md text-center border-r-2 border-white border-solid bg-slate-900'>
          <h1 className='my-2 text-2xl text-white'>CHATS</h1>
          {chats.map((chat) => {
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
          })}
        </div>
        <div className='flex flex-col items-center w-full text-center bg-slate-950'>
          {currentChat.type === 'person' ? (
            <PrivateChat otherPersonId={currentChat.id} />
          ) : null}
        </div>
        <div className='hidden flex-col items-center w-4/12 text-center bg-slate-900'>
          <h1>2</h1>
        </div>
      </div>
    </>
  ) : null;
};
