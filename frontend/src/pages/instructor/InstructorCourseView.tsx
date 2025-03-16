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
  Divider,
  List,
  LinearProgress,
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
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import ContentDiscussion from "../../components/common/course/ContentDiscussion";
import ContentDocuments from "../../components/common/course/ContentDocuments";
import ContentDetail from "../../components/common/course/ContentDetail";
import CourseStructure from "../../components/instructor/course-view/CourseStructure";
import DialogAddEditLesson from "../../components/instructor/course-view/DialogAddEditLesson";
import DialogAddEditDocument from "../../components/instructor/course-view/DialogAddEditDocument";
import DialogAddEditQuiz from "../../components/instructor/course-view/DialogAddEditQuiz";
import DialogAddEditAssignment from "../../components/instructor/course-view/DialogAddEditAssignment";
import DialogAddEditSection from "../../components/instructor/course-view/DialogAddEditSection";
import DialogSetting from "../../components/instructor/course-view/DialogSetting";
import CourseQuizAssignment from "../../components/instructor/course-view/CourseQuizAssignment";

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
          id: 6,
          type: "video",
          title: "Components và Props",
          duration: "15:00",
          url: "https://example.com/video2",
          completed: false,
          locked: false,
        },
        {
          id: 7,
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

// Thêm mock data cho quizzes và assignments
const mockQuizzes = [
  {
    id: 1,
    title: "Kiểm tra kiến thức React cơ bản",
    description: "Bài kiểm tra nhanh về các kiến thức React đã học",
    duration: 30,
    maxAttempts: 2,
    passingScore: 70,
    sectionId: 1,
    totalQuestions: 15,
  },
  {
    id: 2,
    title: "Kiểm tra TypeScript",
    description: "Đánh giá kiến thức về TypeScript và cách sử dụng với React",
    duration: 45,
    maxAttempts: 3,
    passingScore: 75,
    sectionId: 2,
    totalQuestions: 20,
  },
];

const mockAssignments = [
  {
    id: 1,
    title: "Xây dựng ứng dụng Todo List",
    description: "Sử dụng React và TypeScript để xây dựng ứng dụng Todo List",
    dueDate: "2024-05-15",
    maxScore: 100,
    sectionId: 3,
    totalSubmissions: 12,
  },
  {
    id: 2,
    title: "Tạo form với validation",
    description: "Xây dựng form đăng ký với validation sử dụng React Hook Form",
    dueDate: "2024-05-20",
    maxScore: 100,
    sectionId: 4,
    totalSubmissions: 8,
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

  // Khởi tạo selectedContent với nội dung đầu tiên
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    getFirstContent(mockCourseData.sections)
  );

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

  // Form state bổ sung trường cho document
  const [documentForm, setDocumentForm] = useState({
    title: "",
    description: "",
    section: "",
  });

  // Thêm state quản lý section modals
  const [openAddSectionModal, setOpenAddSectionModal] = useState(false);
  const [openEditSectionModal, setOpenEditSectionModal] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<any>(null);

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
  const [courseSettings, setCourseSettings] = useState({
    isPublished: mockCourseData.status === "published",
    visibility: "public",
    allowPreview: true,
    requireEnrollment: true,
    price: mockCourseData.price || 0,
    salePrice: 0,
    enrollmentLimit: 0,
    passingScore: 70,
    certificateEnabled: true,
    discountCodes: [],
  });

  const handleContentClick = (content: ContentItem) => {
    setSelectedContent(content);

    // Kích hoạt tab "Nội dung" (giả sử tab nội dung có index là 0)
    setTabValue(0);

    // Hoặc nếu tab được quản lý bằng tên
    // setActiveTab("content");
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

  // Hàm mở modal thêm nội dung mới
  const handleOpenAddContentModal = (sectionId: number) => {
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

  // Xử lý khi submit form thêm mới
  const handleAddContent = (contentData: any) => {
    console.log("Thêm nội dung mới:", contentData);
    // Thực hiện thêm nội dung vào state hoặc gọi API

    // Đóng modal
    setOpenAddContentModal(false);
    setCurrentSectionId(null);
  };

  // Xử lý khi submit form sửa
  const handleUpdateContent = (contentData: any) => {
    console.log("Cập nhật nội dung:", contentData);
    // Thực hiện cập nhật nội dung trong state hoặc gọi API

    // Đóng modal
    setOpenEditContentModal(false);
    setContentToEdit(null);
    setCurrentSectionId(null);
  };

  // Hàm mở modal thêm section
  const handleOpenAddSectionModal = () => {
    setOpenAddSectionModal(true);
  };

  // Hàm mở modal sửa section
  const handleOpenEditSectionModal = (section: any) => {
    setSectionToEdit(section);
    setOpenEditSectionModal(true);
  };

  // Xử lý khi thêm section mới
  const handleAddSection = (sectionData: any) => {
    console.log("Thêm phần học mới:", sectionData);
    // Thực hiện thêm phần học vào state hoặc gọi API

    // Đóng modal
    setOpenAddSectionModal(false);
  };

  // Xử lý khi cập nhật section
  const handleUpdateSection = (sectionData: any) => {
    console.log("Cập nhật phần học:", sectionData);
    // Thực hiện cập nhật phần học trong state hoặc gọi API

    // Đóng modal
    setOpenEditSectionModal(false);
    setSectionToEdit(null);
  };

  // Hàm mở modal thêm document
  const handleOpenAddDocumentModal = (sectionId?: number) => {
    setCurrentSectionId(sectionId || null);
    setOpenAddDocumentModal(true);
  };

  // Hàm mở modal sửa document
  const handleOpenEditDocumentModal = (document: any, sectionId?: number) => {
    setDocumentToEdit(document);
    setCurrentSectionId(sectionId || null);
    setOpenEditDocumentModal(true);
  };

  // Xử lý khi thêm document mới
  const handleAddDocument = (documentData: any) => {
    console.log("Thêm tài liệu mới:", documentData);
    // Thực hiện thêm tài liệu vào state hoặc gọi API

    // Đóng modal
    setOpenAddDocumentModal(false);
    setCurrentSectionId(null);
  };

  // Xử lý khi cập nhật document
  const handleUpdateDocument = (documentData: any) => {
    console.log("Cập nhật tài liệu:", documentData);
    // Thực hiện cập nhật tài liệu trong state hoặc gọi API

    // Đóng modal
    setOpenEditDocumentModal(false);
    setDocumentToEdit(null);
    setCurrentSectionId(null);
  };

  // Hàm mở modal thêm quiz
  const handleOpenAddQuizModal = (sectionId?: number) => {
    setCurrentSectionId(sectionId || null);
    setOpenAddQuizModal(true);
  };

  // Hàm mở modal sửa quiz
  const handleOpenEditQuizModal = (quiz: any, sectionId?: number) => {
    setQuizToEdit(quiz);
    setCurrentSectionId(sectionId || null);
    setOpenEditQuizModal(true);
  };

  // Xử lý khi thêm quiz mới
  const handleAddQuiz = (quizData: any) => {
    console.log("Thêm quiz mới:", quizData);
    // Thực hiện thêm quiz vào state hoặc gọi API

    // Đóng modal
    setOpenAddQuizModal(false);
    setCurrentSectionId(null);
  };

  // Xử lý khi cập nhật quiz
  const handleUpdateQuiz = (quizData: any) => {
    console.log("Cập nhật quiz:", quizData);
    // Thực hiện cập nhật quiz trong state hoặc gọi API

    // Đóng modal
    setOpenEditQuizModal(false);
    setQuizToEdit(null);
    setCurrentSectionId(null);
  };

  // Hàm mở modal thêm assignment
  const handleOpenAddAssignmentModal = (sectionId?: number) => {
    setCurrentSectionId(sectionId || null);
    setOpenAddAssignmentModal(true);
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

  // Xử lý khi thêm assignment mới
  const handleAddAssignment = (assignmentData: any) => {
    console.log("Thêm bài tập mới:", assignmentData);
    // Thực hiện thêm bài tập vào state hoặc gọi API

    // Đóng modal
    setOpenAddAssignmentModal(false);
    setCurrentSectionId(null);
  };

  // Xử lý khi cập nhật assignment
  const handleUpdateAssignment = (assignmentData: any) => {
    console.log("Cập nhật bài tập:", assignmentData);
    // Thực hiện cập nhật bài tập trong state hoặc gọi API

    // Đóng modal
    setOpenEditAssignmentModal(false);
    setAssignmentToEdit(null);
    setCurrentSectionId(null);
  };

  // Hàm xử lý lưu cài đặt
  const handleSaveSettings = (settings: any) => {
    console.log("Lưu cài đặt khóa học:", settings);
    // Cập nhật cài đặt vào state hoặc gọi API
    setCourseSettings(settings);

    // Đóng dialog
    setOpenSettingsModal(false);
  };

  // Thêm hàm xử lý xóa section
  const handleDeleteSection = (sectionId: number) => {
    console.log("Xóa section:", sectionId);
    // Cập nhật state để xóa section
    const updatedSections = mockCourseData.sections.filter(
      (section) => section.id !== sectionId
    );
    setMockCourseData({
      ...mockCourseData,
      sections: updatedSections,
    });

    // Nếu section bị xóa đang được chọn, reset selected content
    if (selectedContent && selectedContent.sectionId === sectionId) {
      setSelectedContent(null);
    }

    // Cũng cần loại bỏ sectionId khỏi danh sách các section đang mở
    setExpandedSections(expandedSections.filter((id) => id !== sectionId));
  };

  // Thêm hàm xử lý xóa content
  const handleDeleteContent = (contentId: number, sectionId: number) => {
    console.log("Xóa content:", contentId, "từ section:", sectionId);

    // Tìm section chứa content
    const sectionIndex = mockCourseData.sections.findIndex(
      (section) => section.id === sectionId
    );

    if (sectionIndex !== -1) {
      // Copy sections để tránh mutate state trực tiếp
      const updatedSections = [...mockCourseData.sections];

      // Lọc ra các content không bị xóa
      updatedSections[sectionIndex].contents = updatedSections[
        sectionIndex
      ].contents.filter((content) => content.id !== contentId);

      // Cập nhật state
      setMockCourseData({
        ...mockCourseData,
        sections: updatedSections,
      });

      // Nếu content bị xóa đang được chọn, reset selected content
      if (selectedContent && selectedContent.id === contentId) {
        setSelectedContent(null);
      }
    }
  };

  // Thêm hàm xử lý xóa tài liệu
  const handleDeleteDocument = (documentId: number) => {
    console.log("Xóa tài liệu:", documentId);
    // Lọc ra các tài liệu không bị xóa
    const updatedDocuments = mockDocuments.filter(
      (doc) => doc.id !== documentId
    );

    // Cập nhật state (giả sử bạn sẽ chuyển mockDocuments thành state)
    // setMockDocuments(updatedDocuments);
  };

  // Thêm hàm xử lý xóa quiz và assignment
  const handleDeleteQuiz = (quizId: number) => {
    console.log("Xóa quiz:", quizId);
    // Logic xóa quiz
  };

  const handleDeleteAssignment = (assignmentId: number) => {
    console.log("Xóa assignment:", assignmentId);
    // Logic xóa assignment
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
        courseId={mockCourseData.id}
        initialSettings={courseSettings}
      />

      {/* Course Content */}
      <Grid container spacing={3}>
        {/* Left sidebar - Course Structure */}
        <Grid item xs={12} md={3}>
          <CourseStructure
            sections={mockCourseData.sections}
            handleContentClick={handleContentClick}
            handleAddSection={handleOpenAddSectionModal}
            handleSectionToggle={handleSectionToggle}
            expandedSections={expandedSections}
            handleEditSection={handleOpenEditSectionModal}
            selectedContent={selectedContent}
            getContentIcon={getContentIcon}
            handleOpenEditContentModal={handleOpenEditContentModal}
            handleOpenAddContentModal={handleOpenAddContentModal}
            onDeleteContent={handleDeleteContent}
            onDeleteSection={handleDeleteSection}
          />
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Card style={{ padding: "30x" }}>
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
                <>
                  <ContentDetail content={selectedContent} />
                </>
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
              <ContentDocuments
                documents={mockDocuments}
                isInstructor={true}
                onDeleteDocument={handleDeleteDocument}
              />
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
              <CourseQuizAssignment
                quizzes={mockQuizzes}
                assignments={mockAssignments}
                onEditQuiz={handleOpenEditQuizModal}
                onDeleteQuiz={handleDeleteQuiz}
                onEditAssignment={handleOpenEditAssignmentModal}
                onDeleteAssignment={handleDeleteAssignment}
                isInstructor={true}
              />
            </TabPanel>
          </Card>
        </Grid>
      </Grid>

      {/* Thêm các Modal */}
      {/* Modal Thêm lesson mới */}
      <DialogAddEditLesson
        open={openAddContentModal}
        onClose={() => setOpenAddContentModal(false)}
        onSubmit={handleAddContent}
        initialSectionId={currentSectionId || undefined}
        sections={mockCourseData.sections}
        editMode={false}
      />

      {/* Modal Sửa lesson */}
      <DialogAddEditLesson
        open={openEditContentModal}
        onClose={() => setOpenEditContentModal(false)}
        onSubmit={handleUpdateContent}
        contentToEdit={contentToEdit || undefined}
        sections={mockCourseData.sections}
        editMode={true}
      />

      {/* Modal Thêm tài liệu */}
      <DialogAddEditDocument
        open={openAddDocumentModal}
        onClose={() => setOpenAddDocumentModal(false)}
        onSubmit={handleAddDocument}
        initialSectionId={currentSectionId || undefined}
        sections={mockCourseData.sections}
        editMode={false}
      />

      {/* Modal sửa tài liệu */}
      <DialogAddEditDocument
        open={openEditDocumentModal}
        onClose={() => setOpenEditDocumentModal(false)}
        onSubmit={handleUpdateDocument}
        documentToEdit={documentToEdit || undefined}
        sections={mockCourseData.sections}
        editMode={true}
      />

      {/* Modal Thêm quiz */}
      <DialogAddEditQuiz
        open={openAddQuizModal}
        onClose={() => setOpenAddQuizModal(false)}
        onSubmit={handleAddQuiz}
        initialSectionId={currentSectionId || undefined}
        sections={mockCourseData.sections}
        editMode={false}
      />

      {/* Modal sửa quiz */}
      <DialogAddEditQuiz
        open={openEditQuizModal}
        onClose={() => setOpenEditQuizModal(false)}
        onSubmit={handleUpdateQuiz}
        quizToEdit={quizToEdit || undefined}
        sections={mockCourseData.sections}
        editMode={true}
      />

      {/* Modal Thêm bài tập */}
      <DialogAddEditAssignment
        open={openAddAssignmentModal}
        onClose={() => setOpenAddAssignmentModal(false)}
        onSubmit={handleAddAssignment}
        initialSectionId={currentSectionId || undefined}
        sections={mockCourseData.sections}
        editMode={false}
      />

      {/* Modal sửa bài tập */}
      <DialogAddEditAssignment
        open={openEditAssignmentModal}
        onClose={() => setOpenEditAssignmentModal(false)}
        onSubmit={handleUpdateAssignment}
        assignmentToEdit={assignmentToEdit || undefined}
        sections={mockCourseData.sections}
        editMode={true}
      />

      {/* Modal thêm section */}
      <DialogAddEditSection
        open={openAddSectionModal}
        onClose={() => setOpenAddSectionModal(false)}
        onSubmit={handleAddSection}
        sections={mockCourseData.sections}
        editMode={false}
      />

      {/* Modal sửa section */}
      <DialogAddEditSection
        open={openEditSectionModal}
        onClose={() => setOpenEditSectionModal(false)}
        onSubmit={handleUpdateSection}
        sectionToEdit={sectionToEdit || undefined}
        sections={mockCourseData.sections}
        editMode={true}
      />
    </Box>
  );
};

export default InstructorCourseView;
