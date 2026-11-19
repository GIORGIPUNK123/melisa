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
    <div className='flex items-center justify-between h-[60px] px-4 border-b-[1px] border-solid border-border-strong'>
      <div className='flex items-center min-w-0'>
        {onBack && (
          <button
            type='button'
            aria-label='Back to conversations'
            onClick={onBack}
            className='focus-ring flex justify-center items-center mr-2 w-9 h-9 rounded-lg shrink-0 text-muted-foreground hover:bg-surface-hover xl:hidden'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
        )}
        <div className='w-8 h-8 rounded-full bg-primary/25 mr-2 flex items-center justify-center text-foreground'>
          {conversation.name.charAt(0).toLocaleUpperCase()}
        </div>
        <div className='flex flex-col justify-between ml-1'>
          <span className='max-w-[45vw] truncate font-semibold text-foreground sm:max-w-none'>
            {conversation.name}
          </span>
          <div
            className={`flex items-center mt-1 ${hasAnyActiveMember ? 'block' : 'hidden'}`}
          >
            <div className='w-2 h-2 rounded-full bg-primary mr-2 flex items-center justify-center text-foreground'></div>
            <span className='text-primary text-[10px] text-center flex items-center justify-center'>
              Active now
            </span>
          </div>
        </div>
      </div>
      <div
        role='button'
        tabIndex={0}
        aria-label='Conversation options'
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
          }
        }}
        className={`focus-ring hover:scale-110 duration-200 cursor-pointer p-1 border border-primary/15 border-solid rounded-lg ${isActive ? 'bg-primary-soft' : ''}`}
      >
        <Ellipsis color='var(--color-primary)' />
      </div>
    </div>
  );
};
