import { FaceSlightlySmilingPlus, Reply } from 'lucide-react';
import { MessageT } from '../../../types';

export const Message = (props: { message: MessageT; owner: boolean }) => {
  const { message: msg, owner } = props;

  return (
    <div
      className={`flex items-end mb-2 ${
        owner ? 'justify-end' : 'justify-start'
      }`}
    >
      <div className={`flex flex-col gap-2 ${owner ? 'items-end' : ''}`}>
        <span>{owner ? 'You' : msg.sender.nickname}</span>
        <div className='flex items-center'>
          <div
            className={`break-words max-w-2xl shrink px-3 py-2 rounded-md flex justify-center text-xs text-[#E3F3EF] ${
              owner ? 'bg-[#274D49]' : 'bg-[#162231]'
            }`}
          >
            <span className='text-[#E3F3EF] text-sm whitespace-pre-wrap'>
              {msg.content}
            </span>
          </div>
          <div className={`ml-2 flex gap-2 ${owner ? 'hidden' : ''} `}>
            <div className='p-2 flex justify-center items-center rounded-md hover:bg-[#162231] cursor-pointer'>
              <FaceSlightlySmilingPlus className='' size={20} />
            </div>
            <div className='p-2 rounded-md hover:bg-[#162231] cursor-pointer flex justify-center items-center'>
              <Reply className='' size={20} />
            </div>
          </div>
        </div>
      </div>
      <div></div>
    </div>
  );
};
