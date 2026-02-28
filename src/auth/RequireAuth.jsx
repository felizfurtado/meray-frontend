import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";

const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default RequireAuth;