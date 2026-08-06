import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import AcademicDashboard from "./pages/Dashboard/AcademicDashboard";
import ChildrenPage from "./pages/StudentTracker/ChildrenPage";
import MarksPage from "./pages/StudentTracker/MarksPage";
import MyProfilePage from "./pages/StudentTracker/MyProfilePage";
import SubscriptionPage from "./pages/StudentTracker/SubscriptionPage";
import KnowMySchoolPage from "./pages/KnowMySchool/KnowMySchoolPage";
import UdiseSummaryPage from "./pages/KnowMySchool/UdiseSummaryPage";
import UserManagementPage from "./pages/Admin/UserManagementPage";
import SchoolManagementPage from "./pages/Admin/SchoolManagementPage";
import SchoolRepPage from "./pages/SchoolRep/SchoolRepPage";

export default function App() {
  return (
    <>
      <Router basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <Routes>
          {/* Main Academic Progress Tracker App Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<AcademicDashboard />} />
            <Route path="/academic-tracker" element={<AcademicDashboard />} />
            <Route path="/children" element={<ChildrenPage />} />
            <Route path="/marks" element={<MarksPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/profile" element={<MyProfilePage />} />
            <Route path="/udise-dashboard" element={<UdiseSummaryPage />} />
            <Route path="/know-my-school" element={<KnowMySchoolPage />} />

            {/* Admin Only Routes */}
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/schools" element={<SchoolManagementPage />} />

            {/* School Representative Route */}
            <Route path="/school-rep/manage" element={<SchoolRepPage />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
