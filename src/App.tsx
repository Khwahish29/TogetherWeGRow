import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/ui";
import Home from "./pages/Home";
import { Login, Signup } from "./pages/Auth";
import CreateProfile from "./pages/CreateProfile";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Careers from "./pages/Careers";
import Mentors from "./pages/Mentors";
import MentorDetail from "./pages/MentorDetail";
import Learn from "./pages/Learn";
import LearnAI from "./pages/LearnAI";
import Buddies from "./pages/Buddies";
import Marketplace from "./pages/Marketplace";
import Requests from "./pages/Requests";
import NotFound from "./pages/NotFound";

export default function App() {
  const guard = (el: JSX.Element) => <RequireAuth>{el}</RequireAuth>;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="profile/create" element={guard(<CreateProfile />)} />
        <Route path="profile" element={guard(<Profile />)} />
        <Route path="dashboard" element={guard(<Dashboard />)} />
        <Route path="careers" element={guard(<Careers />)} />
        <Route path="mentors" element={<Mentors />} />
        <Route path="mentors/:id" element={<MentorDetail />} />
        <Route path="learn" element={<Learn />} />
        <Route path="learn/ai" element={<LearnAI />} />
        <Route path="learn/buddies" element={<Buddies />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="requests" element={guard(<Requests />)} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
