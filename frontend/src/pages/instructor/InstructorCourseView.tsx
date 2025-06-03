import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Stack,
  Chip,
  Avatar,
  Button,
  Divider,
} from "@mui/material";
import {
  People,
  Star,
  PlayCircle,
  Assignment,
  Settings,
  Description,
  Quiz,
  Link as LinkIcon,
  Add,
  PictureAsPdf,
  TableChart,
  TextSnippet,
  Slideshow,
  MenuBook,
  VideoCall,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";

import ContentDocuments from "../../components/common/course/ContentDocuments";
import ContentDetail from "../../components/common/course/ContentDetail";
import EmptyState from "../../components/common/EmptyState";

import CourseStructure from "../../components/instructor/course/CourseStructure";
import DialogAddEditLesson from "../../components/instructor/course/DialogAddEditLesson";
import DialogAddEditDocument from "../../components/instructor/course/DialogAddEditDocument";
import DialogAddEditQuiz from "../../components/instructor/course/DialogAddEditQuiz";
import DialogAddEditAssignment from "../../components/instructor/course/DialogAddEditAssignment";
import DialogAddEditSection from "../../components/instructor/course/DialogAddEditSection";
import DialogSetting from "../../components/instructor/course/DialogSetting";
import CourseQuizAssignment from "../../components/instructor/course/CourseQuizAssignment";
import { fetchCourseById } from "../../features/courses/coursesApiSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectCourseById } from "../../features/courses/coursesSelector";

// Định nghĩa interface cho ContentItem
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`course-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const InstructorCourseView = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const courseData = useAppSelector(selectCourseById);

  // Initialize with empty values first
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );

  // Fetch course data
  useEffect(() => {
    dispatch(fetchCourseById(Number(id)));
  }, [dispatch, id]);

  // Update expandedSections when courseData changes
  useEffect(() => {
    if (courseData?.sections && courseData.sections.length > 0) {
      // Only set the first section's ID in expandedSections
      setExpandedSections([courseData.sections[0].id]);
    }
  }, [courseData]);

  // Update selectedContent when courseData changes
  useEffect(() => {
    if (courseData?.sections && courseData.sections.length > 0) {
      const firstSection = courseData.sections[0];
      if (firstSection.lessons && firstSection.lessons.length > 0) {
        const firstLesson = firstSection.lessons[0];
        setSelectedContent({
          id: firstLesson.id,
          type: firstLesson.contentType,
          title: firstLesson.title,
          description: firstLesson.content,
          duration: firstLesson.duration
            ? `${firstLesson.duration}:00`
            : undefined,
          url: firstLesson.contentUrl || "",
          completed: false,
          locked: false,
        });
      }
    }
  }, [courseData]);

  const [tabValue, setTabValue] = useState(0);

  // Khởi tạo selectedContent với nội dung đầu tiên

  // Thêm state quản lý modal
  const [openAddContentModal, setOpenAddContentModal] = useState(false);
  const [openEditContentModal, setOpenEditContentModal] = useState(false);
  const [openAddDocumentModal, setOpenAddDocumentModal] = useState(false);
  const [openAddQuizModal, setOpenAddQuizModal] = useState(false);
  const [openAddAssignmentModal, setOpenAddAssignmentModal] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);
  const [contentToEdit, setContentToEdit] = useState<ContentItem | null>(null);

  // Form state cho modal thêm/sửa nội dung
  const [contentForm, setContentForm] = useState({
    title: "",
    type: "video",
    description: "",
    duration: "",
    url: "",
    sectionId: 0,
    position: 0,
  });

  // Thêm state cho file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Thêm state quản lý section modals
  const [openAddSectionModal, setOpenAddSectionModal] = useState(false);
  const [openEditSectionModal, setOpenEditSectionModal] = useState(false);
  const [sectionIdToEdit, setSectionIdToEdit] = useState<any>(null);

  // State quản lý document modals
  const [openEditDocumentModal, setOpenEditDocumentModal] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState<any>(null);

  // State quản lý quiz modals
  const [openEditQuizModal, setOpenEditQuizModal] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState<any>(null);

  // Thêm state quản lý modals bài tập
  const [openEditAssignmentModal, setOpenEditAssignmentModal] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState<any>(null);

  // Thêm state cho modal cài đặt
  const [openSettingsModal, setOpenSettingsModal] = useState(false);

  const handleContentClick = (content: any) => {
    // Kích hoạt tab "Nội dung" (giả sử tab nội dung có index là 0)
    setTabValue(0);

    let selectedLesson = {
      id: content.id,
      assignmentId: content?.assignments ? content?.assignments[0]?.id : null,
      type: content.contentType,
      title: content.title,
      description: content.content,
      duration: content.duration ? `${content.duration}:00` : undefined,
      url: content?.contentUrl || "",
      completed: false, // Cần add thêm trường này nếu API có
      // Các trường khác nếu cần
    };

    if (selectedLesson) {
      setSelectedContent(selectedLesson);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSectionToggle = (sectionId: number) => {
    setExpandedSections((prevExpanded) =>
      prevExpanded.includes(sectionId)
        ? prevExpanded.filter((id) => id !== sectionId)
        : [...prevExpanded, sectionId]
    );
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case "video":
        return <PlayCircle color="primary" />;
      case "quiz":
        return <Quiz color="warning" />;
      case "assignment":
        return <Assignment color="warning" />;
      case "pdf":
        return <PictureAsPdf color="info" />;
      case "docx":
        return <Description color="info" />;
      case "xlsx":
        return <TableChart color="info" />;
      case "txt":
        return <TextSnippet color="info" />;
      case "slide":
        return <Slideshow color="info" />;
      default:
        return <Description color="info" />;
    }
  };

  // Hàm xử lý chọn file
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Kiểm tra kích thước file (giới hạn 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setUploadError("File quá lớn. Vui lòng chọn file nhỏ hơn 100MB");
      return;
    }

    setSelectedFile(file);
    setUploadError(null);

    // Tạo preview cho ảnh hoặc video
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  // Hàm mô phỏng tải lên file
  const simulateFileUpload = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Mô phỏng quá trình tải lên
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            // Cập nhật URL sau khi tải lên
            if (selectedFile) {
              setContentForm({
                ...contentForm,
                url: URL.createObjectURL(selectedFile),
              });
            }
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  // Reset file upload khi đóng modal
  const resetFileUpload = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Hàm mở modal thêm nội dung mới
  const handleOpenAddContentModal = (sectionId: number) => {
    console.log(sectionId);
    setCurrentSectionId(sectionId);
    setOpenAddContentModal(true);
  };

  // Hàm mở modal sửa nội dung
  const handleOpenEditContentModal = (
    content: ContentItem,
    sectionId: number
  ) => {
    setContentToEdit(content);
    setCurrentSectionId(sectionId);
    setOpenEditContentModal(true);
  };

  // Hàm mở modal thêm section
  const handleOpenAddSectionModal = () => {
    setOpenAddSectionModal(true);
  };

  // Hàm mở modal sửa section
  const handleOpenEditSectionModal = (sectionId: any) => {
    setSectionIdToEdit(sectionId);
    setOpenEditSectionModal(true);
  };

  // Hàm mở modal sửa document
  const handleOpenEditDocumentModal = (document: any, sectionId?: number) => {
    setDocumentToEdit(document);
    setCurrentSectionId(sectionId || null);
    setOpenEditDocumentModal(true);
  };

  // Hàm mở modal sửa quiz
  const handleOpenEditQuizModal = (quiz: any, sectionId?: number) => {
    setQuizToEdit(quiz);
    // setCurrentSectionId(sectionId || null);
    console.log("Sửa quiz:", quiz);
    setOpenEditQuizModal(true);
  };

  // Hàm mở modal sửa assignment
  const handleOpenEditAssignmentModal = (
    assignment: any,
    sectionId?: number
  ) => {
    setAssignmentToEdit(assignment);
    setCurrentSectionId(sectionId || null);
    setOpenEditAssignmentModal(true);
  };

  // Hàm xử lý lưu cài đặt
  const handleSaveSettings = (settings: any) => {
    console.log("Lưu cài đặt khóa học:", settings);
    // Cập nhật cài đặt vào state hoặc gọi API

    // Đóng dialog
    setOpenSettingsModal(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Course Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={10}>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    variant="rounded"
                    src={courseData?.thumbnailUrl}
                    sx={{ width: 120, height: 100 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" gutterBottom>
                      {courseData?.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        color="success"
                        label={
                          courseData?.status === "published"
                            ? "Đã xuất bản"
                            : "Bản nháp"
                        }
                      />
                      <Typography variant="body2" color="text.secondary">
                        Cập nhật:{" "}
                        {new Date(courseData?.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>

                <Typography variant="body1">
                  {courseData?.description}
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  divider={<Divider orientation="vertical" flexItem />}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <People color="action" />
                    <Typography>
                      {courseData?.enrollments?.length || 0} học viên
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Star sx={{ color: "warning.main" }} />
                    <Typography>
                      {courseData?.reviews?.length > 0
                        ? `${courseData?.reviews[0]?.rating || 0} (${
                            courseData?.reviews?.length
                          } đánh giá)`
                        : "Chưa có đánh giá"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PlayCircle color="action" />
                    <Typography>
                      {courseData?.sections?.length || 0} phần (
                      {courseData?.sections?.reduce(
                        (total, section) =>
                          total + (section?.lessons?.length || 0),
                        0
                      ) || 0}{" "}
                      bài học)
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={2}>
              <Stack spacing={2} display={"flex"}>
                <Button
                  variant="contained"
                  startIcon={<Settings />}
                  fullWidth
                  onClick={() => setOpenSettingsModal(true)}
                >
                  Cài đặt khóa học
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <DialogSetting
        open={openSettingsModal}
        onClose={() => setOpenSettingsModal(false)}
        onSave={handleSaveSettings}
      />

      {/* Course Content */}
      <Grid container spacing={3}>
        {/* Left sidebar - Course Structure */}
        <Grid item xs={12} md={3}>
          <CourseStructure
            sections={courseData?.sections || []}
            handleContentClick={handleContentClick}
            handleAddSection={handleOpenAddSectionModal}
            handleSectionToggle={handleSectionToggle}
            expandedSections={expandedSections}
            handleEditSection={handleOpenEditSectionModal}
            selectedContent={selectedContent}
            getContentIcon={getContentIcon}
            handleOpenEditContentModal={handleOpenEditContentModal}
            handleOpenAddContentModal={handleOpenAddContentModal}
          />
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Card style={{ padding: "20px" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Nội dung" />
                <Tab label="Tài liệu" />
                <Tab label="Bài trắc nghiệm/bài tập" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {selectedContent ? (
                <ContentDetail content={selectedContent} />
              ) : (
                <EmptyState
                  icon={<VideoCall />}
                  title="Chưa có nội dung bài học"
                  description="Hãy thêm nội dung bài học đầu tiên để bắt đầu xây dựng khóa học của bạn"
                />
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">Tài liệu khóa học</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenAddDocumentModal(true)}
                >
                  Thêm tài liệu
                </Button>
              </Box>
              {courseData?.sections?.some((section) =>
                section.lessons?.some((lesson) =>
                  [
                    "pdf",
                    "docx",
                    "xlsx",
                    "txt",
                    "slide",
                    "code",
                    "link",
                  ].includes(lesson.contentType)
                )
              ) ? (
                <ContentDocuments
                  handleOpenEditDocumentModal={handleOpenEditDocumentModal}
                  isInstructor={true}
                />
              ) : (
                <EmptyState
                  icon={<Description />}
                  title="Chưa có tài liệu nào"
                  description="Hãy thêm tài liệu đầu tiên để chia sẻ tài nguyên học tập với học viên"
                />
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">Bài trắc nghiệm & bài tập</Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenAddQuizModal(true)}
                  >
                    Thêm Bài trắc nghiệm
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setOpenAddAssignmentModal(true)}
                  >
                    Thêm bài tập
                  </Button>
                </Stack>
              </Box>
              {courseData?.sections?.some((section) =>
                section.lessons?.some((lesson) =>
                  ["quiz", "assignment"].includes(lesson.contentType)
                )
              ) ? (
                <CourseQuizAssignment
                  onEditQuiz={handleOpenEditQuizModal}
                  onEditAssignment={handleOpenEditAssignmentModal}
                  isInstructor={true}
                />
              ) : (
                <EmptyState
                  icon={<MenuBook />}
                  title="Chưa có bài trắc nghiệm hoặc bài tập nào"
                  description="Hãy thêm bài trắc nghiệm hoặc bài tập đầu tiên để đánh giá kiến thức của học viên"
                />
              )}
            </TabPanel>
          </Card>
        </Grid>
      </Grid>

      {/* Modal Thêm lesson mới */}
      <DialogAddEditLesson
        open={openAddContentModal}
        onClose={() => setOpenAddContentModal(false)}
        initialSectionId={currentSectionId || undefined}
        sections={courseData?.sections || []}
        editMode={false}
        courseData={courseData}
      />

      {/* Modal Sửa lesson */}
      <DialogAddEditLesson
        open={openEditContentModal}
        onClose={() => setOpenEditContentModal(false)}
        contentToEdit={contentToEdit || undefined}
        sections={courseData?.sections || []}
        editMode={true}
      />

      {/* Modal Thêm tài liệu */}
      <DialogAddEditDocument
        open={openAddDocumentModal}
        onClose={() => setOpenAddDocumentModal(false)}
        initialSectionId={currentSectionId || undefined}
        editMode={false}
      />

      {/* Modal sửa tài liệu */}
      <DialogAddEditDocument
        open={openEditDocumentModal}
        onClose={() => setOpenEditDocumentModal(false)}
        documentToEdit={documentToEdit || undefined}
        editMode={true}
      />

      {/* Modal Thêm quiz */}
      <DialogAddEditQuiz
        open={openAddQuizModal}
        onClose={() => setOpenAddQuizModal(false)}
        initialSectionId={currentSectionId || undefined}
        editMode={false}
      />

      {/* Modal sửa quiz */}
      <DialogAddEditQuiz
        open={openEditQuizModal}
        onClose={() => setOpenEditQuizModal(false)}
        quizToEdit={quizToEdit || undefined}
        editMode={true}
      />

      {/* Modal Thêm bài tập */}
      <DialogAddEditAssignment
        open={openAddAssignmentModal}
        onClose={() => setOpenAddAssignmentModal(false)}
        editMode={false}
      />

      {/* Modal sửa bài tập */}
      <DialogAddEditAssignment
        open={openEditAssignmentModal}
        onClose={() => setOpenEditAssignmentModal(false)}
        assignmentToEdit={assignmentToEdit || undefined}
        editMode={true}
      />

      {/* Modal thêm section */}
      <DialogAddEditSection
        open={openAddSectionModal}
        onClose={() => setOpenAddSectionModal(false)}
        editMode={false}
      />

      {/* Modal sửa section */}
      <DialogAddEditSection
        open={openEditSectionModal}
        onClose={() => setOpenEditSectionModal(false)}
        sectionIdToEdit={sectionIdToEdit || undefined}
        editMode={true}
      />
    </Box>
  );
};

export default InstructorCourseView;
