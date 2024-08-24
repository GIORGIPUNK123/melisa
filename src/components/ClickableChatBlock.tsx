export const ClickableChatBlock = (props: {
  id: number;
  selected: boolean;
  name: string;
  latestMsg: string;
  callback: any;
}) => {
  const { id, selected, name, latestMsg, callback } = props;
  return (
    <div
      onClick={() => callback(id)}
      className={` ${
        selected ? 'bg-slate-950' : ''
      } w-full h-20 flex items-center cursor-pointer hover:bg-slate-950`}
    >
      <div className='flex aspect-square h-16  rounded-full border-white border-4 border-solid justify-center items-center text-center'>
        <span className='text-white'>img</span>
      </div>
      <div className='h-full ml-4 flex flex-col text-left justify-center'>
        <span className='text-white text-xl'>{name}</span>
        <span className='ml-2 text-slate-200 mt-1 opacity-60'>
          {latestMsg.slice(0, 55)}
        </span>
      </div>
    </div>
  );
};
