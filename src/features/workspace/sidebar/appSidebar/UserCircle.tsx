export const UserCircle = (props: {
  avatarUrl?: string;
  firstLetter: string;
}) => {
  if (props.avatarUrl) {
    return (
      <div className='w-10 h-10 rounded-2xl bg-[#65E0C1] flex items-center justify-center text-[#0A1018] font-bold text-lg cursor-pointer hover:scale-110 ease-in-out duration-100 shadow-2xl'>
        <img
          src={props.avatarUrl}
          alt='User Profile'
          className='object-cover w-full h-full rounded-2xl'
        />
      </div>
    );
  } else {
    return (
      <div className='w-10 h-10 rounded-2xl bg-[#65E0C1] flex items-center justify-center text-[#0A1018] font-bold text-lg cursor-pointer hover:scale-110 ease-in-out duration-100 shadow-2xl text-center'>
        {props.firstLetter.toLocaleUpperCase()}
      </div>
    );
  }
};
