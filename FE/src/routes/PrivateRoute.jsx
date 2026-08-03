import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== "ROLE_ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
