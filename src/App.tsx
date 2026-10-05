import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { BackendStatusBanner } from './components/BackendStatusBanner';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { APP_NAME } from './shared/constants';
import { useEffect } from 'react';
import { Main } from './pages/Main';
import { SettingsPage } from './features/settings/pages/SettingsPage';
import { ChatsPanel } from './pages/ChatsPanel';

export const App = () => {
  useEffect(() => {
    document.title = APP_NAME;
  }, []);
  return (
    <>
      <BackendStatusBanner />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path='/' element={<Main />}>
            <Route path='chats' element={<ChatsPanel />} />
            <Route path='friends' element={<SettingsPage />} />
            {/* <Route path='notifications' element={<NotificationsPanel />} /> */}
            {/* Optional: default redirect when hitting root */}
            <Route index element={<Navigate to='chats' replace />} />
            <Route path='/settings' element={<SettingsPage />} />
          </Route>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/settings' element={<SettingsPage />} />
        </Routes>
      </Router>
    </>
  );
};
