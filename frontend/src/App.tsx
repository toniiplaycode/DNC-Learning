import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import EnrolledCourses from "./pages/EnrolledCourses";
import CourseDetail from "./pages/CourseDetail";

const App = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/enrolled-courses" element={<EnrolledCourses />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
