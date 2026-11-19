import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { BackendStatusBanner } from './components/BackendStatusBanner';
import { APP_NAME } from './shared/constants';
import { Main } from './pages/Main';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { ChatsPanel } from './pages/ChatsPanel';
import { useInitAuth } from './features/auth/hooks/useAuthInit';
import { FriendsPanel } from './pages/FriendsPanel';
import { usePresenceStore } from './store/usePresenceStore';

export const App = () => {
  useInitAuth();
  useEffect(() => {
    document.title = APP_NAME;
  }, []);

  const onlineUserIds = usePresenceStore((state) => state.onlineUserIds);

  return (
    <BrowserRouter>
      <BackendStatusBanner />
      <Routes>
        <Route path='/' element={<Main onlineUserIds={onlineUserIds} />}>
          {/* ✅ Redirect root '/' to '/chats' so the Outlet actually renders something */}
          <Route index element={<Navigate to='chats' replace />} />
          <Route
            path='chats'
            element={<ChatsPanel onlineUserIds={onlineUserIds} />}
          />
          <Route
            path='friends'
            element={<FriendsPanel onlineUserIds={onlineUserIds} />}
          />
          <Route
            path='requests'
            element={
              <div className='p-4'>
                <h1 className='text-2xl font-bold text-white'>
                  Friend Requests
                </h1>
                <p className='text-[#8192A4]'>Will be added soon</p>
              </div>
            }
          />

          <Route
            path='notifications'
            element={
              <div className='p-4'>
                <h1 className='text-2xl font-bold text-white'>Notifications</h1>
                <p className='text-[#8192A4]'>Will be added soon</p>
              </div>
            }
          />
          <Route path='settings' element={<SettingsPage />} />
        </Route>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};
