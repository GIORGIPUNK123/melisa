import { Bell, BellOff, X } from 'lucide-react';
import { useAvatarUrl } from '../../../shared/hooks/useAvatarUrl';
import { ConversationT } from '../../../types';

const MemberAvatar = (props: { src?: string | null; name: string }) => {
  const src = useAvatarUrl(props.src);
  return (
    <img
      src={src ?? undefined}
      alt={props.name.charAt(0).toLocaleUpperCase()}
      className='flex justify-center items-center w-8 h-8 rounded-full bg-primary/25'
    />
  );
};

const Users = (props: {
  onlineUserIds: Set<string>;
  conversationMembers: ConversationT['conversationMembers'];
}) => {
  const { onlineUserIds, conversationMembers } = props;
  return (
    <div className='flex flex-col gap-4 px-4 mt-4 w-full items'>
      {conversationMembers.map((member) => (
        <div
          key={member.id}
          className='flex gap-2 justify-between items-center px-2 py-2 w-full rounded-md cursor-pointer hover:bg-surface-hover'
        >
          <MemberAvatar src={member.avatarUrl} name={member.nickname} />
          <span className='text-foreground'>{member.nickname}</span>

          <div className='flex justify-center items-center w-8 h-8'>
            <div
              className={`${onlineUserIds.has(member.id) ? 'bg-primary' : 'bg-muted'} rounded-full w-4 h-4`}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ChatInfo = (props: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  conversation: ConversationT;
  toggleMute: () => void;
  onlineUserIds: Set<string>;
  otherConversationMembers: ConversationT['conversationMembers'];
}) => {
  const {
    conversation,
    isOpen,
    setOpen,
    toggleMute,
    onlineUserIds,
    otherConversationMembers,
  } = props;

  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        aria-hidden='true'
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-30 bg-background/40 backdrop-blur-xs transition-opacity duration-300 xl:hidden ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Main Drawer Container */}
      <div
        className={`z-40 flex flex-col items-center bg-panel shadow-panel transition-all duration-300 ease-in-out shrink-0
          /* Mobile Drawer Positioning */
          fixed inset-y-0 right-0 w-[min(86vw,18rem)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          /* Desktop Collapsible Sidebar (toggles width smooth) */
          xl:static xl:h-full xl:translate-x-0 xl:shadow-none xl:overflow-hidden ${
            isOpen ? 'xl:w-72 xl:opacity-100' : 'xl:w-0 xl:opacity-0'
          }`}
      >
        {/* Inner wrapper with fixed width to avoid text wrapping glitches during resize */}
        <div className='flex overflow-y-auto flex-col items-center w-72 h-full'>
          <div className='flex justify-end items-end pb-2 mr-8 w-full h-14 xl:hidden'>
            <div
              onClick={() => setOpen(false)}
              className='p-1 transition-colors duration-200 cursor-pointer text-muted hover:text-primary'
            >
              <X color='' />
            </div>
          </div>
          <div className='flex relative justify-center items-center mt-4 w-20 h-20 text-xl font-semibold rounded-full bg-primary/25 shrink-0'>
            {conversation.name.charAt(0).toLocaleUpperCase()}
            <div
              className={`absolute right-0 bottom-0 w-2.5 h-2.5 ${
                onlineUserIds.has(otherConversationMembers[0]?.id)
                  ? 'bg-primary'
                  : 'bg-muted'
              } rounded-full`}
            ></div>
          </div>
          <span className='mt-4 text-lg font-semibold text-foreground'>
            {conversation.name}
          </span>
          <span
            className={`text-muted text-sm text-center items-center ${
              conversation.type === 'direct' ? 'flex' : 'hidden'
            }`}
          >
            @{otherConversationMembers[0]?.username}
          </span>
          <button
            onClick={() => toggleMute()}
            className='flex justify-between items-center px-4 mt-8 w-full text-sm cursor-pointer focus-ring text-muted'
          >
            <div className='flex relative gap-2 items-center px-2 py-2 w-full rounded-md transition-colors duration-200 hover:bg-surface-hover'>
              <Bell className={`${conversation.muted ? 'hidden' : ''}`} />
              <BellOff className={`${conversation.muted ? '' : 'hidden'}`} />
              <span>
                {conversation.muted
                  ? 'Unmute Notifications'
                  : 'Mute Notifications'}
              </span>
              <div className='relative ml-auto w-11 h-6 shrink-0'>
                <input
                  type='checkbox'
                  checked={conversation.muted}
                  onChange={toggleMute}
                  aria-label={
                    conversation.muted
                      ? 'Unmute notifications'
                      : 'Mute notifications'
                  }
                  className='absolute inset-0 z-10 w-full h-full rounded-full appearance-none cursor-pointer peer'
                />
                <span className='absolute inset-0 rounded-full transition-colors duration-200 pointer-events-none bg-surface peer-checked:bg-primary after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-foreground after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5'></span>
              </div>
            </div>
          </button>
          {conversation.type === 'group' && (
            <div className='mt-4 w-full'>
              <Users
                onlineUserIds={onlineUserIds}
                conversationMembers={conversation.conversationMembers}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
