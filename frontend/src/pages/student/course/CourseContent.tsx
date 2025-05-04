import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  Typography,
  LinearProgress,
  Stack,
  Button,
  Tabs,
  Tab,
  CardContent,
} from "@mui/material";
import { ArrowBack, ErrorOutline } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import ContentDocuments from "../../../components/common/course/ContentDocuments";
import CourseRating from "../../../components/common/course/CourseRating";
import GradeOverview from "../../../components/common/course/GradeOverview";
import CourseStructure from "../../../components/common/course/CourseStructure";
import ContentDetail from "../../../components/common/course/ContentDetail";
import { fetchCourseById } from "../../../features/courses/coursesApiSlice";
import { useAppDispatch } from "../../../app/hooks";
import { selectCourseById } from "../../../features/courses/coursesSelector";
import { useAppSelector } from "../../../app/hooks";
import {
  fetchCourseProgress,
  fetchUserEnrollments,
} from "../../../features/enrollments/enrollmentsApiSlice";
import {
  selectCourseProgress,
  selectUserEnrollments,
} from "../../../features/enrollments/enrollmentsSelectors";
import { selectStudentAcademicCourses } from "../../../features/users/usersSelectors";
import { fetchStudentAcademicCourses } from "../../../features/users/usersApiSlice";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import {
  createProgress,
  fetchUserProgress,
} from "../../../features/course-progress/courseProgressSlice";
import { selectUserProgress } from "../../../features/course-progress/courseProgressSelectors";
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index } = props;
  return (
    <Box hidden={value !== index} sx={{ p: 2 }}>
      {value === index && children}
    </Box>
  );
};

interface ContentItem {
  id: number;
  type:
    | "video"
    | "slide"
    | "meet"
    | "quiz"
    | "assignment"
    | "document"
    | "link";
  title: string;
  description: string;
  duration?: string;
  url: string;
  completed: boolean;
  locked: boolean;
  maxAttempts?: number;
  passingScore?: number;
  objectives?: string[];
  prerequisites?: string[];
  keywords?: string[];
}

// Cập nhật hàm helper để lấy bài học đầu tiên
const getFirstLesson = (sections: any[]) => {
  if (
    !sections ||
    sections.length === 0 ||
    !sections[0].lessons ||
    sections[0].lessons.length === 0
  ) {
    return null;
  }

  const firstLesson = sections[0].lessons[0];
  return {
    id: firstLesson.id,
    type: firstLesson.contentType,
    title: firstLesson.title,
    description: firstLesson.content,
    duration: firstLesson.duration ? `${firstLesson.duration}:00` : undefined,
    url: firstLesson.contentUrl || "",
  };
};

const CourseContent = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const course = useAppSelector(selectCourseById);
  const courseProgress = useAppSelector(selectCourseProgress);
  const userEnrollments = useAppSelector(selectUserEnrollments);
  const studentAcademicCourses = useAppSelector(selectStudentAcademicCourses);
  const userProgress = useAppSelector(selectUserProgress);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState<ContentItem | null>();

  // Add check for course access
  const hasAccess = useMemo(() => {
    // Check normal enrollment
    const isEnrolled = userEnrollments?.some(
      (enrollment) => enrollment.courseId == Number(courseId)
    );

    // Check academic course access
    const isAcademicCourse = studentAcademicCourses?.some(
      (academic) => academic.course.id == Number(courseId)
    );

    return isEnrolled || isAcademicCourse;
  }, [courseId, userEnrollments, studentAcademicCourses]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    dispatch(fetchUserEnrollments(Number(currentUser?.id)));
    dispatch(fetchStudentAcademicCourses(currentUser?.id));
    dispatch(fetchUserProgress(Number(currentUser?.id)));
  }, [dispatch, currentUser, navigate, hasAccess, courseId]);

  useEffect(() => {
    dispatch(fetchCourseById(Number(courseId)));
    dispatch(fetchCourseProgress({ courseId: Number(courseId) }));
  }, [dispatch, courseId]);

  const handleLessonClick = (id: string) => {
    let selectedLesson = null;

    course?.sections?.forEach((section) => {
      const lesson = section.lessons.find((lesson) => lesson.id === id);
      if (lesson) {
        selectedLesson = {
          id: lesson.id,
          assignmentId: lesson.assignments ? lesson.assignments[0]?.id : null,
          type: lesson.contentType,
          title: lesson.title,
          description: lesson.content,
          duration: lesson.duration ? `${lesson.duration}:00` : undefined,
          url: lesson.contentUrl || "",
          completed: lesson.completed || false,
          locked: false,
        };
      }
    });

    if (selectedLesson) {
      setSelectedLesson(selectedLesson);
    }
  };

  const handleMarkAsCompleted = async (lessonId: string) => {
    if (!currentUser) return;

    try {
      // Find the progress record for this lesson
      const hasCompleted = userProgress?.some(
        (progress) => Number(progress.lessonId) == Number(lessonId)
      );

      if (!hasCompleted) {
        await dispatch(
          createProgress({
            userId: Number(currentUser.id),
            lessonId: Number(lessonId),
          })
        );

        // Fetch updated user progress after marking as completed
        await dispatch(fetchUserProgress(Number(currentUser.id)));

        // Refresh course progress
        await dispatch(fetchCourseProgress({ courseId: Number(courseId) }));
      }
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 2 }}>
      {hasAccess ? (
        <>
          {/* Existing content */}
          <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/course/${courseId}`)}
              startIcon={<ArrowBack />}
            >
              Quay lại tổng quan
            </Button>
            <Typography variant="h4" fontWeight="bold">
              {course?.title}
            </Typography>
          </Box>

          {/* Course Overview */}
          <Grid container spacing={3}>
            {/* Sidebar - Left Content */}
            <Grid item xs={12} md={3}>
              <Stack spacing={3}>
                {/* Progress Card */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Tiến độ học tập
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Tổng tiến độ
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={courseProgress?.completionPercentage || 0}
                        sx={{ height: 10, borderRadius: 1 }}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {courseProgress?.completionPercentage || 0}% hoàn thành
                      </Typography>
                    </Box>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        •{" "}
                        {courseProgress?.sections?.filter(
                          (section: any) => section.completionPercentage === 100
                        ).length || 0}
                        /{courseProgress?.sections?.length || 0} chương hoàn
                        thành
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • {courseProgress?.completedLessons || 0}/
                        {courseProgress?.totalLessons || 0} bài học hoàn thành
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        •{" "}
                        {courseProgress?.sections
                          ?.flatMap((s: any) => s.lessons)
                          .filter(
                            (l: any) =>
                              l.completed &&
                              (l.contentType === "quiz" ||
                                l.contentType === "assignment")
                          ).length || 0}
                        /
                        {courseProgress?.sections
                          ?.flatMap((s: any) => s.lessons)
                          .filter(
                            (l: any) =>
                              l.contentType === "quiz" ||
                              l.contentType === "assignment"
                          ).length || 0}{" "}
                        Bài trắc nghiệm hoàn thành
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Course Structure */}
                <Card>
                  <CardContent>
                    <CourseStructure
                      sections={course?.sections}
                      handleLessonClick={handleLessonClick}
                      setActiveTab={setActiveTab}
                      onMarkAsCompleted={handleMarkAsCompleted}
                      userProgress={userProgress}
                    />
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            {/* Main Content Area */}
            <Grid item xs={12} md={9}>
              <Card>
                {selectedLesson && (
                  <>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                      <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                      >
                        <Tab label="Nội dung" />
                        <Tab label="Tài liệu" />
                        <Tab label="Điểm số" />
                        <Tab label="Đánh giá" />
                      </Tabs>
                    </Box>

                    <TabPanel value={activeTab} index={0}>
                      <ContentDetail content={selectedLesson} />
                    </TabPanel>

                    <TabPanel value={activeTab} index={1}>
                      <Box sx={{ mb: 4 }}>
                        <ContentDocuments />
                      </Box>
                    </TabPanel>

                    <TabPanel value={activeTab} index={2}>
                      <GradeOverview />
                    </TabPanel>

                    <TabPanel value={activeTab} index={3}>
                      <CourseRating />
                    </TabPanel>
                  </>
                )}
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            bgcolor: "#fff",
            borderRadius: 1,
            p: 3,
            boxShadow: (theme) => `0 0 10px ${theme.palette.grey[200]}`,
          }}
        >
          <ErrorOutline color="error" sx={{ fontSize: 50, mb: 2 }} />
          <Typography variant="h5" gutterBottom color="error.main">
            Không thể truy cập khóa học
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate(`/course/${courseId}`)}
            startIcon={<ArrowBack />}
            sx={{ mt: 2 }}
          >
            Quay lại trang khóa học
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default CourseContent;
