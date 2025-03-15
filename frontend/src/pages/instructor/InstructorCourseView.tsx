import React, { useState, useRef } from "react";
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
  IconButton,
  Divider,
  List,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  People,
  Star,
  PlayCircle,
  Assignment,
  Settings,
  Description,
  Quiz,
  VideoCall,
  MenuBook,
  Link as LinkIcon,
  Add,
  Close,
  CloudUpload,
  InsertDriveFile,
  Edit,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import ContentDiscussion from "../../components/common/course/ContentDiscussion";
import ContentDocuments from "../../components/common/course/ContentDocuments";
import ContentDetail from "../../components/common/course/ContentDetail";
import CourseStructure from "../../components/instructor/course-view/CourseStructure";

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

// Mock data
const mockCourseData = {
  id: 1,
  title: "React & TypeScript Masterclass",
  description:
    "Khóa học toàn diện về React và TypeScript cho lập trình viên Frontend",
  thumbnail: "/src/assets/logo.png",
  status: "published",
  lastUpdated: "2024-03-15",
  totalStudents: 234,
  rating: 4.8,
  totalRatings: 150,
  totalLessons: 42,
  totalDuration: "52 giờ",
  sections: [
    {
      id: 1,
      title: "Giới thiệu khóa học",
      progress: 75,
      contents: [
        {
          id: 1,
          type: "video",
          title: "Tổng quan khóa học",
          description: `Bài học này sẽ giới thiệu tổng quan về khóa học React & TypeScript, bao gồm:
            • Các kiến thức sẽ được học
            • Cách thức học tập hiệu quả
            • Lộ trình học tập chi tiết
            • Cài đặt môi trường phát triển`,
          duration: "10:00",
          url: "https://example.com/video1",
          completed: true,
          locked: false,
          objectives: [
            "Hiểu được mục tiêu và nội dung khóa học",
            "Chuẩn bị môi trường phát triển",
            "Nắm được lộ trình học tập",
          ],
          keywords: ["Overview", "Setup", "Learning Path"],
        },
        {
          id: 2,
          type: "slide",
          title: "Slide bài giảng: React Fundamentals",
          description: `Slide trình bày các khái niệm cơ bản của React:
            • Components và Props
            • State và Lifecycle
            • Event Handling
            • Conditional Rendering
            • Lists và Keys`,
          url: "https://example.com/slide1",
          completed: true,
          locked: false,
          keywords: ["React", "Components", "Props", "State"],
        },
        {
          id: 3,
          type: "meet",
          title: "Live session: Q&A về React Hooks",
          description: `Buổi thảo luận trực tuyến về React Hooks:
            • Giải đáp thắc mắc về useState, useEffect
            • Demo các use cases phổ biến
            • Tips và best practices
            • Review code của học viên`,
          duration: "60:00",
          url: "https://meet.google.com/xyz",
          completed: false,
          locked: false,
          prerequisites: [
            "Đã hoàn thành các bài học về React Hooks",
            "Chuẩn bị câu hỏi trước buổi học",
          ],
        },
        {
          id: 4,
          type: "quiz",
          title: "Kiểm tra kiến thức React cơ bản",
          description: `Bài kiểm tra đánh giá kiến thức:
            • 20 câu hỏi trắc nghiệm
            • Thời gian làm bài: 30 phút
            • Yêu cầu đạt: 70% số câu đúng
            • Được phép làm lại 2 lần`,
          duration: "30:00",
          url: "https://example.com/quiz1",
          completed: false,
          locked: false,
          maxAttempts: 2,
          passingScore: 70,
        },
        {
          id: 5,
          type: "assignment",
          title: "Bài tập: Xây dựng Todo App",
          description: `Bài tập thực hành:
            • Xây dựng ứng dụng Todo List với React
            • Sử dụng TypeScript để type checking
            • Implement CRUD operations
            • Styling với CSS modules
            • Deployment lên Vercel`,
          duration: "120:00",
          url: "https://example.com/assignment1",
          completed: false,
          locked: false,
          objectives: [
            "Áp dụng kiến thức về React Components",
            "Thực hành TypeScript với React",
            "Hiểu về state management cơ bản",
          ],
        },
      ],
      materials: [
        {
          id: 101,
          title: "Tài liệu hướng dẫn",
          type: "pdf",
          url: "https://example.com/guide.pdf",
        },
        {
          id: 102,
          title: "Tài liệu tham khảo",
          type: "link",
          url: "https://reactjs.org",
        },
      ],
    },
    {
      id: 2,
      title: "React Fundamentals",
      progress: 30,
      contents: [
        {
          id: 4,
          type: "video",
          title: "Components và Props",
          duration: "15:00",
          url: "https://example.com/video2",
          completed: false,
          locked: false,
        },
        {
          id: 5,
          type: "assignment",
          title: "Bài tập Components",
          url: "https://example.com/assignment1",
          completed: false,
          locked: true,
          description: "Xây dựng các components cơ bản",
          maxAttempts: 3,
          passingScore: 80,
        },
      ],
      assessment: {
        id: 201,
        title: "Kiểm tra cuối chương",
        type: "quiz",
        questions: 10,
        duration: "30:00",
        passingScore: 80,
        maxAttempts: 2,
        locked: true,
      },
      materials: [
        {
          id: 103,
          title: "React Documentation",
          type: "link",
          url: "https://reactjs.org/docs",
        },
      ],
    },
  ],
};

// Mock data for documents
const mockDocuments = [
  {
    id: 1,
    title: "Tài liệu TypeScript cơ bản",
    description: "Tổng hợp kiến thức TypeScript cơ bản",
    fileType: "pdf",
    fileSize: "2.5 MB",
    downloadUrl: "https://example.com/typescript-basic.pdf",
  },
  {
    id: 2,
    title: "TypeScript Types Guide",
    description: "Hướng dẫn về các kiểu dữ liệu trong TypeScript",
    fileType: "pdf",
    fileSize: "1.8 MB",
    downloadUrl: "https://example.com/docs/ts-types.pdf",
  },
];

// Mock data for students
const mockStudents = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "/src/assets/avatar.png",
    progress: 75,
    lastActive: "2024-03-20",
    completedLessons: 12,
    totalLessons: 24,
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "/src/assets/avatar.png",
    progress: 45,
    lastActive: "2024-03-18",
    completedLessons: 8,
    totalLessons: 24,
  },
];

// Mock data for comments
const mockComments = [
  {
    id: 1,
    user: {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "/src/assets/avatar.png",
      role: "student",
    },
    content:
      "Thầy ơi, em không hiểu phần React Hook lắm, thầy có thể giải thích lại được không ạ?",
    createdAt: "2024-03-20T10:30:00",
    replies: [
      {
        id: 101,
        user: {
          id: 999,
          name: "Giảng viên",
          avatar: "/src/assets/avatar.png",
          role: "instructor",
        },
        content: "Chào bạn, mình sẽ giải thích thêm trong buổi học tới nhé!",
        createdAt: "2024-03-20T11:15:00",
      },
    ],
  },
];

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

// Thêm hàm helper để lấy nội dung đầu tiên
const getFirstContent = (sections: any[]) => {
  return sections[0]?.contents[0] || null;
};

const InstructorCourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [expandedSections, setExpandedSections] = useState<number[]>(
    mockCourseData.sections.map((section) => section.id)
  );

  // Cập nhật kiểu dữ liệu của selectedContent
  const [selectedContent, setSelectedContent] = useState<{
    sectionId: number;
    content: ContentItem;
  } | null>(
    mockCourseData.sections[0]?.contents[0]
      ? {
          sectionId: mockCourseData.sections[0].id,
          content: mockCourseData.sections[0].contents[0],
        }
      : null
  );

  // Thêm state quản lý modal
  const [openAddContentModal, setOpenAddContentModal] = useState(false);
  const [openEditContentModal, setOpenEditContentModal] = useState(false);
  const [openAddDocumentModal, setOpenAddDocumentModal] = useState(false);
  const [openAddQuizModal, setOpenAddQuizModal] = useState(false);
  const [openAddAssignmentModal, setOpenAddAssignmentModal] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);

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

  // Form state bổ sung trường cho document
  const [documentForm, setDocumentForm] = useState({
    title: "",
    description: "",
    section: "",
  });

  // Thêm state cho modal quản lý section
  const [openSectionModal, setOpenSectionModal] = useState(false);
  const [isEditSection, setIsEditSection] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    id: 0,
    title: "",
    description: "",
    position: 0,
  });

  // Cập nhật hàm handleContentClick để lưu cả sectionId
  const handleContentClick = (sectionId: number, content: ContentItem) => {
    setSelectedContent({
      sectionId,
      content,
    });
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

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle color="primary" />;
      case "slide":
        return <Description color="primary" />;
      case "meet":
        return <VideoCall color="primary" />;
      case "quiz":
        return <Quiz color="primary" />;
      case "assignment":
        return <Assignment color="primary" />;
      case "document":
        return <MenuBook color="primary" />;
      case "link":
        return <LinkIcon color="primary" />;
      default:
        return <PlayCircle color="primary" />;
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

  // Hàm mở modal với reset file
  const handleOpenAddContentModal = (sectionId: number) => {
    // Tìm section được chọn
    const section = mockCourseData.sections.find((s) => s.id === sectionId);
    if (!section) return;

    // Tính vị trí mặc định (cuối section)
    const defaultPosition = section.contents ? section.contents.length : 0;

    setContentForm({
      title: "",
      type: "video",
      description: "",
      duration: "",
      url: "",
      sectionId: sectionId,
      position: defaultPosition,
    });
    setOpenAddContentModal(true);
  };

  // Cập nhật hàm mở modal sửa
  const handleOpenEditContentModal = (
    content: ContentItem,
    sectionId: number
  ) => {
    setContentForm({
      title: content.title,
      type: content.type,
      description: content.description,
      duration: content.duration || "",
      url: content.url,
      sectionId: sectionId,
      position:
        mockCourseData.sections
          .find((s) => s.id === sectionId)
          ?.contents.findIndex((c) => c.id === content.id) || 0,
    });
    setOpenEditContentModal(true);
  };

  // Hàm xử lý submit với file
  const handleContentFormSubmit = (isEdit: boolean) => {
    // Nếu đang tải file thì tải lên trước
    if (selectedFile && !isUploading && uploadProgress === 0) {
      simulateFileUpload();
      return;
    }

    // Nếu đang tải lên thì không cho submit
    if (isUploading) return;

    // Xử lý lưu dữ liệu
    console.log("Form submitted:", contentForm);
    console.log("File uploaded:", selectedFile);

    // Đóng modal tương ứng
    if (isEdit) {
      setOpenEditContentModal(false);
    } else {
      setOpenAddContentModal(false);
    }

    resetFileUpload();
  };

  // Hàm mở modal thêm section mới
  const handleAddSection = () => {
    setIsEditSection(false);
    setSectionForm({
      id: 0,
      title: "",
      description: "",
      position: mockCourseData.sections.length,
    });
    setOpenSectionModal(true);
  };

  // Hàm mở modal chỉnh sửa section
  const handleEditSection = (sectionId: number) => {
    const section = mockCourseData.sections.find((s) => s.id === sectionId);
    if (section) {
      // Tìm vị trí hiện tại của section
      const position = mockCourseData.sections.findIndex(
        (s) => s.id === sectionId
      );

      setIsEditSection(true);
      setSectionForm({
        id: section.id,
        title: section.title,
        description: section.description || "",
        position: position,
      });
      setOpenSectionModal(true);
    }
  };

  // Hàm xử lý submit form section
  const handleSectionFormSubmit = () => {
    if (isEditSection) {
      console.log("Cập nhật section:", sectionForm);
      // Xử lý cập nhật section trên server
    } else {
      console.log("Thêm section mới:", sectionForm);
      // Xử lý thêm section mới trên server
    }
    setOpenSectionModal(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Course Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    variant="rounded"
                    src={mockCourseData.thumbnail}
                    sx={{ width: 120, height: 120 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" gutterBottom>
                      {mockCourseData.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        color="success"
                        label={
                          mockCourseData.status === "published"
                            ? "Đã xuất bản"
                            : "Bản nháp"
                        }
                      />
                      <Typography variant="body2" color="text.secondary">
                        Cập nhật:{" "}
                        {new Date(
                          mockCourseData.lastUpdated
                        ).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>

                <Typography variant="body1">
                  {mockCourseData.description}
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  divider={<Divider orientation="vertical" flexItem />}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <People color="action" />
                    <Typography>
                      {mockCourseData.totalStudents} học viên
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Star sx={{ color: "warning.main" }} />
                    <Typography>
                      {mockCourseData.rating} ({mockCourseData.totalRatings}{" "}
                      đánh giá)
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PlayCircle color="action" />
                    <Typography>
                      {mockCourseData.totalLessons} bài học (
                      {mockCourseData.totalDuration})
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Settings />}
                  fullWidth
                  onClick={() => navigate(`/instructor/courses/${id}/settings`)}
                >
                  Cài đặt khóa học
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Course Content */}
      <Grid container spacing={3}>
        {/* Left sidebar - Course Structure */}
        <Grid item xs={12} md={3}>
          <CourseStructure
            sections={mockCourseData.sections}
            handleContentClick={handleContentClick}
            handleAddSection={handleAddSection}
            handleSectionToggle={handleSectionToggle}
            expandedSections={expandedSections}
            handleEditSection={handleEditSection}
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
                <Tab label="Học viên" />
                <Tab label="Tài liệu" />
                <Tab label="Thảo luận" />
                <Tab label="Bài tập/Quiz" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {selectedContent && (
                <ContentDetail content={selectedContent.content} />
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Danh sách học viên ({mockStudents.length})
              </Typography>
              <List>
                {mockStudents.map((student) => (
                  <Card key={student.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar src={student.avatar} />
                            <Box>
                              <Typography variant="subtitle1">
                                {student.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Hoạt động gần nhất: {student.lastActive}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box>
                            <Typography variant="body2" gutterBottom>
                              Tiến độ: {student.progress}% (
                              {student.completedLessons}/{student.totalLessons}{" "}
                              bài học)
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={student.progress}
                              sx={{ height: 8, borderRadius: 1 }}
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </List>
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
                <Typography variant="h6">Tài liệu khóa học</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenAddDocumentModal(true)}
                >
                  Thêm tài liệu
                </Button>
              </Box>
              <ContentDocuments documents={mockDocuments} />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <ContentDiscussion comments={mockComments} />
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">Bài tập & Quiz</Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setOpenAddAssignmentModal(true)}
                  >
                    Thêm bài tập
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpenAddQuizModal(true)}
                  >
                    Thêm quiz
                  </Button>
                </Stack>
              </Box>
              <Typography>Quản lý bài tập và quiz của khóa học</Typography>
            </TabPanel>
          </Card>
        </Grid>
      </Grid>

      {/* Thêm các Modal */}
      {/* Modal Thêm nội dung mới */}
      <Dialog
        open={openAddContentModal}
        onClose={() => {
          setOpenAddContentModal(false);
          resetFileUpload();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Thêm nội dung mới</Typography>
            <IconButton onClick={() => setOpenAddContentModal(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Chọn phần học */}
            <FormControl fullWidth required>
              <InputLabel>Phần học</InputLabel>
              <Select
                value={contentForm.sectionId}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    sectionId: Number(e.target.value),
                    // Reset position khi đổi section
                    position:
                      mockCourseData.sections.find(
                        (s) => s.id === Number(e.target.value)
                      )?.contents?.length || 0,
                  })
                }
                label="Phần học"
              >
                {mockCourseData.sections.map((section) => (
                  <MenuItem key={section.id} value={section.id}>
                    {section.title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Chọn phần học cho nội dung này</FormHelperText>
            </FormControl>

            {/* Vị trí trong phần học */}
            <FormControl fullWidth>
              <InputLabel>Vị trí hiển thị</InputLabel>
              <Select
                value={contentForm.position}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    position: Number(e.target.value),
                  })
                }
                label="Vị trí hiển thị"
              >
                {/* Tạo danh sách vị trí có thể chọn */}
                {contentForm.sectionId > 0 &&
                  Array.from(
                    {
                      length:
                        // Nếu đang sửa và section không đổi thì là contents.length
                        // Nếu thêm mới hoặc đã đổi section thì là contents.length + 1
                        openEditContentModal &&
                        contentForm.sectionId === selectedContent?.sectionId
                          ? mockCourseData.sections.find(
                              (s) => s.id === contentForm.sectionId
                            )?.contents.length || 0
                          : (mockCourseData.sections.find(
                              (s) => s.id === contentForm.sectionId
                            )?.contents.length || 0) + 1,
                    },
                    (_, i) => {
                      const section = mockCourseData.sections.find(
                        (s) => s.id === contentForm.sectionId
                      );
                      const contents = section?.contents || [];

                      return (
                        <MenuItem key={i} value={i}>
                          {i === 0
                            ? "Đầu tiên trong phần này"
                            : i === contents.length
                            ? "Cuối cùng trong phần này"
                            : `Sau "${contents[i - 1]?.title || ""}"`}
                        </MenuItem>
                      );
                    }
                  )}
              </Select>
              <FormHelperText>
                Chọn vị trí hiển thị của nội dung trong phần học
              </FormHelperText>
            </FormControl>

            {/* Các trường khác giữ nguyên */}
            <TextField
              label="Tiêu đề nội dung"
              fullWidth
              value={contentForm.title}
              onChange={(e) =>
                setContentForm({ ...contentForm, title: e.target.value })
              }
              required
            />

            <FormControl fullWidth>
              <InputLabel>Loại nội dung</InputLabel>
              <Select
                value={contentForm.type}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    type: e.target.value as ContentItem["type"],
                  })
                }
                label="Loại nội dung"
              >
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="slide">Slide</MenuItem>
                <MenuItem value="document">Tài liệu</MenuItem>
                <MenuItem value="assignment">Bài tập</MenuItem>
                <MenuItem value="quiz">Quiz</MenuItem>
                <MenuItem value="meet">Buổi học trực tuyến</MenuItem>
                <MenuItem value="link">Đường dẫn</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={4}
              value={contentForm.description}
              onChange={(e) =>
                setContentForm({ ...contentForm, description: e.target.value })
              }
            />

            <TextField
              label="Thời lượng (hh:mm:ss)"
              fullWidth
              value={contentForm.duration}
              onChange={(e) =>
                setContentForm({ ...contentForm, duration: e.target.value })
              }
              placeholder="VD: 10:30"
            />

            {/* Phần file upload cho video/document */}
            {(contentForm.type === "video" ||
              contentForm.type === "document" ||
              contentForm.type === "slide") && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Tải lên{" "}
                  {contentForm.type === "video"
                    ? "video"
                    : contentForm.type === "slide"
                    ? "slide"
                    : "tài liệu"}
                </Typography>

                {uploadError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {uploadError}
                  </Alert>
                )}

                <Box
                  sx={{
                    border: "1px dashed grey",
                    borderRadius: 1,
                    p: 3,
                    textAlign: "center",
                    mb: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                    accept={
                      contentForm.type === "video"
                        ? "video/*"
                        : contentForm.type === "slide"
                        ? ".ppt,.pptx,.pdf"
                        : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                    }
                  />

                  {!selectedFile ? (
                    <Button
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Chọn{" "}
                      {contentForm.type === "video"
                        ? "video"
                        : contentForm.type === "slide"
                        ? "slide"
                        : "tài liệu"}
                    </Button>
                  ) : (
                    <Stack spacing={2}>{/* Hiển thị file đã chọn */}</Stack>
                  )}
                </Box>
              </Box>
            )}

            {/* URL trực tiếp (nếu không tải lên) */}
            <TextField
              label={`URL ${
                contentForm.type === "video"
                  ? "video"
                  : contentForm.type === "slide"
                  ? "slide"
                  : contentForm.type === "document"
                  ? "tài liệu"
                  : contentForm.type === "link"
                  ? "đường dẫn"
                  : "nội dung"
              }`}
              fullWidth
              value={contentForm.url}
              onChange={(e) =>
                setContentForm({ ...contentForm, url: e.target.value })
              }
              placeholder="https://example.com/content"
              helperText={
                contentForm.type === "video" ||
                contentForm.type === "document" ||
                contentForm.type === "slide"
                  ? "Có thể để trống nếu bạn tải file lên trực tiếp"
                  : "Nhập URL đến nội dung"
              }
              required={
                !selectedFile ||
                !(
                  contentForm.type === "video" ||
                  contentForm.type === "document" ||
                  contentForm.type === "slide"
                )
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAddContentModal(false);
              resetFileUpload();
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // Xử lý tải lên file nếu có
              if (
                selectedFile &&
                !isUploading &&
                (contentForm.type === "video" ||
                  contentForm.type === "document" ||
                  contentForm.type === "slide")
              ) {
                simulateFileUpload();
              } else {
                // Nếu không có file hoặc đã tải lên xong
                console.log("Content form submitted:", contentForm);
                setOpenAddContentModal(false);
                resetFileUpload();
              }
            }}
            disabled={
              !contentForm.title ||
              (!contentForm.url &&
                !selectedFile &&
                (contentForm.type === "video" ||
                  contentForm.type === "document" ||
                  contentForm.type === "slide")) ||
              isUploading
            }
          >
            {isUploading ? "Đang tải lên..." : "Thêm nội dung"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Sửa nội dung */}
      <Dialog
        open={openEditContentModal}
        onClose={() => setOpenEditContentModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Chỉnh sửa nội dung</Typography>
            <IconButton onClick={() => setOpenEditContentModal(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Chọn phần học */}
            <FormControl fullWidth required>
              <InputLabel>Phần học</InputLabel>
              <Select
                value={contentForm.sectionId}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    sectionId: Number(e.target.value),
                    // Reset position khi đổi section
                    position:
                      mockCourseData.sections.find(
                        (s) => s.id === Number(e.target.value)
                      )?.contents?.length || 0,
                  })
                }
                label="Phần học"
              >
                {mockCourseData.sections.map((section) => (
                  <MenuItem key={section.id} value={section.id}>
                    {section.title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Chọn phần học cho nội dung này</FormHelperText>
            </FormControl>

            {/* Vị trí trong phần học */}
            <FormControl fullWidth>
              <InputLabel>Vị trí hiển thị</InputLabel>
              <Select
                value={contentForm.position}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    position: Number(e.target.value),
                  })
                }
                label="Vị trí hiển thị"
              >
                {/* Tạo danh sách vị trí có thể chọn */}
                {contentForm.sectionId > 0 &&
                  Array.from(
                    {
                      length:
                        // Nếu đang sửa và section không đổi thì là contents.length
                        // Nếu thêm mới hoặc đã đổi section thì là contents.length + 1
                        openEditContentModal &&
                        contentForm.sectionId === selectedContent?.sectionId
                          ? mockCourseData.sections.find(
                              (s) => s.id === contentForm.sectionId
                            )?.contents.length || 0
                          : (mockCourseData.sections.find(
                              (s) => s.id === contentForm.sectionId
                            )?.contents.length || 0) + 1,
                    },
                    (_, i) => {
                      const section = mockCourseData.sections.find(
                        (s) => s.id === contentForm.sectionId
                      );
                      const contents = section?.contents || [];

                      return (
                        <MenuItem key={i} value={i}>
                          {i === 0
                            ? "Đầu tiên trong phần này"
                            : i === contents.length
                            ? "Cuối cùng trong phần này"
                            : `Sau "${contents[i - 1]?.title || ""}"`}
                        </MenuItem>
                      );
                    }
                  )}
              </Select>
              <FormHelperText>
                Chọn vị trí hiển thị của nội dung trong phần học
              </FormHelperText>
            </FormControl>

            {/* Các trường khác giữ nguyên */}
            <TextField
              label="Tiêu đề nội dung"
              fullWidth
              value={contentForm.title}
              onChange={(e) =>
                setContentForm({ ...contentForm, title: e.target.value })
              }
              required
            />

            <FormControl fullWidth>
              <InputLabel>Loại nội dung</InputLabel>
              <Select
                value={contentForm.type}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    type: e.target.value as ContentItem["type"],
                  })
                }
                label="Loại nội dung"
              >
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="slide">Slide</MenuItem>
                <MenuItem value="document">Tài liệu</MenuItem>
                <MenuItem value="assignment">Bài tập</MenuItem>
                <MenuItem value="quiz">Quiz</MenuItem>
                <MenuItem value="meet">Meet</MenuItem>
                <MenuItem value="link">Đường dẫn</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={4}
              value={contentForm.description}
              onChange={(e) =>
                setContentForm({ ...contentForm, description: e.target.value })
              }
            />

            <TextField
              label="Thời lượng (hh:mm:ss)"
              fullWidth
              value={contentForm.duration}
              onChange={(e) =>
                setContentForm({ ...contentForm, duration: e.target.value })
              }
              placeholder="VD: 10:30"
            />

            <TextField
              label="URL"
              fullWidth
              value={contentForm.url}
              onChange={(e) =>
                setContentForm({ ...contentForm, url: e.target.value })
              }
              placeholder="https://example.com/content"
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditContentModal(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={() => {
              // Xử lý tải lên file nếu có
              if (
                selectedFile &&
                !isUploading &&
                (contentForm.type === "video" ||
                  contentForm.type === "document" ||
                  contentForm.type === "slide")
              ) {
                simulateFileUpload();
              } else {
                // Nếu không có file hoặc đã tải lên xong
                console.log("Content form updated:", contentForm);
                setOpenEditContentModal(false);
                resetFileUpload();
              }
            }}
            disabled={
              !contentForm.title ||
              (!contentForm.url &&
                !selectedFile &&
                (contentForm.type === "video" ||
                  contentForm.type === "document" ||
                  contentForm.type === "slide")) ||
              isUploading
            }
          >
            {isUploading ? "Đang tải lên..." : "Cập nhật nội dung"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Thêm tài liệu */}
      <Dialog
        open={openAddDocumentModal}
        onClose={() => {
          setOpenAddDocumentModal(false);
          resetFileUpload();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Thêm tài liệu mới</Typography>
            <IconButton onClick={() => setOpenAddDocumentModal(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Tiêu đề tài liệu"
              fullWidth
              value={documentForm.title}
              onChange={(e) =>
                setDocumentForm({ ...documentForm, title: e.target.value })
              }
              required
            />

            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={3}
              value={documentForm.description}
              onChange={(e) =>
                setDocumentForm({
                  ...documentForm,
                  description: e.target.value,
                })
              }
            />

            <FormControl fullWidth>
              <InputLabel>Phần học</InputLabel>
              <Select
                value={documentForm.section}
                onChange={(e) =>
                  setDocumentForm({ ...documentForm, section: e.target.value })
                }
                label="Phần học"
              >
                <MenuItem value="">Chung cho toàn khóa học</MenuItem>
                {mockCourseData.sections.map((section) => (
                  <MenuItem key={section.id} value={section.id.toString()}>
                    {section.title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Chọn phần học áp dụng cho tài liệu này
              </FormHelperText>
            </FormControl>

            {/* Phần tải lên file tài liệu */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tài liệu
              </Typography>

              {uploadError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {uploadError}
                </Alert>
              )}

              <Box
                sx={{
                  border: "1px dashed grey",
                  borderRadius: 1,
                  p: 3,
                  textAlign: "center",
                  mb: 2,
                  bgcolor: "background.paper",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                />

                {!selectedFile ? (
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Chọn tài liệu
                  </Button>
                ) : (
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <InsertDriveFile />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" noWrap>
                          {selectedFile.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={resetFileUpload}>
                        <Close fontSize="small" />
                      </IconButton>
                    </Stack>

                    {isUploading && (
                      <Box sx={{ width: "100%" }}>
                        <LinearProgress
                          variant="determinate"
                          value={uploadProgress}
                        />
                        <Typography
                          variant="caption"
                          align="center"
                          display="block"
                          sx={{ mt: 1 }}
                        >
                          Đang tải lên: {uploadProgress}%
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                )}
              </Box>

              <Typography variant="caption" color="text.secondary">
                Hỗ trợ định dạng: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP,
                RAR. Kích thước tối đa: 50MB
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAddDocumentModal(false);
              resetFileUpload();
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedFile && !isUploading && uploadProgress === 0) {
                simulateFileUpload();
              } else if (!isUploading) {
                console.log("Document form submitted:", documentForm);
                console.log("Document file:", selectedFile);
                setOpenAddDocumentModal(false);
                resetFileUpload();
              }
            }}
            disabled={!documentForm.title || !selectedFile || isUploading}
          >
            {isUploading ? "Đang tải lên..." : "Thêm tài liệu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Thêm quiz */}
      <Dialog
        open={openAddQuizModal}
        onClose={() => setOpenAddQuizModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Thêm quiz mới</Typography>
            <IconButton onClick={() => setOpenAddQuizModal(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>{/* Form thêm quiz */}</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddQuizModal(false)}>Hủy</Button>
          <Button variant="contained">Thêm</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Thêm bài tập */}
      <Dialog
        open={openAddAssignmentModal}
        onClose={() => setOpenAddAssignmentModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Thêm bài tập mới</Typography>
            <IconButton onClick={() => setOpenAddAssignmentModal(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>{/* Form thêm bài tập */}</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddAssignmentModal(false)}>Hủy</Button>
          <Button variant="contained">Thêm</Button>
        </DialogActions>
      </Dialog>

      {/* Modal thêm/chỉnh sửa Section */}
      <Dialog
        open={openSectionModal}
        onClose={() => setOpenSectionModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              {isEditSection ? "Chỉnh sửa phần học" : "Thêm phần học mới"}
            </Typography>
            <IconButton onClick={() => setOpenSectionModal(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Tiêu đề phần học"
              fullWidth
              value={sectionForm.title}
              onChange={(e) =>
                setSectionForm({ ...sectionForm, title: e.target.value })
              }
              required
            />

            <TextField
              label="Mô tả phần học"
              fullWidth
              multiline
              rows={3}
              value={sectionForm.description}
              onChange={(e) =>
                setSectionForm({ ...sectionForm, description: e.target.value })
              }
            />

            {/* Phần chọn vị trí áp dụng cho cả thêm và sửa */}
            <FormControl fullWidth>
              <InputLabel>Vị trí hiển thị</InputLabel>
              <Select
                value={sectionForm.position}
                onChange={(e) =>
                  setSectionForm({
                    ...sectionForm,
                    position: Number(e.target.value),
                  })
                }
                label="Vị trí hiển thị"
              >
                {/* Tạo danh sách vị trí có thể chọn */}
                {Array.from(
                  {
                    length: isEditSection
                      ? mockCourseData.sections.length
                      : mockCourseData.sections.length + 1,
                  },
                  (_, i) => (
                    <MenuItem key={i} value={i}>
                      {i === 0
                        ? "Đầu tiên"
                        : i === mockCourseData.sections.length
                        ? "Cuối cùng"
                        : `Sau "${
                            mockCourseData.sections[i - 1]?.title || ""
                          }"`}
                    </MenuItem>
                  )
                )}
              </Select>
              <FormHelperText>
                Chọn vị trí hiển thị của phần học trong khóa học
              </FormHelperText>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSectionModal(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSectionFormSubmit}
            disabled={!sectionForm.title}
          >
            {isEditSection ? "Cập nhật" : "Thêm phần học"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstructorCourseView;
