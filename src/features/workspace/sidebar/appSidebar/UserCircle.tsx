import { useAvatarUrl } from '../../../../shared/hooks/useAvatarUrl';

export const UserCircle = (props: {
  avatarUrl?: string;
  firstLetter: string;
}) => {
  const avatarUrl = useAvatarUrl(props.avatarUrl);

  if (avatarUrl) {
    return (
      <div className='w-10 h-10 rounded-card bg-primary flex items-center justify-center text-sidebar font-bold text-lg cursor-pointer hover:scale-110 ease-in-out duration-100 shadow-panel'>
        <img
          src={avatarUrl}
          alt='User Profile'
          className='object-cover w-full h-full rounded-card'
        />
      </div>
    );
  } else {
    return (
      <div className='w-10 h-10 rounded-card bg-primary flex items-center justify-center text-sidebar font-bold text-lg cursor-pointer hover:scale-110 ease-in-out duration-100 shadow-panel text-center'>
        {props.firstLetter.toLocaleUpperCase()}
      </div>
    );
  }
};
