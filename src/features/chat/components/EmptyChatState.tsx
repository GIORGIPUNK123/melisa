export const EmptyChatState = (props: { className?: string }) => {
  return (
    <div
      className={`${props.className ?? ''} flex flex-col h-full w-full min-w-0 bg-background`}
    >
      <div className='flex items-center justify-between h-[60px] px-4 border-b-[1px] border-solid border-border-strong'>
        <span className='font-semibold text-foreground'>No Conversation</span>
      </div>
      <div className='flex-1 p-4 overflow-y-auto'>
        <div className='text-subtle text-sm'>
          Select a conversation to start chatting.
        </div>
      </div>
    </div>
  );
};
