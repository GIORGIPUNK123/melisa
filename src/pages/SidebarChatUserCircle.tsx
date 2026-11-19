export const SidebarChatUserCircle = (props: {
  avatarUrl?: string;
  firstLetter: string;
}) => {
  const { avatarUrl, firstLetter } = props;
  if (props.avatarUrl) {
    return (
      <div className='w-10 h-10 rounded-card flex items-center justify-center text-sidebar font-bold text-lg  '>
        <img
          src={avatarUrl}
          alt='User Profile'
          className='object-cover w-full h-full rounded-card'
        />
      </div>
    );
  } else {
    return (
      <div className='text-foreground w-10 h-10 rounded-card bg-background flex items-center justify-center  font-bold text-lg   text-center'>
        {firstLetter.toLocaleUpperCase()}
      </div>
    );
  }
};
