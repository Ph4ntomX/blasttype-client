import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DashboardPage from "@/pages/LoggedIn/dashboard";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import PassageBrowserPage from "@/pages/LoggedIn/passages";
import SoloPracticePage from "@/pages/LoggedIn/practice";
import GamesArchivePage from "@/pages/LoggedIn/games-archive";
import GameSelectionPage from "@/pages/LoggedIn/selection";
import GamePage from "@/pages/LoggedIn/room";
import Logout from "@/pages/LoggedIn/logout";
import AdminSelectionPage from "./pages/LoggedIn/Admin/selection";
import AdminPassagesPage from "./pages/LoggedIn/Admin/passages";
import AdminUsersPage from "./pages/LoggedIn/Admin/users";
import AdminChallengesPage from "./pages/LoggedIn/Admin/challenges";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DashboardPage />} path="/dashboard" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<SignupPage />} path="/signup" />
      <Route element={<PassageBrowserPage />} path="/passages" />
      <Route element={<SoloPracticePage />} path="/practice/:id" />
      <Route element={<GamesArchivePage />} path="/games" />
      <Route element={<GameSelectionPage />} path="/selection" />
      <Route element={<GamePage />} path="/room/:difficulty" />
      <Route element={<Logout />} path="/logout" />

      <Route element={<AdminSelectionPage />} path="/admin" />
      <Route element={<AdminPassagesPage />} path="/admin/manage-passages" />
      <Route element={<AdminUsersPage />} path="/admin/manage-users" />
      <Route element={<AdminChallengesPage />} path="/admin/manage-challenges" />
    </Routes>
  );
}

export default App;
