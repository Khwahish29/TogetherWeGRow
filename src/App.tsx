import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import { Account, Join, NewPassword, SignIn } from "./simple/Account";
import { OlderEarn } from "./simple/Earn";
import { Impact } from "./simple/Extra";
import { FamilyFlow } from "./simple/Family";
import { Inbox } from "./simple/Inbox";
import { Privacy, Safety, Terms } from "./simple/Legal";
import { NotFound } from "./simple/NotFound";
import { OlderHelp, OlderLearn, OlderShare } from "./simple/Older";
import { OrgRole, Organizations, PostRole } from "./simple/Org";
import { OlderRoles } from "./simple/Roles";
import { ScamCheck } from "./simple/Scam";
import { SimpleLayout } from "./simple/SimpleLayout";
import { OlderHome, Welcome, YoungerHome } from "./simple/Start";
import { Tour } from "./simple/Tour";
import { MeaningScreen } from "./simple/Vibe";
import { YoungerLearn, YoungerShare } from "./simple/Younger";

/** Sends an old address to its new one, keeping the rest of the path and any ?step=. */
function Renamed({ from, to }: { from: string; to: string }) {
  const { pathname, search } = useLocation();
  return <Navigate to={to + pathname.slice(from.length) + search} replace />;
}

/** The old sign-up page served both people and organizations. */
function OldSignup() {
  const { search } = useLocation();
  return <Navigate to={new URLSearchParams(search).get("role") === "employer" ? "/organizations" : "/join"} replace />;
}

/** Addresses from the earlier version of the site, and where each one lives now. */
const MOVED: [string, string][] = [
  ["explore", "/"],
  ["about", "/"],
  ["dashboard", "/account"],
  ["profile", "/account"],
  ["profile/create", "/roots/share"],
  ["requests", "/inbox"],
  ["mentors", "/growth/learn"],
  ["mentors/:id", "/growth/learn"],
  ["marketplace", "/growth/learn"],
  ["questions", "/roots/share?step=20"],
  ["learn", "/roots/learn"],
  ["learn/ai", "/roots/learn"],
  ["learn/buddies", "/roots/help?step=1"],
  ["vibe-check", "/growth/understand"],
  ["introduce", "/family"],
  ["opportunities", "/roots/roles"],
  ["opportunities/:id", "/roots/roles"],
  ["careers", "/roots/roles"],
  ["next-chapter", "/roots/roles"],
  ["resume", "/roots"],
  ["employer", "/organizations"],
  ["employer/new", "/organizations/post"],
  ["employer/edit/:id", "/organizations"],
];

export default function App() {
  return (
    <Routes>
      {/* The homepage tells the story. Everything else is the simple experience: one question per screen, no menus. */}
      <Route index element={<Landing />} />
      <Route element={<SimpleLayout />}>
        <Route path="start" element={<Welcome />} />
        <Route path="tour" element={<Tour />} />

        <Route path="roots" element={<OlderHome />} />
        <Route path="roots/share" element={<OlderShare />} />
        <Route path="roots/learn" element={<OlderLearn />} />
        <Route path="roots/help" element={<OlderHelp />} />
        <Route path="roots/understand" element={<MeaningScreen />} />
        <Route path="roots/earn" element={<OlderEarn />} />
        <Route path="roots/roles" element={<OlderRoles />} />
        <Route path="roots/scam" element={<ScamCheck />} />

        <Route path="growth" element={<YoungerHome />} />
        <Route path="growth/learn" element={<YoungerLearn />} />
        <Route path="growth/share" element={<YoungerShare />} />
        <Route path="growth/understand" element={<MeaningScreen younger />} />

        <Route path="family" element={<FamilyFlow />} />
        <Route path="organizations" element={<Organizations />} />
        <Route path="organizations/post" element={<PostRole />} />
        <Route path="organizations/post/:id" element={<PostRole />} />
        <Route path="organizations/role/:id" element={<OrgRole />} />

        <Route path="inbox" element={<Inbox />} />
        <Route path="account" element={<Account />} />
        <Route path="login" element={<SignIn />} />
        <Route path="join" element={<Join />} />
        <Route path="reset" element={<NewPassword />} />
        <Route path="impact" element={<Impact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="safety" element={<Safety />} />

        {/* Earlier addresses, kept so saved links and bookmarks still land somewhere sensible. */}
        <Route path="older/*" element={<Renamed from="/older" to="/roots" />} />
        <Route path="younger/*" element={<Renamed from="/younger" to="/growth" />} />
        <Route path="signup" element={<OldSignup />} />
        {MOVED.map(([from, to]) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
