import { FaceSlightlySmilingPlus, Reply } from 'lucide-react';
import { MessageT } from '../../../types';
import { ChatAttachment } from './ChatAttachment';
import { ChatFilePayload, readChatFile } from '../utils/chatFiles';

export const Message = (props: {
  message: MessageT;
  owner: boolean;
  openFile: (payload: ChatFilePayload) => Promise<Blob>;
  isSameSender?: boolean; // 👈 Accept the flag from MessageList
}) => {
  const { message: msg, owner, isSameSender } = props;
  const file = readChatFile(msg.content);
  // Only direct-chat images for now; group images still need the group key.
  const viewableImage =
    file && !file.group && file.kind === 'image' ? file : null;

  return (
    <div
      className={`flex items-end mb-1 ${
        owner ? 'justify-end' : 'justify-start'
      }`}
    >
      <div className={`flex flex-col gap-1 ${owner ? 'items-end' : ''}`}>
        {/* 👇 Only show name/label if it's NOT the same sender as the previous message */}
        {!isSameSender && (
          <span className='px-1 text-xs text-gray-400'>
            {owner ? 'You' : msg.sender.nickname}
          </span>
        )}
        <div className='flex items-center'>
          <div
            className={`break-words max-w-2xl shrink px-3 py-2 rounded-md flex justify-center text-xs text-[#E3F3EF] ${
              owner ? 'bg-[#274D49]' : 'bg-[#162231]'
            }`}
          >
            {viewableImage ? (
              <ChatAttachment
                payload={viewableImage}
                openFile={props.openFile}
              />
            ) : (
              <span className='text-[#E3F3EF] text-sm whitespace-pre-wrap'>
                {msg.content}
              </span>
            )}
          </div>
          <div className={`ml-2 flex gap-2 ${owner ? 'hidden' : ''}`}>
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
