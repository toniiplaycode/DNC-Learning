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

const App = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/enrolled-courses" element={<EnrolledCourses />} />
        <Route path="/course-detail/:courseId" element={<CourseDetail />} />
        <Route path="/profile" element={<ProfileAccount />} />
        <Route path="/instructor/:id" element={<InstructorProfile />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/instructors" element={<Instructors />} />
        <Route path="/forum" element={<ForumDiscussions />} />
        <Route path="/forum/:id" element={<ForumDiscussionDetail />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
