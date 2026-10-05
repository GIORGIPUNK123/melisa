export const EmptyChatState = () => {
  return (
    <div className='flex flex-col h-full w-full bg-[#080D14]'>
      <div className='flex items-center justify-between h-[60px] px-4 border-b-[1px] border-solid border-[#3d464fc7]'>
        <span className='font-semibold text-white'>No Conversation</span>
      </div>
      <div className='flex-1 p-4 overflow-y-auto'>
        <div className='text-[#56687B] text-sm'>
          Select a conversation to start chatting.
        </div>
      </div>
    </div>
  );
};
