export const EmptyChatState = () => {
  return (
    <div className='flex flex-col items-center justify-center flex-1 h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'>
      <div className='space-y-4 text-center'>
        <div className='text-6xl'>💬</div>
        <h2 className='text-2xl font-bold text-white'>
          Select a chat to start
        </h2>
        <p className='max-w-md text-slate-400'>
          Choose a conversation from your friends list to begin messaging
        </p>
      </div>
    </div>
  );
};
