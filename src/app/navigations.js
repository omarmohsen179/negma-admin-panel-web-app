import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Loadable from "./components/Loadable";
//import Users from "./pages/Users/Users"
import AuthGuard from "./auth/AuthGuard";
import { authRoles } from "./auth/authRoles";
import { ADMIN_TYPE, isPathAllowedForAdminType } from "./auth/adminTypes";
import MatxLayout from "./components/MatxLayout/MatxLayout";

const JwtLogin = Loadable(lazy(() => import("app/views/sessions/JwtLogin")));
const JwtRegister = Loadable(
  lazy(() => import("app/views/sessions/JwtRegister"))
);
const JwtForgotPassword = Loadable(
  lazy(() => import("app/views/sessions/ForgotPassword"))
);
const JwtResetPassword = Loadable(
  lazy(() => import("app/views/sessions/ResetPassword"))
);
const NotFound = Loadable(lazy(() => import("app/views/sessions/NotFound")));
const Home = Loadable(lazy(() => import("app/views/dashboard/home")));
const AnalyticsPage = Loadable(lazy(() => import("./pages/Analytics/Analytics")));
const Projects = Loadable(lazy(() => import("./pages/Projects/Projects")));
const Units = Loadable(lazy(() => import("./pages/Units/Units")));

const Admins = Loadable(lazy(() => import("./pages/Admins/Admins")));
const Sales = Loadable(lazy(() => import("./pages/Sales/Sales")));
const Users = Loadable(lazy(() => import("./pages/Users/Users")));
// const Orientation = Loadable(lazy(() => import("./pages/Oriantation/Oriantation")));
// const Meeting = Loadable(lazy(() => import("./pages/Meeting/Meeting")));
// const Clients = Loadable(lazy(() => import("./pages/Clients/Clients")));
const Reservations = Loadable(
  lazy(() => import("./pages/Reservations/Reservations"))
);
const SessionLogs = Loadable(
  lazy(() => import("./pages/SessionLogs/SessionLogs"))
);
const Brokers = Loadable(lazy(() => import("./pages/Brokers/Brokers")));
const Templates = Loadable(lazy(() => import("./pages/Templates/Templates")));
const TemplateEditor = Loadable(lazy(() => import("./pages/Templates/TemplateEditor")));

export const category = [
  {
    Id: 7,
    name: "Reports",
    path: "/reports",
    icon: "assessment",
    badge: { value: "30+", color: "secondary" },
  },
  {
    Id: 1,
    name: "Inventory",
    path: "/inventory",
    icon: "device_hub",
    badge: { value: "30+", color: "secondary" },
  },
  // {
  //   Id: 2,
  //   name: "Identifications",
  //   path: "/identifications",
  //   icon: "dashboard",
  //   badge: { value: "30+", color: "secondary" },
  // },
  {
    Id: 3,
    name: "Inventory",
    path: "/inventory",
    icon: "format_line_spacing",
    badge: { value: "30+", color: "secondary" },
  },
  // {
  //   Id: 4,
  //   name: "Design",
  //   path: "/design",
  //   icon: "brush",
  //   badge: { value: "30+", color: "secondary" },
  // },

  {
    Id: 5,
    name: "POS",
    path: "/pos",
    icon: "local_grocery_store",
  badge: { value: "30+", color: "secondary" },
  },
  {
    Id: 0,
    name: "System",
    icon: "build",
    path: "/system",
    badge: { value: "30+", color: "secondary" },
  },
];
export const pages = [
  {
    element: (
      <AuthGuard>
        <MatxLayout />
      </AuthGuard>
    ),
    children: [
      {
        element: <Home />,
        auth: authRoles.admin,
        allowedAdminTypes: "all",
        name: "Home",
        path: "/home/default",
        icon: "home",
      },
      {
        path: "/analytics",
        element: <AnalyticsPage />,
        auth: authRoles.admin,
        allowedAdminTypes: [ADMIN_TYPE.SuperAdmin],
        name: "Analytics",
        icon: "insights",
      },
      {
        path: "/admin",
        element: <Admins />,
        auth: authRoles.admin,
        allowedAdminTypes: [ADMIN_TYPE.SuperAdmin],
        name: "Admin Management",
        icon: "admin_panel_settings",
      },
      {
        path: "/sales",
        element: <Sales />,
        auth: authRoles.admin,
        allowedAdminTypes: [ADMIN_TYPE.SuperAdmin],
        name: "Sales Management",
        icon: "trending_up",
      },
      {
        path: "/users",
        element: <Users />,
        auth: authRoles.admin,
        allowedAdminTypes: [ADMIN_TYPE.SuperAdmin],
        name: "Users Management",
        icon: "people",
      },
      {
        path: "/brokers",
        element: <Brokers />,
        auth: authRoles.admin,
        allowedAdminTypes: [ADMIN_TYPE.SuperAdmin],
        name: "Brokers Management",
        icon: "handshake",
      },
      {
        path: "/projects",
        element: <Projects />,
        auth: authRoles.admin,
        allowedAdminTypes: [ADMIN_TYPE.SuperAdmin],
        name: "Projects Management",
        icon: "apartment",
      },
      {
        path: "/units",
        element: <Units />,
        auth: authRoles.admin,
        allowedAdminTypes: [ADMIN_TYPE.SuperAdmin],
        name: "Units Management",
        icon: "meeting_room",
      },
      // {
      //   path: "/reservations",
      //   element: <Reservations />,
      //   auth: authRoles.admin,
      //   name: "Reservations Managment",
      //   icon: "dashboard",
      // },
      // {
      //   path: "/orientation",
      //   element: <Orientation />,
      //   auth: authRoles.admin,
      //   icon: "dashboard",
      //   name: "Orientation Managment",
      // },
      {
        path: "/reservations",
        element: <Reservations />,
        auth: authRoles.admin,
        allowedAdminTypes: "all",
        icon: "event_available",
        name: "Reservations Management",
      },
      // {
      //   path: "/meeting",
      //   element: <Meeting />,
      //   auth: authRoles.admin,
      //   icon: "dashboard",
      //   name: "Meeting Managment",
      // },
      {
        path: "/sessions",
        element: <SessionLogs />,
        auth: authRoles.admin,
        allowedAdminTypes: [ADMIN_TYPE.SuperAdmin],
        icon: "history",
        name: "Session logs",
      },
      {
        path: "/templates",
        element: <Templates />,
        auth: authRoles.admin,
        allowedAdminTypes: [ADMIN_TYPE.SuperAdmin],
        icon: "description",
        name: "Templates",
      },
      {
        path: "/templates/:key/edit",
        element: <TemplateEditor />,
        auth: authRoles.admin,
        allowedAdminTypes: [ADMIN_TYPE.SuperAdmin],
        icon: "description",
        name: "Template Editor",
      },
    ],
  },
  { path: "/session/404", element: <NotFound /> },
  { path: "/session/signin", element: <JwtLogin /> },
  { path: "/session/signup", element: <JwtRegister /> },
  { path: "/session/forgot-password", element: <JwtForgotPassword /> },
  { path: "/session/reset-password", element: <JwtResetPassword /> },
  { path: "/", element: <Navigate to="home/default" /> },
  { path: "*", element: <NotFound /> },
];
function groupByKey(array, key) {
  return array.reduce((hash, obj) => {
    if (obj[key] === undefined) return hash;
    return Object.assign(hash, {
      [obj[key]]: (hash[obj[key]] || []).concat(obj),
    });
  }, {});
}
const load_pages = (adminType) => {
  return pages[0].children.filter((e) =>
    !e.key && isPathAllowedForAdminType(e, adminType)
  );
};

export const navigations = load_pages;
