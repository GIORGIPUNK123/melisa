import { Login } from './components/Login';
import { Main } from './components/Main';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Register } from './components/Register';

export const App = () => {
  const { user } = useAuth();
  console.log('user: ', user);
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Main user={user} />,
    },
    {
      path: '/login',
      element: <Login user={user} />,
    },
    {
      path: '/register',
      element: <Register user={user} />,
    },
  ]);
  return <RouterProvider router={router} />;
};
