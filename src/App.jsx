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

import Home from "@/pages/Home";
import Register from "@/pages/auth/Register";  
import ApplyInternship from "@/pages/ApplyInternship";
import PublicApply from "@/pages/PublicApply";
import Certificate from "@/pages/Certificate";
import Profile from "@/pages/Profile";
import MyScores from "@/pages/student/MyScores";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<PublicApply />} />  
      <Route path="/login" element={<Login />} />

      <Route
        path="/certificate/:id"
        element={
          <ProtectedRoute>
            <Certificate />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/apply" element={<ApplyInternship />} />

        {/* Master Data Routes */}
        <Route path="/master/divisions" element={<Divisions />} />
        <Route path="/master/internship-periods" element={<InternshipPeriods />} />
        <Route path="/master/internship-programs" element={<InternshipPrograms />} />
        <Route path="/master/registration-statuses" element={<RegistrationStatuses />} />
        <Route path="/master/placements" element={<Placements />} />
        <Route path="/master/registrations" element={<Registrations />} />
        <Route path="/master/interns" element={<Interns />} />
        <Route path="/master/mentor-interns" element={<MentorInterns />} />
        <Route path="/master/assessment-criteria" element={<AssessmentCriteria />} />
        <Route path="/master/scores" element={<Scores />} />
        <Route path="/master/report-types" element={<ReportTypes />} />
        <Route path="/master/reports" element={<Reports />} />
        <Route path="/master/log-books" element={<LogBooks />} />
        <Route path="/my-scores" element={<MyScores />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;