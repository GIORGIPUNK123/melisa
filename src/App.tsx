import { ErrorBoundary } from './atoms';
import { Login } from './components/Login';
import { Main } from './components/Main';
import { Register } from './components/Register';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

export const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};
