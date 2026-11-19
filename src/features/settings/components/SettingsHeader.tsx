import { useNavigate } from 'react-router';
import { IconArrowLeft, IconLogOut } from '../../../atoms/Icon';
import { useAuth } from '../../auth/hooks/useAuth';

export const SettingsHeader = () => {
  const navigate = useNavigate();
  const { authLogout } = useAuth();

  const handleLogout = async () => {
    await authLogout();
    navigate('/login');
  };

  return (
    <header className='sticky top-0 z-30 border-b border-solid border-border bg-sidebar/95 backdrop-blur-md'>
      <div className='mx-auto flex h-16 w-full max-w-[1036px] items-center gap-3 px-4 sm:px-6 lg:px-8'>
        <button
          type='button'
          onClick={() => navigate('/')}
          className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-solid border-border-strong bg-panel-raised text-muted-foreground transition-colors cursor-pointer hover:border-border-strong hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
          aria-label='Back to chats'
          title='Back to chats'
        >
          <IconArrowLeft size={17} />
        </button>

        <div className='min-w-0 flex-1'>
          <h1 className='truncate text-[17px] font-semibold tracking-tight text-foreground'>
            Settings
          </h1>
          <p className='hidden truncate text-[11px] text-muted sm:block'>
            Manage your profile and account
          </p>
        </div>

        <button
          type='button'
          onClick={() => void handleLogout()}
          className='inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-[12px] font-semibold text-muted transition-colors cursor-pointer hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/25'
          aria-label='Log out'
          title='Log out'
        >
          <IconLogOut size={15} />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
};
