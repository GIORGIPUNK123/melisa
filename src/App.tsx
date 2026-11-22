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
import { usePreferencesStore } from './store/usePreferencesStore';
import { applyAppearance } from './shared/utils/appearance';

export const App = () => {
  useInitAuth();
  useEffect(() => {
    document.title = APP_NAME;
  }, []);

  const accent = usePreferencesStore((state) => state.accent);
  const textSize = usePreferencesStore((state) => state.textSize);

  useEffect(() => {
    applyAppearance(accent, textSize);
  }, [accent, textSize]);

  const onlineUserIds = usePresenceStore((state) => state.onlineUserIds);

  return (
    <BrowserRouter>
      <BackendStatusBanner />
      <Routes>
        <Route path='/' element={<Main onlineUserIds={onlineUserIds} />}>
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
            element={<RequestsPanel onlineUserIds={onlineUserIds} />}
          />
          <Route
            path='notifications'
            element={<NotificationsPanel onlineUserIds={onlineUserIds} />}
          />
          <Route path='settings' element={<SettingsPage />} />
        </Route>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
};
