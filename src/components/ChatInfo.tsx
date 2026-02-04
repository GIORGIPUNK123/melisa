import { useEffect, useState } from 'react';

interface ConversationMember {
  id: string;
  username: string;
  nickname: string;
  avatar_url?: string;
}

export const ChatInfo = (props: {
  hasActiveConversation: boolean;
  members?: ConversationMember[];
  isVisible?: boolean;
  onClose?: () => void;
  onViewProfile?: (username: string) => void;
  onBlockUser?: (username: string) => void;
  onDeleteChat?: () => void;
}) => {
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await (window as any).supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getUser();
  }, []);

  return (
    <>
      {/* Mobile overlay */}

      <div
        className='fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden'
        onClick={props.onClose}
      />

      {/* Chat Info Panel */}
      <div
        className={`
        fixed lg:relative inset-y-0 right-0 z-50
        flex flex-col w-72 sm:w-80 lg:w-72 h-screen border-l border-slate-700 bg-slate-800 p-4 sm:p-6
        transform transition-transform duration-300 ease-in-out
      `}
      >
        <div className='flex items-center justify-between mb-6'>
          <h3 className='text-lg font-bold text-white'>Chat Info</h3>
          <button
            onClick={props.onClose}
            className='p-1 transition-colors rounded lg:hidden text-slate-400 hover:text-white hover:bg-slate-800'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {!props.hasActiveConversation ? (
          <div className='flex flex-col items-center justify-center flex-1 text-center text-slate-400'>
            <div className='mb-2 text-3xl'>🫥</div>
            <p>Select a chat to see details</p>
          </div>
        ) : (
          <div className='space-y-4'>
            <div>
              <p className='text-sm tracking-wider uppercase text-slate-400'>
                Members ({props.members?.length || 0})
              </p>
              <div className='mt-3 space-y-2'>
                {props.members && props.members.length > 0 ? (
                  props.members.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => {
                        if (
                          member.id !== currentUserId &&
                          props.onViewProfile
                        ) {
                          props.onViewProfile(member.username);
                        }
                      }}
                      className={`flex items-center gap-3 p-3 transition-colors rounded-lg ${
                        member.id !== currentUserId
                          ? 'cursor-pointer bg-slate-700 hover:bg-slate-600'
                          : 'bg-slate-800'
                      }`}
                    >
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.nickname}
                          className='object-cover w-10 h-10 rounded-full'
                        />
                      ) : (
                        <div className='flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
                          {member.nickname.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className='flex-1 min-w-0'>
                        <div className='text-sm font-medium text-white'>
                          {member.nickname}
                        </div>
                        <div className='text-xs text-slate-400'>
                          @{member.username}
                        </div>
                      </div>
                      {member.id === currentUserId && (
                        <span className='px-2 py-1 text-xs text-white bg-indigo-600 rounded'>
                          You
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className='text-sm text-slate-500'>No members</div>
                )}
              </div>
            </div>

            <div className='pt-4 border-t border-slate-700'>
              <p className='text-sm tracking-wider uppercase text-slate-400'>
                Actions
              </p>
              <div className='mt-3 space-y-2'>
                <button className='w-full px-3 py-2 text-sm text-left transition-colors rounded-lg text-slate-300 hover:bg-slate-700'>
                  📌 Pin Chat
                </button>
                <button className='w-full px-3 py-2 text-sm text-left transition-colors rounded-lg text-slate-300 hover:bg-slate-700'>
                  🔔 Mute Notifications
                </button>
                {props.members &&
                  props.members.find((m) => m.id !== currentUserId) && (
                    <button
                      onClick={() => {
                        const otherUser = props.members?.find(
                          (m) => m.id !== currentUserId,
                        );
                        if (otherUser && props.onBlockUser) {
                          props.onBlockUser(otherUser.username);
                        }
                      }}
                      className='w-full px-3 py-2 text-sm text-left text-orange-400 transition-colors rounded-lg hover:bg-slate-700'
                    >
                      🚫 Block User
                    </button>
                  )}
                <button
                  onClick={props.onDeleteChat}
                  className='w-full px-3 py-2 text-sm text-left text-red-400 transition-colors rounded-lg hover:bg-slate-700'
                >
                  🗑️ Delete Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
