import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "../src/pages/auth/Login";
import Signup from "../src/pages/auth/Signup";
import ForgotPassword from "../src/pages/auth/ForgotPassword";
import VerifyEmail from "../src/pages/auth/VerifyEmail";
import PrivateRoute from "../src/routes/privateroute";
import DashboardLayout from "../src/layout/DashboardLayout";
import Dashboard from "../src/pages/dashboard/Dashboard";
import AllLeads from "../src/pages/leads/AllLeads";
import LeadForm from "../src/pages/leads/LeadForm";
import LeadDetail from "../src/pages/leads/LeadDetail";
import LeadDiscovery from "../src/pages/leads/LeadDiscovery";
import Pipeline from "../src/pages/pipeline/Pipeline";
import Followups from "../src/pages/followups/Followups";
import Reports from "../src/pages/reports/Reports";
import Team from "../src/pages/users/Team";
import Settings from "../src/pages/settting/Settings";
import LeadGroups from "../src/pages/leads/LeadGroups";
import AdvancedSearch from "../src/pages/leads/AdvancedSearch";
import TermsAndConditions from "../src/pages/legal/TermsAndConditions";
import PrivacyPolicy from "../src/pages/legal/PrivacyPolicy";
import PageTransition from "../src/components/PageTransition";

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Default route -> login for now */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth routes (public) */}
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/verify-email" element={<PageTransition><VerifyEmail /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><TermsAndConditions /></PageTransition>} />
            <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />

            {/* Protected app routes wrapped with DashboardLayout and PageTransition */}
            <Route element={<PrivateRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                <Route path="/leads" element={<PageTransition><AllLeads /></PageTransition>} />
                <Route path="/leads/new" element={<PageTransition><LeadForm /></PageTransition>} />
                <Route path="/leads/:id" element={<PageTransition><LeadDetail /></PageTransition>} />
                <Route path="/leads/:id/edit" element={<PageTransition><LeadForm /></PageTransition>} />
                <Route path="/lead-discovery" element={<PageTransition><LeadDiscovery /></PageTransition>} />
                <Route path="/advanced-search" element={<PageTransition><AdvancedSearch /></PageTransition>} />
                <Route path="/pipeline" element={<PageTransition><Pipeline /></PageTransition>} />
                <Route path="/followups" element={<PageTransition><Followups /></PageTransition>} />
                <Route path="/lead-groups" element={<PageTransition><LeadGroups /></PageTransition>} />
                <Route path="/reports" element={<PageTransition><Reports /></PageTransition>} />
                <Route path="/team" element={<PageTransition><Team /></PageTransition>} />
                <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;