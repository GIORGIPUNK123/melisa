import { Outlet } from 'react-router';
import { AppSidebar } from '../features/workspace/sidebar/appSidebar/AppSidebar';
import { useChatStore } from '../store/useChatStore';

export const TestMain = () => {
  const activeConversationId = useChatStore(
    (state) => state.activeConversationId,
  );
  return (
    <div className='flex-col-reverse xl:flex-row relative flex w-full h-full min-w-0 overflow-hidden bg-[#080D14]'>
      <div className={`${activeConversationId && 'hidden xl:flex'}`}>
        <AppSidebar />
      </div>

      <main className='flex overflow-hidden flex-1 min-w-0 min-h-0'>
        <Outlet />
      </main>
    </div>
  );
};
