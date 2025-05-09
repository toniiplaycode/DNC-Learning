import { Routes, Route, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./pages/student/HomePage";
import EnrolledCourses from "./pages/student/EnrolledCourses";
import CourseDetail from "./pages/student/CourseDetail";
import ProfileAccount from "./pages/student/ProfileAccount";
import Login from "./pages/student/auth/Login";
import Register from "./pages/student/auth/Register";
import InstructorProfile from "./pages/student/InstructorProfile";
import Courses from "./pages/student/Courses";
import Instructors from "./pages/student/Instructors";
import ForumDiscussions from "./pages/student/forum/ForumDiscussions";
import ForumDiscussionDetail from "./components/common/ForumDiscussionDetail";
import CourseContent from "./pages/student/course/CourseContent";
import PurchaseCourse from "./pages/student/PurchaseCourse";
import InstructorCourses from "./pages/instructor/InstructorCourses";
import InstructorCourseView from "./pages/instructor/InstructorCourseView";
import InstructorStudents from "./pages/instructor/InstructorStudents";
import InstructorAssignments from "./pages/instructor/InstructorAssignments";
import InstructorAnalytics from "./pages/instructor/InstructorAnalytics";
import ChatCommon from "./components/common/ChatCommon";
import InstructorNotifications from "./pages/instructor/InstructorNotifications";
import InstructorSchedules from "./pages/instructor/InstructorSchedules";
import InstructorSettings from "./pages/instructor/InstructorSettings";
import MainLayout from "./pages/student/layout/MainLayout";
import InstructorLayout from "./pages/instructor/layout/InstructorLayout";
import InstructorQuizs from "./pages/instructor/InstructorQuizs";
import InstructorForum from "./pages/instructor/InstructorForum";
import InstructorReviews from "./pages/instructor/InstructorReviews";
import AdminLayout from "./pages/admin/layout/AdminLayout";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminLogin from "./pages/admin/AdminLogin";
import InstructorLogin from "./pages/instructor/InstructorLogin";
import AdminInstructors from "./pages/admin/AdminInstructors";
import Assessment from "./pages/student/assessment/Assessment";
import AssessmentQuiz from "./pages/student/assessment/AssessmentQuiz";
import AssessmentAssignment from "./pages/student/assessment/AssessmentAssignment";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminSettings from "./pages/admin/AdminSettings";
import InstructorStudentsAcademic from "./pages/instructor/InstructorStudentsAcademic";
import AdminAcademicClasses from "./pages/admin/AdminAcademicClasses";
import AdminSchedules from "./pages/admin/AdminSchedules";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchCurrentUser } from "./features/auth/authApiSlice";
import PaymentResult from "./pages/student/PaymentResult";

const App = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // Xóa token khỏi URL
      window.history.replaceState({}, document.title, "/");
      // Chuyển về trang chủ
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
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
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/assessment/quiz/:id" element={<AssessmentQuiz />} />
          <Route
            path="/assessment/assignment/:id"
            element={<AssessmentAssignment />}
          />
          <Route path="/payments/zalopay/return" element={<PaymentResult />} />
        </Route>

        {/* Instructor routes */}
        <Route element={<InstructorLayout />}>
          <Route path="/instructor/login" element={<InstructorLogin />} />
          <Route path="/instructor" element={<InstructorCourses />} />
          <Route
            path="/instructor/courses/:id"
            element={<InstructorCourseView />}
          />
          <Route path="/instructor/students" element={<InstructorStudents />} />
          <Route
            path="/instructor/studentsAcademic"
            element={<InstructorStudentsAcademic />}
          />
          <Route
            path="/instructor/assignments"
            element={<InstructorAssignments />}
          />
          <Route path="/instructor/quiz" element={<InstructorQuizs />} />
          <Route
            path="/instructor/analytics"
            element={<InstructorAnalytics />}
          />
          <Route path="/instructor/chats" element={<ChatCommon />} />
          <Route
            path="/instructor/schedules"
            element={<InstructorSchedules />}
          />
          <Route path="/instructor/forum" element={<InstructorForum />} />
          <Route
            path="/instructor/notifications"
            element={<InstructorNotifications />}
          />
          <Route path="/instructor/settings" element={<InstructorSettings />} />
          <Route path="/instructor/reviews" element={<InstructorReviews />} />
        </Route>

        {/* Admin routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminCourses />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/instructors" element={<AdminInstructors />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route
            path="/admin/academic-classes"
            element={<AdminAcademicClasses />}
          />
          <Route path="/admin/chats" element={<ChatCommon />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/schedules" element={<AdminSchedules />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
