export const SidebarChatUserCircle = (props: {
  avatarUrl?: string;
  firstLetter: string;
}) => {
  const { avatarUrl, firstLetter } = props;
  if (props.avatarUrl) {
    return (
      <div className='w-10 h-10 rounded-2xl flex items-center justify-center text-[#0A1018] font-bold text-lg  '>
        <img
          src={avatarUrl}
          alt='User Profile'
          className='object-cover w-full h-full rounded-2xl'
        />
      </div>
    );
  } else {
    return (
      <div className='text-white w-10 h-10 rounded-2xl bg-[#080D14] flex items-center justify-center  font-bold text-lg   text-center'>
        {firstLetter.toLocaleUpperCase()}
      </div>
    );
  }
};
