import { Login } from './pages/Login';
import { Main } from './pages/Main';
import { Register } from './pages/Register';
import { BackendStatusBanner } from './components/BackendStatusBanner';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

export const App = () => {
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
