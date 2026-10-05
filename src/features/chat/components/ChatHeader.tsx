import { Ellipsis } from 'lucide-react';
import { ConversationT } from '../../../types';

export const ChatHeader = (props: {
  conversation: ConversationT;
  toggle: () => void;
}) => {
  const { conversation, toggle } = props;
  return (
    <div className='flex items-center justify-between h-[60px] px-4 border-b-[1px] border-solid border-[#3d464fc7]'>
      <div className='flex items-center'>
        <div className='w-8 h-8 rounded-full bg-[#274D49] mr-2 flex items-center justify-center text-white'>
          {conversation.name.charAt(0).toLocaleUpperCase()}
        </div>
        <span className='font-semibold text-white'>{conversation.name}</span>
      </div>
      <div
        onClick={toggle}
        className='cursor-pointer p-1 border border-[#65e0c127] border-solid rounded-lg bg-[#65e0c12a]'
      >
        <Ellipsis color='#65E0C1' />
      </div>
    </div>
  );
};
