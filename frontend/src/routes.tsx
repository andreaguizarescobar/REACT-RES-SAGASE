import { createBrowserRouter } from "react-router-dom";
import { Login } from "./app/pages/Login.jsx";
import { Dashboard } from "./app/pages/Dashboard.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);
