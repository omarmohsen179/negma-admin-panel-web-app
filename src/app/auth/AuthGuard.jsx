import useAuth from 'app/hooks/useAuth';
import { Navigate, useLocation, matchPath } from 'react-router-dom';
import { pages } from 'app/navigations';
import {
  getCurrentUserAdminType,
  isPathAllowedForAdminType,
  getLandingPathForAdminType,
  DEFAULT_LANDING_PATH,
} from 'app/auth/adminTypes';

const findRouteForPath = (pathname) =>
  pages[0].children.find((route) => route.path && matchPath(route.path, pathname));

const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  if (!isAuthenticated) {
    return <Navigate replace to="/session/signin" state={{ from: pathname }} />;
  }

  const adminType = getCurrentUserAdminType();
  const route = findRouteForPath(pathname);
  if (route && !isPathAllowedForAdminType(route, adminType)) {
    const fallback = adminType == null
      ? DEFAULT_LANDING_PATH
      : getLandingPathForAdminType(adminType);
    return <Navigate replace to={fallback} />;
  }

  return <>{children}</>;
};

export default AuthGuard;
