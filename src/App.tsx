import { Login } from './pages/Login';
import { Main } from './pages/Main';
import { Register } from './pages/Register';
import { BackendStatusBanner } from './components/BackendStatusBanner';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { APP_NAME } from './shared/constants';
import { useEffect } from 'react';

export const App = () => {
  useEffect(() => {
    document.title = APP_NAME;
  }, []);

  return (
    <>
      <BackendStatusBanner />
      <Router>
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Routes>
      </Router>
    </>
  );
};
