import { ArrowLeft, Ellipsis } from 'lucide-react';
import { ConversationMemberT, ConversationT } from '../../../types';

export const ChatHeader = (props: {
  onlineUserIds: Set<string>;
  otherConversationMembers: ConversationMemberT[];
  conversation: ConversationT;
  toggle: () => void;
  isActive: boolean;
  onBack?: () => void;
}) => {
  const { conversation, toggle, onBack, isActive } = props;
  const hasAnyActiveMember = props.otherConversationMembers.some((member) =>
    props.onlineUserIds.has(member.id),
  );
  return (
    <div className='flex items-center justify-between h-[60px] px-4 border-b-[1px] border-solid border-[#3d464fc7]'>
      <div className='flex items-center min-w-0'>
        {onBack && (
          <button
            type='button'
            aria-label='Back to conversations'
            onClick={onBack}
            className='flex justify-center items-center mr-2 w-9 h-9 rounded-lg shrink-0 text-slate-300 hover:bg-slate-800 xl:hidden'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
        )}
        <div className='w-8 h-8 rounded-full bg-[#274D49] mr-2 flex items-center justify-center text-white'>
          {conversation.name.charAt(0).toLocaleUpperCase()}
        </div>
        <div className='flex flex-col justify-between ml-1'>
          <span className='max-w-[45vw] truncate font-semibold text-white sm:max-w-none'>
            {conversation.name}
          </span>
          <div
            className={`flex items-center mt-1 ${hasAnyActiveMember ? 'block' : 'hidden'}`}
          >
            <div className='w-2 h-2 rounded-full bg-[#65E0C1] mr-2 flex items-center justify-center text-white'></div>
            <span className='text-[#65E0C1] text-[10px] text-center flex items-center justify-center'>
              Active now
            </span>
          </div>
        </div>
      </div>
      <div
        onClick={toggle}
        className={` hover:scale-110 duration-200 cursor-pointer p-1 border border-[#65e0c127] border-solid rounded-lg ${isActive ? 'bg-[#65e0c12a]' : ''}`}
      >
        <Ellipsis color='#65E0C1' />
      </div>
    </div>
  );
};
