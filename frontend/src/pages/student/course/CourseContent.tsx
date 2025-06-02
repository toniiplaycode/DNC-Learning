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
  fetchCourseProgressDetail,
  fetchUserProgress,
} from "../../../features/course-progress/courseProgressSlice";
import {
  selectCourseProgressDetail,
  selectUserProgress,
} from "../../../features/course-progress/courseProgressSelectors";
import { UserRole } from "../../../types/user.types";
import { fetchUserAttempts } from "../../../features/quizzes/quizzesSlice";
import { selectUserAttempts } from "../../../features/quizzes/quizzesSelectors";
import { toast } from "react-toastify";
import { fetchUserSubmissions } from "../../../features/assignment-submissions/assignmentSubmissionsSlice";
import { selectUserSubmissions } from "../../../features/assignment-submissions/assignmentSubmissionsSelectors";

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

const CourseContent = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const course = useAppSelector(selectCourseById);
  const courseProgress = useAppSelector(selectCourseProgress);
  const userEnrollments = useAppSelector(selectUserEnrollments);
  const studentAcademicCourses = useAppSelector(selectStudentAcademicCourses);
  const userQuizAttempts = useAppSelector(selectUserAttempts);
  const userSubmissions = useAppSelector(selectUserSubmissions);
  const courseProgressDetail = useAppSelector(selectCourseProgressDetail);
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
    dispatch(fetchUserAttempts(Number(currentUser?.id)));
    dispatch(fetchUserSubmissions());
  }, [dispatch, currentUser, navigate, hasAccess, courseId]);

  useEffect(() => {
    dispatch(fetchCourseById(Number(courseId)));
    dispatch(fetchCourseProgress({ courseId: Number(courseId) }));

    // Use a direct string comparison instead of enum
    if (currentUser && currentUser.role === UserRole.STUDENT_ACADEMIC) {
      dispatch(fetchCourseProgressDetail({ courseId: Number(courseId) }));
    }
  }, [dispatch, courseId, currentUser]);

  const handleLessonClick = (id: string) => {
    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

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
      // Find the lesson in course sections
      let currentLesson = null;
      let currentSectionIndex = -1;
      let currentLessonIndex = -1;
      let hasQuizBefore = false;
      let hasAssignmentBefore = false;
      let quizCompleted = false;
      let assignmentCompleted = false;

      course?.sections?.forEach((section, sectionIdx) => {
        section.lessons.forEach((lesson, lessonIdx) => {
          if (lesson.id === lessonId) {
            currentLesson = lesson;
            currentSectionIndex = sectionIdx;
            currentLessonIndex = lessonIdx;
          }
        });
      });

      if (!currentLesson) return;

      // Check if this is a quiz lesson
      if (currentLesson.contentType === "quiz") {
        // Find quiz attempt for this lesson
        const quizAttempt = userQuizAttempts?.find(
          (attempt) => attempt.quiz.lessonId === lessonId
        );

        // Only allow marking as completed if quiz is completed
        if (!quizAttempt || quizAttempt.status !== "completed") {
          toast.warning(
            "Bạn cần hoàn thành bài kiểm tra này trước khi đánh dấu hoàn thành!"
          );
          return;
        }
        quizCompleted = true;
      }
      // Check if this is an assignment lesson
      else if (currentLesson.contentType === "assignment") {
        // Find assignment submission for this lesson
        const assignmentSubmission = userSubmissions?.find(
          (submission) => submission.assignment.lessonId === lessonId
        );

        // Only allow marking as completed if assignment is submitted
        if (!assignmentSubmission) {
          toast.warning(
            "Bạn cần nộp bài tập này trước khi đánh dấu hoàn thành!"
          );
          return;
        }
        assignmentCompleted = true;
      } else {
        // For non-quiz/assignment lessons, check if there's a quiz or assignment before this lesson
        // that needs to be completed first
        const allLessons = course?.sections?.flatMap((s) => s.lessons) || [];
        const currentLessonIndex = allLessons.findIndex(
          (l) => l.id === lessonId
        );

        // Look for quiz/assignment lessons before current lesson
        for (let i = 0; i < currentLessonIndex; i++) {
          const lesson = allLessons[i];
          if (lesson.contentType === "quiz") {
            hasQuizBefore = true;
            // Check if quiz is completed
            const quizAttempt = userQuizAttempts?.find(
              (attempt) => attempt.quiz.lessonId === lesson.id
            );
            if (!quizAttempt || quizAttempt.status !== "completed") {
              toast.warning(
                "Bạn cần hoàn thành bài kiểm tra trắc nghiệm trước đó để tiếp tục!"
              );
              return;
            }
          } else if (lesson.contentType === "assignment") {
            hasAssignmentBefore = true;
            // Check if assignment is submitted
            const assignmentSubmission = userSubmissions?.find(
              (submission) => submission.assignment.lessonId === lesson.id
            );
            if (!assignmentSubmission) {
              toast.warning("Bạn cần nộp bài tập trước đó để tiếp tục!");
              return;
            }
          }
        }
      }

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
        // Fetch updated course progress detail
        if (currentUser && currentUser.role === UserRole.STUDENT_ACADEMIC) {
          await dispatch(
            fetchCourseProgressDetail({ courseId: Number(courseId) })
          );
        }
      }
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
      toast.error("Có lỗi xảy ra khi đánh dấu hoàn thành bài học!");
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
                        value={
                          courseProgressDetail?.completionPercentage ||
                          courseProgress?.completionPercentage ||
                          0
                        }
                        sx={{
                          height: 10,
                          borderRadius: 1,
                          bgcolor: "grey.200",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: (theme) => {
                              const percentage =
                                courseProgressDetail?.completionPercentage ||
                                courseProgress?.completionPercentage ||
                                0;
                              return percentage < 30
                                ? theme.palette.error.main
                                : percentage < 70
                                ? theme.palette.warning.main
                                : theme.palette.success.main;
                            },
                          },
                        }}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {courseProgressDetail?.completionPercentage ||
                          courseProgress?.completionPercentage ||
                          0}
                        % hoàn thành
                      </Typography>
                    </Box>

                    {courseProgressDetail ? (
                      /* Detailed progress information for academic students */
                      <Stack spacing={1.5}>
                        <Typography variant="body2" color="text.secondary">
                          •{" "}
                          {
                            courseProgressDetail.sections.filter(
                              (section) => section.completionPercentage === 100
                            ).length
                          }
                          /{courseProgressDetail.sections.length} chương hoàn
                          thành
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • {courseProgressDetail.completedLessons}/
                          {courseProgressDetail.totalLessons} bài học hoàn thành
                        </Typography>

                        {/* Count completed quizzes/assignments */}
                        <Typography variant="body2" color="text.secondary">
                          •{" "}
                          {
                            courseProgressDetail.sections
                              .flatMap((s) => s.lessons)
                              .filter(
                                (l) =>
                                  l.completed &&
                                  (l.contentType === "quiz" ||
                                    l.contentType === "assignment")
                              ).length
                          }
                          /
                          {
                            courseProgressDetail.sections
                              .flatMap((s) => s.lessons)
                              .filter(
                                (l) =>
                                  l.contentType === "quiz" ||
                                  l.contentType === "assignment"
                              ).length
                          }{" "}
                          bài kiểm tra hoàn thành
                        </Typography>

                        {/* Show last accessed lesson */}
                        {courseProgressDetail?.lastAccessedLesson && (
                          <Box
                            sx={{
                              mt: 1,
                              p: 1.5,
                              bgcolor: "primary.lighter",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              color="primary.dark"
                            >
                              Bài học gần đây nhất:
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              {courseProgressDetail.lastAccessedLesson.title}
                            </Typography>
                            {courseProgressDetail.lastAccessTime && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 0.5 }}
                              >
                                {new Date(
                                  courseProgressDetail.lastAccessTime
                                ).toLocaleString("vi-VN")}
                              </Typography>
                            )}
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              sx={{ mt: 1, fontSize: "0.75rem" }}
                              onClick={() =>
                                courseProgressDetail.lastAccessedLesson &&
                                handleLessonClick(
                                  courseProgressDetail.lastAccessedLesson.id.toString()
                                )
                              }
                            >
                              Tiếp tục học
                            </Button>
                          </Box>
                        )}

                        {/* Section completion progress */}
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            sx={{ mb: 1 }}
                          >
                            Tiến độ theo chương:
                          </Typography>
                          {courseProgressDetail.sections.map((section) => (
                            <Box key={section.sectionId} sx={{ mb: 1.5 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: "medium" }}
                                >
                                  {section.title}
                                </Typography>
                                <Typography variant="caption">
                                  {section.completionPercentage}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={section.completionPercentage}
                                sx={{
                                  height: 6,
                                  borderRadius: 5,
                                  bgcolor: "grey.200",
                                  "& .MuiLinearProgress-bar": {
                                    bgcolor: (theme) => {
                                      return section.completionPercentage < 30
                                        ? theme.palette.error.main
                                        : section.completionPercentage < 70
                                        ? theme.palette.warning.main
                                        : theme.palette.success.main;
                                    },
                                  },
                                }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Stack>
                    ) : (
                      /* Original content for non-academic students */
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          •{" "}
                          {courseProgress?.sections?.filter(
                            (section: any) =>
                              section.completionPercentage === 100
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
                    )}
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
