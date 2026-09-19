import { BrandMark } from '../atoms/BrandMark';

export const Loading = () => {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'>
      <BrandMark size='sm' subtitle='Loading...' />
    </div>
  );
};
