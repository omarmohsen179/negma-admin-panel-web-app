// Mirror of backend AdminType enum (AdminPanelApi.Models.AdminType)
export const ADMIN_TYPE = {
  Operation: 0,
  Finance: 1,
  CustomerSupport: 2,
  SuperAdmin: 3,
};

export const DEFAULT_LANDING_PATH = "/reservations";
export const SUPER_ADMIN_LANDING_PATH = "/home/default";

export const getCurrentUserAdminType = () => {
  try {
    const accessToken = JSON.parse(localStorage.getItem("accessToken"));
    return accessToken?.user?.AdminType ?? null;
  } catch {
    return null;
  }
};

export const isSuperAdmin = (adminType) =>
  adminType === ADMIN_TYPE.SuperAdmin;

// Returns true if the given route is visible to the given AdminType.
// Route opts in via `allowedAdminTypes`:
//   - "all"               -> everyone with a valid AdminType can see it
//   - [ADMIN_TYPE.X, ...] -> only listed AdminTypes
//   - undefined           -> treated as SuperAdmin-only (safe default)
export const isPathAllowedForAdminType = (route, adminType) => {
  if (adminType == null) return false;
  const allowed = route?.allowedAdminTypes;
  if (allowed === "all") return true;
  if (Array.isArray(allowed)) return allowed.includes(adminType);
  return adminType === ADMIN_TYPE.SuperAdmin;
};

export const getLandingPathForAdminType = (adminType) =>
  isSuperAdmin(adminType) ? SUPER_ADMIN_LANDING_PATH : DEFAULT_LANDING_PATH;
