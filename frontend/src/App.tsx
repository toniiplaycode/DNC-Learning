import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import EnrolledCourses from "./pages/EnrolledCourses";
import CourseDetail from "./pages/CourseDetail";
import ProfileAccount from "./pages/ProfileAccount";

const App = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/enrolled-courses" element={<EnrolledCourses />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/profile" element={<ProfileAccount />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
