import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/student/HomePage";
import EnrolledCourses from "./pages/student/EnrolledCourses";
import CourseDetail from "./pages/student/CourseDetail";
import ProfileAccount from "./pages/student/ProfileAccount";
import Login from "./pages/student/auth/Login";
import Register from "./pages/student/auth/Register";
import InstructorProfile from "./pages/instructor/InstructorProfile";
import Courses from "./pages/student/Courses";
import Instructors from "./pages/instructor/Instructors";
import ForumDiscussions from "./pages/student/forum/ForumDiscussions";
import ForumDiscussionDetail from "./pages/student/forum/ForumDiscussionDetail";
import CourseContent from "./pages/student/course/CourseContent";
import PurchaseCourse from "./pages/student/PurchaseCourse";
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import InstructorCourses from "./pages/instructor/InstructorCourses";
import InstructorCourseView from "./pages/instructor/InstructorCourseView";
import InstructorStudents from "./pages/instructor/InstructorStudents";
import InstructorAssignments from "./pages/instructor/InstructorAssignments";
import InstructorAnalytics from "./pages/instructor/InstructorAnalytics";
import InstructorChats from "./pages/instructor/InstructorChats";
import InstructorNotifications from "./pages/instructor/InstructorNotifications";
import InstructorSchedules from "./pages/instructor/InstructorSchedules";
import InstructorSettings from "./pages/instructor/InstructorSettings";
import MainLayout from "./pages/student/layout/MainLayout";
import InstructorLayout from "./pages/instructor/layout/InstructorLayout";

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
