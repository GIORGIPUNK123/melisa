import { Outlet } from 'react-router';
import { AppSidebar } from '../features/workspace/sidebar/appSidebar/AppSidebar';

export const TestMain = () => {
  return (
    <div className='relative flex w-full h-full min-w-0 overflow-hidden bg-[#080D14]'>
      <AppSidebar />

      <main className='flex flex-1'>
        <Outlet />
      </main>
    </div>
  );
};
