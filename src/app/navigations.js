import { lazy } from "react";
import { Navigate } from "react-router-dom";
import Loadable from "./components/Loadable";
//import Users from "./pages/Users/Users"
import AuthGuard from "./auth/AuthGuard";
import { authRoles } from "./auth/authRoles";
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
const Analytics = Loadable(lazy(() => import("app/views/dashboard/Analytics")));
const Projects = Loadable(lazy(() => import("./pages/Projects/Projects")));
const Units = Loadable(lazy(() => import("./pages/Units/Units")));

const Admins = Loadable(lazy(() => import("./pages/Admins/Admins")));
const Sales = Loadable(lazy(() => import("./pages/Sales/Sales")));
const Users = Loadable(lazy(() => import("./pages/Users/Users")));
const Orientation = Loadable(lazy(() => import("./pages/Oriantation/Oriantation")));
const Meeting = Loadable(lazy(() => import("./pages/Meeting/Meeting")));
const Clients = Loadable(lazy(() => import("./pages/Clients/Clients")));
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
        element: <Analytics />,
        auth: authRoles.admin,
        name: "Dashboard",
        path: "/dashboard/default",
        icon: "dashboard",
      },
      {
        path: "/admin",
        element: <Admins />,
        auth: authRoles.admin,
        name: "Admin Managment",
        icon: "dashboard",
      },
      {
        path: "/sales",
        element: <Sales />,
        auth: authRoles.admin,
        name: "Sales Managment",
        icon: "dashboard",
      },
      {
        path: "/users",
        element: <Users />,
        auth: authRoles.admin,
        name: "Users Managment",
        icon: "dashboard",
      },
      {
        path: "/brokers",
        element: <Brokers />,
        auth: authRoles.admin,
        name: "Brokers Managment",
        icon: "dashboard",
      },
      {
        path: "/projects",
        element: <Projects />,
        auth: authRoles.admin,
        name: "Projects Managment",
        icon: "dashboard",
      },
      {
        path: "/units",
        element: <Units />,
        auth: authRoles.admin,
        name: "Units Managment",
        icon: "dashboard",
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
        icon: "dashboard",
        name: "Reservations Managment",
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
        icon: "dashboard",
        name: "Session logs",
      },
      {
        path: "/templates",
        element: <Templates />,
        auth: authRoles.admin,
        icon: "description",
        name: "Templates",
      },
      {
        path: "/templates/:key/edit",
        element: <TemplateEditor />,
        auth: authRoles.admin,
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
  { path: "/", element: <Navigate to="dashboard/default" /> },
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
const load_pages = (roles) => {
  const push = [];
  const validPages = pages[0].children.filter((e) =>
    roles.find((role) => role === e.key)
  );

  // for (const property in groupByKey(validPages, "categoryId")) {
  //   if (category.find((e) => e.Id == property))
  //     push.push({
  //       name: category.find((e) => e.Id == property).name,
  //       icon: category.find((e) => e.Id == property).icon, // badge: { value: "30+", color: "secondary" },
  //       children: groupByKey(validPages, "categoryId")[property],
  //     });
  // }
  console.log(pages[0].children.filter((e) => !e.key));
  return [
    ...pages[0].children.filter((e) => !e.key),
    // { label: "PAGES", type: "label" },
    // ...push,
  ];
};

export const navigations = load_pages;
