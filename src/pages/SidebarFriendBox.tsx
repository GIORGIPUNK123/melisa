import { FriendT } from '../types';
import { SidebarChatUserCircle } from './SidebarChatUserCircle';

export const SidebarFriendBox = (props: {
  active: boolean;
  onClick: () => void;
  friend: FriendT;
  online: boolean;
}) => {
  const { friend } = props;
  return (
    <div
      onClick={props.onClick}
      className={`flex items-center justify-between h-16 gap-3 px-3 duration-100 ease-in-out ${props.active ? 'bg-[#65E0C11C]' : 'hover:bg-[#0A1018]'} rounded-[3.5px] cursor-pointer`}
    >
      <div className='flex gap-3 items-center'>
        <SidebarChatUserCircle
          firstLetter={friend.username.charAt(0)}
          avatarUrl={friend.avatarUrl}
        />

        <div className='flex flex-col'>
          <span className={`text-sm font-semibold text-white`}>
            {friend.nickname}
          </span>
          <span className={`text-xs  font-medium text-[#56687B]`}>
            {friend.username}
          </span>
        </div>
      </div>

      {props.online && (
        <div className='flex justify-center items-center rounded-full bg-[#65E0C1] w-2.5 h-2.5' />
      )}
    </div>
  );
};
