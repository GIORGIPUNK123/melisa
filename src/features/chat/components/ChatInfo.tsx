import { Bell, BellOff, X } from 'lucide-react';
import { ConversationT } from '../../../types';

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
          className='flex items-center justify-between w-full gap-2 px-2 py-2 hover:bg-[#162231] rounded-md cursor-pointer'
        >
          <img
            src={member.avatarUrl}
            alt={member.nickname.charAt(0).toLocaleUpperCase()}
            className='w-8 h-8 rounded-full flex items-center justify-center bg-[#274D49]'
          />
          <span className='text-[#F4F8FB]'>{member.nickname}</span>

          <div className='flex justify-center items-center w-8 h-8'>
            <div
              className={`${onlineUserIds.has(member.id) ? 'bg-[#65E0C1]' : 'bg-[#8192A4]'} rounded-full w-4 h-4`}
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
        className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-xs transition-opacity duration-300 xl:hidden ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Main Drawer Container */}
      <div
        className={`z-40 flex flex-col items-center bg-[#0E1621] shadow-2xl transition-all duration-300 ease-in-out shrink-0
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
              className='p-1 cursor-pointer text-[#8192A4] hover:text-[#65E0C1] transition-colors duration-200'
            >
              <X color='' />
            </div>
          </div>
          <div className='relative font-semibold text-xl flex items-center justify-center bg-[#274d49] w-20 h-20 mt-4 rounded-full shrink-0'>
            {conversation.name.charAt(0).toLocaleUpperCase()}
            <div
              className={`absolute -right-0 -bottom-0 w-2.5 h-2.5 ${
                onlineUserIds.has(otherConversationMembers[0]?.id)
                  ? 'bg-[#65E0C1]'
                  : 'bg-[#8192A4]'
              } rounded-full`}
            ></div>
          </div>
          <span className='mt-4 text-lg text-[#F4F8FB] font-semibold'>
            {conversation.name}
          </span>
          <span
            className={`text-[#8192A4] text-sm text-center items-center ${
              conversation.type === 'direct' ? 'flex' : 'hidden'
            }`}
          >
            @{otherConversationMembers[0]?.username}
          </span>
          <button
            onClick={() => toggleMute()}
            className='flex text-[#8192A4] items-center justify-between w-full px-4 mt-8 text-sm cursor-pointer'
          >
            <div className='relative py-2 w-full flex items-center gap-2 hover:bg-[#162231] px-2 rounded-md transition-colors duration-200'>
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
                <span className='pointer-events-none absolute inset-0 rounded-full bg-gray-500 transition-colors duration-200 peer-checked:bg-[#65E0C1] after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-5'></span>
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
