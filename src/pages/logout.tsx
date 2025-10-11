import { Navigate } from "react-router-dom";

import { getAuthToken, removeAuthToken } from "@/api/auth";
import toast from "react-hot-toast";

export default function Logout() {
  const loggedIn = getAuthToken() !== null;

  if (loggedIn) {
    removeAuthToken();
    toast.success("Successfully logged out");
  }

  return <Navigate to="/login" />;
}