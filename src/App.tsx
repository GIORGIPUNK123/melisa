import { ErrorBoundary } from './atoms';
import { Login } from './components/Login';
import { Main } from './components/Main';
import { Register } from './components/Register';
import { BackendStatusBanner } from './components/BackendStatusBanner';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

export const App = () => {
  return (
<<<<<<< HEAD
    <ErrorBoundary>
=======
    <>
      <BackendStatusBanner />
>>>>>>> d45a493 (backend status)
      <Router>
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Routes>
      </Router>
<<<<<<< HEAD
    </ErrorBoundary>
=======
    </>
>>>>>>> d45a493 (backend status)
  );
};
