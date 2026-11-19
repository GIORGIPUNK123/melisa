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
import { RequestsPanel } from './pages/RequestsPanel';
import { NotificationsPanel } from './pages/NotificationsPanel';
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
          <Route path='requests' element={<RequestsPanel />} />
          <Route path='friends/requests' element={<RequestsPanel />} />
          <Route path='notifications' element={<NotificationsPanel />} />
          <Route path='settings' element={<SettingsPage />} />
        </Route>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};
