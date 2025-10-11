import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DashboardPage from "@/pages/dashboard";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import PassageBrowserPage from "@/pages/passages";
import Logout from "./pages/logout";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DashboardPage />} path="/dashboard" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<SignupPage />} path="/signup" />
      <Route element={<PassageBrowserPage />} path="/passages" />
      <Route element={<div>Practice Page</div>}  path="/practice/:passageId" />
      <Route element={<Logout />} path="/logout" />
    </Routes>
  );
}

export default App;
