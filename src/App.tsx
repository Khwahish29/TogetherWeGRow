import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/ui";
import { Login, ResetPassword, Signup } from "./pages/Auth";
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
import Questions from "./pages/Questions";
import VibeCheckPage from "./pages/VibeCheckPage";
import Introduce from "./pages/Introduce";
import { SimpleLayout } from "./simple/SimpleLayout";
import Landing from "./pages/Landing";
import { OlderHome, Welcome, YoungerHome } from "./simple/Start";
import { OlderHelp, OlderLearn, OlderShare } from "./simple/Older";
import { YoungerLearn, YoungerShare } from "./simple/Younger";
import { Impact } from "./simple/Extra";
import { FamilyFlow } from "./simple/Family";
import { MeaningScreen } from "./simple/Vibe";
import { OlderEarn } from "./simple/Earn";
import { OlderRoles } from "./simple/Roles";
import { Account, Inbox } from "./simple/Inbox";
import { ScamCheck } from "./simple/Scam";
import { Privacy, Safety, Terms } from "./simple/Legal";

export default function App() {
  const guard = (el: JSX.Element) => <RequireAuth>{el}</RequireAuth>;
  return (
    <Routes>
      {/* The simple experience: one question per screen, no menus. This is the front door. */}
      <Route index element={<Landing />} />
      <Route element={<SimpleLayout />}>
        <Route path="start" element={<Welcome />} />
        <Route path="older" element={<OlderHome />} />
        <Route path="older/share" element={<OlderShare />} />
        <Route path="older/learn" element={<OlderLearn />} />
        <Route path="older/help" element={<OlderHelp />} />
        <Route path="younger" element={<YoungerHome />} />
        <Route path="younger/learn" element={<YoungerLearn />} />
        <Route path="younger/share" element={<YoungerShare />} />
        <Route path="younger/understand" element={<MeaningScreen younger />} />
        <Route path="older/earn" element={<OlderEarn />} />
        <Route path="older/roles" element={<OlderRoles />} />
        <Route path="older/scam" element={<ScamCheck />} />
        <Route path="family" element={<FamilyFlow />} />
        <Route path="impact" element={<Impact />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="account" element={<Account />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="safety" element={<Safety />} />
      </Route>

      {/* The fuller website, kept for deeper features; not linked from the simple screens. */}
      <Route element={<Layout />}>
        {/* The old homepage lived here; send any saved links to the real one. */}
        <Route path="explore" element={<Navigate to="/" replace />} />
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="reset" element={<ResetPassword />} />
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
        <Route path="questions" element={<Questions />} />
        <Route path="vibe-check" element={<VibeCheckPage />} />
        <Route path="introduce" element={<Introduce />} />
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
