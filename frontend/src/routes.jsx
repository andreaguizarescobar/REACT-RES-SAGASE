import { createBrowserRouter } from "react-router-dom";
import { Login } from "./app/pages/user/Login.jsx";
import { Dashboard } from "./app/pages/user/Dashboard.jsx";
import { AdminDashboard } from "./app/pages/admin/AdminDashboard.jsx";
import { ResetPassword } from "./app/pages/user/ResetPassword.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/admin-dashboard",
    element: <AdminDashboard />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />
  }

]);
