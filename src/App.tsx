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
import About from "./pages/About";
import ResumeBuilder from "./pages/ResumeBuilder";
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import OpportunityForm from "./pages/OpportunityForm";
import EmployerPortal from "./pages/EmployerPortal";
import NextChapter from "./pages/NextChapter";

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
        <Route path="about" element={<About />} />
        <Route path="resume" element={<ResumeBuilder />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="opportunities/:id" element={<OpportunityDetail />} />
        <Route path="next-chapter" element={guard(<NextChapter />)} />
        <Route path="employer" element={guard(<EmployerPortal />)} />
        <Route path="employer/new" element={guard(<OpportunityForm />)} />
        <Route path="employer/edit/:id" element={guard(<OpportunityForm />)} />
        <Route path="requests" element={guard(<Requests />)} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
