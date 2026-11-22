export const SidebarChatUserCircle = (props: {
  avatarUrl?: string;
  firstLetter: string;
  online?: boolean;
}) => {
  const { avatarUrl, firstLetter, online } = props;
  return (
    <div className='relative w-10 h-10 shrink-0'>
      {avatarUrl ? (
        <div className='w-full h-full rounded-card flex items-center justify-center text-sidebar font-bold text-lg'>
          <img
            src={avatarUrl}
            alt='User Profile'
            className='object-cover w-full h-full rounded-card'
          />
        </div>
      ) : (
        <div className='text-foreground w-full h-full rounded-card bg-background flex items-center justify-center font-bold text-lg text-center'>
          {firstLetter.toLocaleUpperCase()}
        </div>
      )}
      {online && (
        <div
          title='Online'
          aria-label='Online'
          className='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-panel'
        />
      )}
    </div>
  );
};
