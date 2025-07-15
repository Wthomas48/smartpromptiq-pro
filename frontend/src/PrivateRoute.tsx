import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
