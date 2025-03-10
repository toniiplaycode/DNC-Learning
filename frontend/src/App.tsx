import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import EnrolledCourses from "./pages/EnrolledCourses";
import CourseDetail from "./pages/CourseDetail";
import ProfileAccount from "./pages/ProfileAccount";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import InstructorProfile from "./pages/instructor/InstructorProfile";
import Courses from "./pages/Courses";
import Instructors from "./pages/instructor/Instructors";
import ForumDiscussions from "./pages/forum/ForumDiscussions";
import ForumDiscussionDetail from "./pages/forum/ForumDiscussionDetail";
import CourseContent from "./pages/course/CourseContent";
import PurchaseCourse from "./pages/PurchaseCourse";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import InstructorLayout from "./components/layout/InstructorLayout";
import InstructorCourses from "./pages/instructor/InstructorCourses";
import InstructorCourseView from "./pages/instructor/InstructorCourseView";
import InstructorStudents from "./pages/instructor/InstructorStudents";
import InstructorAssignments from "./pages/instructor/InstructorAssignments";
import InstructorAnalytics from "./pages/instructor/InstructorAnalytics";
import InstructorChats from "./pages/instructor/InstructorChats";
import InstructorNotifications from "./pages/instructor/InstructorNotifications";
import InstructorSchedules from "./pages/instructor/InstructorSchedules";
import InstructorSettings from "./pages/instructor/InstructorSettings";

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/enrolled-courses" element={<EnrolledCourses />} />
        <Route path="/profile" element={<ProfileAccount />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/list-instructors" element={<Instructors />} />
        <Route path="/view-instructor/:id" element={<InstructorProfile />} />
        <Route path="/forum" element={<ForumDiscussions />} />
        <Route path="/forum/:id" element={<ForumDiscussionDetail />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/course/:id/learn" element={<CourseContent />} />
        <Route path="/purchase/:id" element={<PurchaseCourse />} />
      </Route>

      {/* Instructor routes */}
      <Route element={<InstructorLayout />}>
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/instructor/courses" element={<InstructorCourses />} />
        <Route
          path="/instructor/courses/:id"
          element={<InstructorCourseView />}
        />
        <Route path="/instructor/students" element={<InstructorStudents />} />
        <Route
          path="/instructor/assignments"
          element={<InstructorAssignments />}
        />
        <Route path="/instructor/analytics" element={<InstructorAnalytics />} />
        <Route path="/instructor/chats" element={<InstructorChats />} />
        <Route
          path="/instructor/notifications"
          element={<InstructorNotifications />}
        />
        <Route path="/instructor/schedules" element={<InstructorSchedules />} />
        <Route path="/instructor/settings" element={<InstructorSettings />} />
      </Route>
    </Routes>
  );
};

export default App;
