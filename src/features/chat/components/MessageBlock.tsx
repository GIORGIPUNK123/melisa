export const MessageBlock = (props: { message: string; other?: boolean }) => {
  const { message, other } = props;
  return (
    <div
      className={`w-fit text-left my-2 rounded-lg text-xl py-2 px-4 ${
        other ? 'bg-slate-700' : 'ml-auto bg-purple-800'
      }`}
    >
      <span className='text-white'>{message}</span>
    </div>
  );
};
