import React, { useEffect, useState } from "react";
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
import { ArrowBack } from "@mui/icons-material";
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
import { fetchCourseProgress } from "../../../features/enrollments/enrollmentsApiSlice";
import { selectCourseProgress } from "../../../features/enrollments/enrollmentsSelectors";
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
  const course = useAppSelector(selectCourseById);
  const courseProgress = useAppSelector(selectCourseProgress);

  useEffect(() => {
    dispatch(fetchCourseById(Number(courseId)));
    dispatch(fetchCourseProgress({ courseId: Number(courseId) }));
  }, [dispatch, courseId]);

  useEffect(() => {
    setSelectedLesson(getFirstLesson(course?.sections));
  }, [course]);

  const [selectedLesson, setSelectedLesson] = useState<ContentItem | null>();

  const handleLessonClick = (id: string) => {
    console.log("Lesson clicked:", id);

    let selectedLesson = null;

    // Tìm lesson trong tất cả các sections
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
          completed: false, // Cần add thêm trường này nếu API có
          // Các trường khác nếu cần
        };
      }
    });

    if (selectedLesson) {
      setSelectedLesson(selectedLesson);
    }
  };

  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: 2 }}>
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
                    /{courseProgress?.sections?.length || 0} chương hoàn thành
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
                  activeLesson={selectedLesson?.id}
                  setActiveTab={setActiveTab}
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
    </Container>
  );
};

export default CourseContent;
