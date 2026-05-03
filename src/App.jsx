import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Login from "@/pages/auth/Login";
import DashboardLayout from "@/layouts/DashboardLayout";
import Dashboard from "@/pages/dashboard/Index";

// Master Modules
import Divisions from "@/pages/master/Divisions";
import InternshipPeriods from "@/pages/master/InternshipPeriods";
import InternshipPrograms from "@/pages/master/InternshipPrograms";
import RegistrationStatuses from "@/pages/master/RegistrationStatuses";
import Placements from "@/pages/master/Placements";
import Registrations from "@/pages/master/Registrations";
import Interns from "@/pages/master/Interns";
import MentorInterns from "@/pages/master/MentorInterns";
import AssessmentCriteria from "@/pages/master/AssessmentCriteria";
import Scores from "@/pages/master/Scores";
import ReportTypes from "@/pages/master/ReportTypes";
import Reports from "@/pages/master/Reports";
import LogBooks from "@/pages/master/LogBooks";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Master Data Routes */}
        <Route path="master/divisions" element={<Divisions />} />
        <Route path="master/internship-periods" element={<InternshipPeriods />} />
        <Route path="master/internship-programs" element={<InternshipPrograms />} />
        <Route path="master/registration-statuses" element={<RegistrationStatuses />} />
        <Route path="master/placements" element={<Placements />} />
        <Route path="master/registrations" element={<Registrations />} />
        <Route path="master/interns" element={<Interns />} />
        <Route path="master/mentor-interns" element={<MentorInterns />} />
        <Route path="master/assessment-criteria" element={<AssessmentCriteria />} />
        <Route path="master/scores" element={<Scores />} />
        <Route path="master/report-types" element={<ReportTypes />} />
        <Route path="master/reports" element={<Reports />} />
        <Route path="master/log-books" element={<LogBooks />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
