import { BrandMark } from '../../../atoms/BrandMark';

export const EmptyChatState = () => {
  return (
    <div className='flex flex-col items-center justify-center flex-1 h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'>
      <div className='space-y-4 text-center'>
        <BrandMark subtitle='Select a chat to start messaging' />
      </div>
    </div>
  );
};
