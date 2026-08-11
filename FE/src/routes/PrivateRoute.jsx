import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children, adminOnly = false, staffOnly = false }) => {
  const { user, token } = useSelector((state) => state.auth);
  const location = useLocation();

  const effectiveToken = token || localStorage.getItem("token");

  if (!effectiveToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== "ROLE_ADMIN") {
    return <Navigate to="/" replace />;
  }

  if (staffOnly && user?.role !== "ROLE_STAFF" && user?.role !== "ROLE_ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;