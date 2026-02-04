// import { useEffect, useState } from 'react';
// // import { getPersonById } from '../functions/getPersonById';
// import { MessageBlock } from './MessageBlock';
// // import { getUserMessages } from '../functions/getUserMessages';
// import { MessageT, UserT } from '../types';

// export const PrivateChat = (props: { otherPersonId: number }) => {
//   const { otherPersonId } = props;
//   const loggedInId = 2;

//   const [otherPerson, setOtherPerson] = useState<UserT>();
//   const [otherPersonMessages, setOtherPersonMessages] = useState<MessageT[]>(
//     [],
//   );
//   const [loggedInMessages, setLoggedInMessages] = useState<MessageT[]>([]);
//   const [inputText, setInputText] = useState<string>('');

//   const mergedMessages = [...loggedInMessages, ...otherPersonMessages].sort(
//     (a, b) => {
//       if (a.created_at > b.created_at) {
//         return 1;
//       } else if (a.created_at < b.created_at) {
//         return -1;
//       }
//       return 0;
//     },
//   );

//   useEffect(() => {
//     // const getChatInfo = async () => {
//     //   setOtherPerson(await getPersonById(otherPersonId));
//     //   setOtherPersonMessages(await getUserMessages(otherPersonId, loggedInId));
//     //   setLoggedInMessages(await getUserMessages(loggedInId, otherPersonId));
//     // };
//     // getChatInfo();
//   }, [otherPersonId]);

//   console.log('mergedMessages:', mergedMessages);
//   const sendMsg = async (
//     text: string,
//     sender_id: number,
//     reciever_id: number,
//   ) => {
//     // await sendPrivate(text, sender_id, reciever_id);
//   };

//   return otherPerson ? (
//     <div className='flex flex-col w-full h-full'>
//       <div className='flex justify-between w-full h-20'>
//         <div className='flex justify-between w-full'>
//           <h1 className='my-6 ml-16 text-3xl text-white'>
//             {otherPerson.nickname}
//           </h1>
//           <div className='flex items-center justify-between mr-16 text-center w-60'>
//             <div className='text-xl text-white cursor-pointer'>search</div>
//             <div className='text-xl text-white cursor-pointer'>call</div>
//             <div className='text-xl text-white cursor-pointer'>sidebar</div>
//           </div>
//         </div>
//       </div>
//       <div className='h-2 bg-white' />
//       <div className='flex-grow mx-8'>
//         {mergedMessages.map((msg) => (
//           <MessageBlock
//             key={msg.id}
//             message={msg.content}
//             other={msg.sender_id !== loggedInId}
//           />
//         ))}
//       </div>
//       <div className='flex items-center h-12 mb-4'>
//         <input
//           className='w-full h-full px-4 mx-8 rounded outline-none'
//           type='text'
//           name='text'
//           id='text'
//           value={inputText}
//           onChange={(e) => {
//             setInputText(e.target.value);
//           }}
//         />
//         <button
//           onClick={() => {
//             sendMsg(inputText, loggedInId, otherPersonId);
//             setInputText('');
//           }}
//           className='h-full px-8 mr-8 font-semibold text-purple-700 bg-transparent border border-purple-700 rounded hover:bg-purple-700 hover:text-white hover:border-transparent'
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   ) : (
//     <div className='flex items-end h-20'>
//       <h1 className='my-2 text-2xl text-white'>LOADING</h1>
//     </div>
//   );
// };
