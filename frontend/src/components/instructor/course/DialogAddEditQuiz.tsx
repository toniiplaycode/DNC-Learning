import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Stack,
  FormHelperText,
  Divider,
  List,
  ListItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Card,
  CardContent,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Chip,
  Switch,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Close,
  Add,
  Delete,
  Edit,
  ExpandMore,
  CheckCircle,
  DragIndicator,
  CloudUpload,
  Download,
  AutoAwesome,
  HelpOutline,
  InfoOutlined,
  LightbulbOutlined,
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { parseQuizDocument } from "../../../utils/quizParser";
import { toast } from "react-toastify";
import { generateDocxFromTemplate } from "../../../utils/browserDocGenerator";
import { fetchCourseQuizzes } from "../../../features/course-lessons/courseLessonsApiSlice";
import { selectAlCourseLessonlQuizzes } from "../../../features/course-lessons/courseLessonsSelector";
import {
  selectAllQuizzes,
  selectShowExplanationError,
  selectShowExplanationStatus,
} from "../../../features/quizzes/quizzesSelectors";
import {
  createQuiz,
  fetchInstructorAttempts,
  fetchQuizzesByCourse,
  fetchQuizzesByInstructor,
  updateQuiz,
  updateShowExplanation,
  generateQuizFromFile,
  resetGeneratedQuiz,
} from "../../../features/quizzes/quizzesSlice";
import { fetchCourseById } from "../../../features/courses/coursesApiSlice";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import { fetchClassInstructorById } from "../../../features/academic-class-instructors/academicClassInstructorsSlice";
import { selectCurrentClassInstructor } from "../../../features/academic-class-instructors/academicClassInstructorsSelectors";
import { selectAcademicClassStudents } from "../../../features/users/usersSelectors";
import { fetchStudentsByAcademicClass } from "../../../features/users/usersApiSlice";
import { createNotification } from "../../../features/notifications/notificationsSlice";
import { selectGeneratedQuiz } from "../../../features/quizzes/quizzesSelectors";

// Định nghĩa kiểu QuizOption
interface QuizOption {
  id?: number;
  questionId?: number;
  optionText: string;
  isCorrect: boolean;
  orderNumber: number;
}

// Định nghĩa kiểu QuizQuestion
interface QuizQuestion {
  id?: number;
  quizId?: number;
  questionText: string;
  questionType: QuestionType;
  correctExplanation?: string;
  points: number;
  orderNumber: number;
  options: QuizOption[];
}

// Định nghĩa kiểu Quiz
interface Quiz {
  id?: number;
  lessonId?: number | null;
  academicClassId?: number | null;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  attemptsAllowed: number;
  quizType: QuizType;
  showExplanation: boolean;
  random: number;
  startTime?: Date;
  endTime?: Date;
  questions?: QuizQuestion[];
}

enum QuizType {
  PRACTICE = "practice",
  HOMEWORK = "homework",
  MIDTERM = "midterm",
  FINAL = "final",
}

enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  TRUE_FALSE = "true_false",
}

// Định nghĩa props cho component
interface DialogAddEditQuizProps {
  open: boolean;
  onClose: () => void;
  initialLessonId?: number;
  quizToEdit?: Quiz;
  editMode: boolean;
  additionalInfo?: {
    targetType: string;
    className: string;
  };
}

const DialogAddEditQuiz: React.FC<DialogAddEditQuizProps> = ({
  open,
  onClose,
  initialLessonId,
  quizToEdit,
  editMode,
  additionalInfo,
}) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const lessonData = useAppSelector(selectAlCourseLessonlQuizzes);
  const quizzesData = useAppSelector(selectAllQuizzes);
  const currentClassInstructor = useAppSelector(selectCurrentClassInstructor);
  const academicClassStudents = useAppSelector(selectAcademicClassStudents);

  // Thêm state để theo dõi trạng thái cập nhật showExplanation
  const showExplanationStatus = useAppSelector(selectShowExplanationStatus);
  const showExplanationError = useAppSelector(selectShowExplanationError);

  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const generatedQuiz = useAppSelector(selectGeneratedQuiz);

  const [fileStats, setFileStats] = useState<{
    contentLength?: number;
    maxQuestions?: number;
  } | null>(null);

  const [hasBackendResult, setHasBackendResult] = useState(false);

  useEffect(() => {
    dispatch(fetchClassInstructorById(Number(currentUser?.userInstructor?.id)));
  }, [dispatch, currentUser]);

  // State cho form quiz
  const [quizForm, setQuizForm] = useState<Quiz>({
    title: "",
    description: "",
    lessonId: null,
    academicClassId: null,
    timeLimit: 30,
    passingScore: 50,
    attemptsAllowed: 1,
    quizType: QuizType.PRACTICE,
    showExplanation: true,
    random: 1,
  });

  useEffect(() => {
    if (quizForm.academicClassId)
      dispatch(fetchStudentsByAcademicClass(quizForm.academicClassId));
  }, [quizForm.academicClassId]);

  // State cho câu hỏi quiz
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    questionText: "",
    questionType: QuestionType.MULTIPLE_CHOICE,
    points: 1,
    orderNumber: 1,
    options: [
      { optionText: "", isCorrect: false, orderNumber: 1 },
      { optionText: "", isCorrect: false, orderNumber: 2 },
    ],
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  // Add ref for the edit section
  const editSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseQuizzes(Number(id)));
    }
  }, [dispatch, id]);

  // Cập nhật useEffect để hiển thị mock data trong cả hai trường hợp
  useEffect(() => {
    if (open) {
      if (editMode && quizToEdit) {
        // Tìm section của quiz khi edit
        let lessonId = quizToEdit.lessonId || null;

        // Cập nhật form với dữ liệu của quiz đang edit
        setQuizForm({
          ...quizToEdit,
          showExplanation: Boolean(quizToEdit.showExplanation),
          random: quizToEdit.random,
        });

        // Load câu hỏi từ quiz đang edit
        // Nếu không có câu hỏi, tự động tải từ quiz mẫu
        if (quizToEdit.questions && quizToEdit.questions.length > 0) {
          setQuestions([...quizToEdit.questions]);
        }
      } else {
        // Khi thêm mới, tự động tải quiz mẫu
        setQuizForm({
          title: "",
          description: "",
          lessonId: null,
          academicClassId: null,
          timeLimit: 30,
          passingScore: 50,
          attemptsAllowed: 1,
          quizType: QuizType.PRACTICE,
          showExplanation: true,
          random: 1,
        });

        // Tự động tải câu hỏi từ quiz mẫu
        setQuestions([]);
      }

      // Reset câu hỏi hiện tại
      setCurrentQuestion({
        questionText: "",
        questionType: QuestionType.MULTIPLE_CHOICE,
        points: 1,
        orderNumber: 1,
        options: [
          { optionText: "", isCorrect: false, orderNumber: 1 },
          { optionText: "", isCorrect: false, orderNumber: 2 },
        ],
      });
      setFileStats(null);
      setHasBackendResult(false);
      setEditingQuestionIndex(null);
    }
  }, [open, editMode, quizToEdit, initialLessonId]);

  // Xử lý thay đổi option trong câu hỏi hiện tại
  const handleOptionChange = (
    index: number,
    value: string,
    isCorrect: boolean
  ) => {
    const newOptions = currentQuestion.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index ? isCorrect : false,
    }));

    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions.map((opt, i) => ({
        ...opt,
        optionText: i === index ? value : opt.optionText,
      })),
    });
  };

  // Thêm option cho câu hỏi hiện tại
  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [
        ...currentQuestion.options,
        {
          optionText: "",
          isCorrect: false,
          orderNumber: currentQuestion.options.length + 1,
        },
      ],
    });
  };

  // Xóa option khỏi câu hỏi hiện tại
  const removeOption = (index: number) => {
    if (currentQuestion.options.length <= 2) {
      return; // Phải có ít nhất 2 options
    }

    const newOptions = [...currentQuestion.options];
    newOptions.splice(index, 1);

    // Nếu xoá đáp án đúng, reset correctAnswer về 0
    let newCorrectAnswer = currentQuestion.options.findIndex(
      (opt) => opt.isCorrect
    );
    if (index === newCorrectAnswer) {
      newCorrectAnswer = 0;
    } else if (index < newCorrectAnswer) {
      newCorrectAnswer--;
    }

    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  // Thêm câu hỏi vào quiz
  const addQuestion = () => {
    if (
      !currentQuestion.questionText.trim() ||
      currentQuestion.options.some((opt) => !opt.optionText.trim())
    ) {
      return; // Validate câu hỏi và options
    }

    if (editingQuestionIndex !== null) {
      // Cập nhật câu hỏi đang sửa
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = {
        ...currentQuestion,
        id: questions[editingQuestionIndex].id, // Giữ nguyên ID ban đầu
      };
      setQuestions(updatedQuestions);
    } else {
      // Thêm câu hỏi mới
      setQuestions([...questions, { ...currentQuestion, id: Date.now() }]);
    }

    // Reset câu hỏi hiện tại
    setCurrentQuestion({
      questionText: "",
      questionType: QuestionType.MULTIPLE_CHOICE,
      points: 1,
      orderNumber: questions.length + 1,
      options: [
        { optionText: "", isCorrect: false, orderNumber: 1 },
        { optionText: "", isCorrect: false, orderNumber: 2 },
      ],
    });
    setEditingQuestionIndex(null);
  };

  // Sửa câu hỏi
  const editQuestion = (index: number) => {
    setEditingQuestionIndex(index);
    setCurrentQuestion({ ...questions[index] });
  };

  // Xóa câu hỏi
  const deleteQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  // Sau handleEditQuestion, thêm hàm này:
  const handlePreviewQuestion = (questionId: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (question) {
      setCurrentQuestion(question);
      setEditingQuestionIndex(questions.findIndex((q) => q.id === questionId));

      // Add smooth scrolling after state update
      setTimeout(() => {
        editSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    // Validate form
    if (!quizForm.title.trim() || questions.length === 0) {
      return;
    }

    if (!quizForm.title.trim() || questions.length === 0) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    // Additional validation for academicClass and lesson
    if (
      additionalInfo?.targetType === "academic" &&
      !quizForm.academicClassId
    ) {
      toast.error("Vui lòng chọn lớp học");
      return;
    }

    if (!additionalInfo && !quizForm.lessonId) {
      toast.error("Vui lòng chọn nội dung");
      return;
    }

    // Chuẩn bị dữ liệu để submit
    const quizData: Quiz = {
      ...quizForm,
      questions: questions.map((q, index) => ({
        ...q,
        orderNumber: index + 1,
        options: q.options.map((opt, optIndex) => ({
          ...opt,
          orderNumber: optIndex + 1,
        })),
      })),
    };

    if (!editMode) {
      await dispatch(createQuiz(quizData));
      toast.success("Thêm Bài trắc nghiệm thành công!");

      if (academicClassStudents.length > 0) {
        const notificationData = {
          userIds: academicClassStudents.map((user) => user.userId),
          title: `Giảng viên "${currentUser.userInstructor.fullName}" vừa thêm trắc nghiệm mới`,
          content: `Giảng viên vừa thêm trắc nghiệm "${quizForm.title}".`,
          type: "quiz",
        };
        await dispatch(createNotification(notificationData));
      }
    } else if (editMode) {
      await dispatch(updateQuiz(quizData)).then((result) => {
        if (result?.error?.message == "Rejected") {
          toast.error(
            "Không thể sửa Bài trắc nghiệm vì đã có học sinh/sinh viên làm !"
          );
          return;
        }
        toast.success("Cập nhật Bài trắc nghiệm thành công!");
      });
    }

    if (id) {
      await dispatch(fetchCourseQuizzes(Number(id)));
      await dispatch(fetchCourseById(Number(id)));
      await dispatch(fetchQuizzesByCourse(Number(id)));
    }

    await dispatch(
      fetchQuizzesByInstructor(Number(currentUser.userInstructor.id))
    );
    await dispatch(
      fetchInstructorAttempts(Number(currentUser.userInstructor.id))
    );

    onClose();
  };

  // Add file upload handler in component
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);

      const parsedQuestions = await parseQuizDocument(file);

      // Update quiz form with initial values
      setQuizForm((prev) => ({
        ...prev,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
        description: prev.description || "",
        timeLimit: quizForm.timeLimit || 30,
        passingScore: quizForm.passingScore || 50,
        attemptsAllowed: quizForm.attemptsAllowed || 1,
        quizType: quizForm.quizType || QuizType.PRACTICE,
        showExplanation: quizForm.showExplanation || true,
        random: quizForm.random,
      }));

      // Add parsed questions with proper type casting
      const questionsArray = Array.isArray(parsedQuestions)
        ? parsedQuestions
        : parsedQuestions.questions;

      const now = Date.now();
      const transformedQuestions = questionsArray.map(
        (q: any, index: number) => ({
          id: `${now}_${index}`,
          quizId: `${now}`,
          questionText: q.question,
          questionType: QuestionType.MULTIPLE_CHOICE,
          points: 1,
          orderNumber: index + 1,
          correctExplanation: q.explanation,
          options: q.options.map((opt: string, optIndex: number) => ({
            id: `${now}_${index}_${optIndex}`,
            questionId: `${now}_${index}`,
            optionText: opt,
            isCorrect: opt === q.correctAnswer,
            orderNumber: optIndex + 1,
          })),
        })
      );

      setQuestions((prevQuestions) => [
        ...prevQuestions,
        ...transformedQuestions,
      ]);

      toast.success(`Đã nhập ${transformedQuestions.length} câu hỏi từ tệp`);
    } catch (error) {
      console.error("Error importing questions:", error);
      toast.error("Không thể đọc tệp. Vui lòng kiểm tra định dạng tệp.");
    } finally {
      setIsLoading(false);
    }
  };

  // Sửa đổi phần FormControlLabel cho Switch showExplanation
  const handleShowExplanationChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = event.target.checked;

    // Cập nhật state local trước
    setQuizForm({
      ...quizForm,
      showExplanation: newValue,
    });

    // Nếu đang ở chế độ edit, gọi API cập nhật
    if (editMode && quizToEdit?.id) {
      try {
        // Sửa lại cách gọi dispatch
        await dispatch(
          updateShowExplanation({
            quizId: quizToEdit.id,
            showExplanation: newValue ? 1 : 0,
          })
        ).unwrap();

        // Refresh data sau khi cập nhật thành công
        if (id) {
          await dispatch(fetchCourseQuizzes(Number(id)));
          await dispatch(fetchCourseById(Number(id)));
          await dispatch(fetchQuizzesByCourse(Number(id)));
        }
        await dispatch(
          fetchQuizzesByInstructor(Number(currentUser.userInstructor.id))
        );

        onClose();
      } catch (error) {
        // Nếu có lỗi, revert lại state local
        setQuizForm({
          ...quizForm,
          showExplanation: !newValue,
        });
        console.error("Failed to update show explanation:", error);
      }
    }
  };

  // Add handler for automatic quiz generation
  const handleFileStats = async (file: File) => {
    // Đọc file dưới dạng text
    const text = await file.text();
    // Đếm ký tự không trắng
    const contentLength = text.replace(/\s/g, "").length;
    const maxQuestions = Math.max(1, Math.floor(contentLength / 300));
    setFileStats({ contentLength, maxQuestions });
  };

  const handleGenerateQuizFromFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state khi bắt đầu upload file mới
    setHasBackendResult(false);

    // Dự đoán ban đầu
    await handleFileStats(file);

    try {
      setIsGeneratingQuiz(true);
      const result = await dispatch(
        generateQuizFromFile({
          file,
          numQuestions,
          lessonId: quizForm.lessonId || 0,
        })
      ).unwrap();

      if (result.questions) {
        // Đánh dấu đã có kết quả từ backend
        setHasBackendResult(true);

        const questionsArray = Array.isArray(result.questions)
          ? result.questions
          : result.questions.questions;

        // Hiển thị cảnh báo nếu có warning từ backend hoặc số lượng ít hơn yêu cầu
        if (result.warning) {
          toast.warn(result.warning);
        } else if (questionsArray.length < numQuestions) {
          toast.warn(
            `Chỉ tạo được ${questionsArray.length} câu hỏi do nội dung file hoặc dữ liệu AI trả về không đủ.`
          );
        }

        // Cập nhật lại dự đoán nếu backend trả về
        if (result.questions?.maxQuestions && result.questions?.contentLength) {
          setFileStats({
            contentLength: result.questions.contentLength,
            maxQuestions: result.questions.maxQuestions,
          });
        }

        const now = Date.now();
        const transformedQuestions = questionsArray.map(
          (q: any, index: number) => ({
            id: `${now}_${index}`,
            quizId: `${now}`,
            questionText: q.question,
            questionType: QuestionType.MULTIPLE_CHOICE,
            points: 1,
            orderNumber: index + 1,
            correctExplanation: q.explanation,
            options: q.options.map((opt: string, optIndex: number) => ({
              id: `${now}_${index}_${optIndex}`,
              questionId: `${now}_${index}`,
              optionText: opt,
              isCorrect: opt === q.correctAnswer,
              orderNumber: optIndex + 1,
            })),
          })
        );

        // Update quiz form with generated questions
        setQuestions((prevQuestions) => [
          ...prevQuestions,
          ...transformedQuestions,
        ]);

        // Update quiz title if empty
        if (!quizForm.title) {
          setQuizForm((prev) => ({
            ...prev,
            title: file.name.replace(/\.[^/.]+$/, ""),
          }));
        }

        toast.success(`Đã tạo ${transformedQuestions.length} câu hỏi từ file`);
      }
    } catch (error: any) {
      toast.error(error.message || "Không thể tạo bài trắc nghiệm từ file");
    } finally {
      setIsGeneratingQuiz(false);
      event.target.value = "";
    }
  };

  // Add cleanup effect
  useEffect(() => {
    return () => {
      dispatch(resetGeneratedQuiz());
    };
  }, [dispatch]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            {editMode
              ? "Chỉnh sửa bài trắc nghiệm"
              : "Thêm Bài trắc nghiệm mới"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {/* Hiển thị thông tin bổ sung khi tạo bài tập cho sinh viên trường */}
        {additionalInfo && additionalInfo.targetType === "academic" && (
          <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Bài trắc nghiệm dành cho sinh viên trường
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Bài trắc nghiệm này sẽ được gán cho tất cả sinh viên thuộc lớp đã
              chọn.
            </Typography>
          </Box>
        )}

        {/* Chọn lớp học thuật */}
        {additionalInfo && additionalInfo.targetType === "academic" && (
          <FormControl
            sx={{ mb: 3 }}
            fullWidth
            required
            error={!quizForm.academicClassId}
          >
            <InputLabel>Chọn lớp học thuật</InputLabel>
            <Select
              value={quizForm.academicClassId || ""}
              label="Chọn lớp học thuật *"
              onChange={(e) =>
                setQuizForm({
                  ...quizForm,
                  academicClassId: Number(e.target.value),
                })
              }
            >
              <MenuItem value="">
                <em>Chọn lớp học</em>
              </MenuItem>
              {currentClassInstructor?.map((classInstructor) => (
                <MenuItem
                  key={classInstructor.academicClass.id}
                  value={classInstructor.academicClass.id}
                >
                  {classInstructor.academicClass.classCode} -{" "}
                  {classInstructor.academicClass.className}
                </MenuItem>
              ))}
            </Select>
            {!quizForm.academicClassId && (
              <FormHelperText error>Vui lòng chọn lớp học</FormHelperText>
            )}
          </FormControl>
        )}

        <Stack spacing={3}>
          {/* Thông tin cơ bản */}
          <TextField
            label="Tiêu đề Bài trắc nghiệm"
            fullWidth
            value={quizForm.title}
            onChange={(e) =>
              setQuizForm({ ...quizForm, title: e.target.value })
            }
            required
          />
          <TextField
            label="Mô tả"
            fullWidth
            multiline
            rows={3}
            value={quizForm.description}
            onChange={(e) =>
              setQuizForm({ ...quizForm, description: e.target.value })
            }
          />
          {lessonData.length > 0 && !additionalInfo && (
            <FormControl fullWidth required error={!quizForm.lessonId}>
              <InputLabel>Nội dung</InputLabel>
              <Select
                value={quizForm.lessonId || ""}
                label="Nội dung *"
                onChange={(e) =>
                  setQuizForm({
                    ...quizForm,
                    lessonId: Number(e.target.value) || null,
                  })
                }
              >
                <MenuItem value="">
                  <em>Chọn nội dung</em>
                </MenuItem>
                {lessonData.map((lesson) => {
                  const hasQuiz = quizzesData.some(
                    (quiz) => quiz.lessonId === lesson.id
                  );
                  return (
                    <MenuItem
                      key={lesson.id}
                      value={lesson.id}
                      disabled={hasQuiz}
                      sx={{
                        ...(hasQuiz && {
                          color: "primary.main",
                          "& .quiz-indicator": {
                            ml: 1,
                            color: "warning.main",
                            fontSize: "0.75rem",
                          },
                        }),
                      }}
                    >
                      {lesson.title}
                      {hasQuiz && (
                        <Typography component="span" className="quiz-indicator">
                          &nbsp; (đã có Bài trắc nghiệm)
                        </Typography>
                      )}
                    </MenuItem>
                  );
                })}
              </Select>
              {!quizForm.lessonId && (
                <FormHelperText error>Vui lòng chọn nội dung</FormHelperText>
              )}
            </FormControl>
          )}
          {/* Cài đặt quiz */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Loại Bài trắc nghiệm</InputLabel>
              <Select
                value={quizForm.quizType}
                label="Loại Bài trắc nghiệm"
                onChange={(e) =>
                  setQuizForm({
                    ...quizForm,
                    quizType: e.target.value as QuizType,
                  })
                }
              >
                <MenuItem value={QuizType.PRACTICE}>Luyện tập</MenuItem>
                <MenuItem value={QuizType.HOMEWORK}>Bài tập về nhà</MenuItem>
                <MenuItem value={QuizType.MIDTERM}>Thi giữa kỳ</MenuItem>
                <MenuItem value={QuizType.FINAL}>Thi cuối kỳ</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Số lần làm tối đa"
              type="number"
              value={quizForm.attemptsAllowed}
              onChange={(e) =>
                setQuizForm({
                  ...quizForm,
                  attemptsAllowed: parseInt(e.target.value) || 1,
                })
              }
              InputProps={{ inputProps: { min: 1 } }}
            />

            <TextField
              label="Điểm đạt (%)"
              type="number"
              value={quizForm.passingScore}
              onChange={(e) =>
                setQuizForm({
                  ...quizForm,
                  passingScore: parseInt(e.target.value) || 0,
                })
              }
              InputProps={{ inputProps: { min: 0, max: 100 } }}
            />

            <TextField
              label="Thời gian làm bài (phút)"
              type="number"
              value={quizForm.timeLimit}
              onChange={(e) =>
                setQuizForm({
                  ...quizForm,
                  timeLimit: parseInt(e.target.value) || 0,
                })
              }
              InputProps={{ inputProps: { min: 0 } }}
              helperText="0 = không giới hạn thời gian"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={quizForm.showExplanation}
                  onChange={handleShowExplanationChange}
                  disabled={showExplanationStatus === "loading"}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  Hiện giải thích sau khi nộp bài
                  {showExplanationStatus === "loading" && (
                    <Typography
                      variant="caption"
                      sx={{ ml: 1, color: "text.secondary" }}
                    >
                      (Đang cập nhật...)
                    </Typography>
                  )}
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={quizForm.random === 1}
                  onChange={(e) => {
                    const newValue = e.target.checked ? 1 : 0;
                    setQuizForm((prev) => ({
                      ...prev,
                      random: newValue,
                    }));
                  }}
                />
              }
              label="Hiển thị câu hỏi ngẫu nhiên"
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          {/* Hiển thị danh sách câu hỏi đã thêm */}
          <Box>
            {/* Add new section for automatic quiz generation */}
            <Box
              sx={{
                p: 3,
                border: "1px dashed",
                borderColor: "primary.main",
                borderRadius: 2,
                bgcolor: "background.paper",
                position: "relative",
                overflow: "hidden",
                mb: 2,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                },
              }}
            >
              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AutoAwesome sx={{ color: "primary.main", fontSize: 28 }} />
                  <Typography variant="h6" color="primary">
                    Tạo bài trắc nghiệm tự động
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <InfoOutlined sx={{ color: "info.main", mt: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Tải lên file PDF, DOCX hoặc TXT chứa nội dung bài học. Hệ
                    thống sẽ sử dụng AI để phân tích và tạo các câu hỏi trắc
                    nghiệm phù hợp với nội dung.
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  <LightbulbOutlined sx={{ color: "warning.main", mt: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Để có kết quả tốt nhất, hãy sử dụng tài liệu có nội dung rõ
                    ràng, cấu trúc tốt và ngôn ngữ chính xác.
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    label="Số lượng câu hỏi"
                    type="number"
                    value={numQuestions}
                    onChange={(e) =>
                      setNumQuestions(
                        Math.max(1, Math.min(50, parseInt(e.target.value) || 5))
                      )
                    }
                    InputProps={{
                      inputProps: { min: 1, max: 50 },
                      endAdornment: (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1, width: "45px" }}
                        >
                          (1-50)
                        </Typography>
                      ),
                    }}
                    sx={{
                      width: 200,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                    size="small"
                  />

                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUpload />}
                    disabled={isGeneratingQuiz || !quizForm.lessonId}
                    sx={{
                      flex: 1,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: "1rem",
                      boxShadow: 2,
                      "&:hover": {
                        boxShadow: 4,
                      },
                    }}
                  >
                    {isGeneratingQuiz ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CircularProgress size={20} color="inherit" />
                        Đang tạo câu hỏi...
                      </Box>
                    ) : (
                      "Tải file lên"
                    )}
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.docx,.txt"
                      onChange={handleGenerateQuizFromFile}
                      disabled={isGeneratingQuiz}
                    />
                  </Button>
                </Stack>

                {!quizForm.lessonId && (
                  <Alert
                    severity="warning"
                    sx={{
                      mt: 1,
                      borderRadius: 2,
                      "& .MuiAlert-icon": {
                        alignItems: "center",
                      },
                    }}
                  >
                    Vui lòng chọn nội dung bài học trước khi tạo câu hỏi tự động
                  </Alert>
                )}

                {isGeneratingQuiz && (
                  <Alert
                    severity="info"
                    sx={{
                      mt: 1,
                      borderRadius: 2,
                      "& .MuiAlert-icon": {
                        alignItems: "center",
                      },
                    }}
                  >
                    Đang phân tích nội dung và tạo câu hỏi. Vui lòng đợi trong
                    giây lát...
                  </Alert>
                )}

                {fileStats && (
                  <Alert
                    severity="info"
                    sx={{ mt: 2, borderRadius: 2, alignItems: "center" }}
                    icon={false}
                  >
                    <Typography variant="body2">
                      <strong>Nội dung file:</strong> {fileStats.contentLength}{" "}
                      ký tự (không tính khoảng trắng).
                      <br />
                      {hasBackendResult ? (
                        // Nếu đã có kết quả từ backend
                        <>
                          <strong>Đã tạo được:</strong> {fileStats.maxQuestions}{" "}
                          câu hỏi chất lượng.
                        </>
                      ) : (
                        // Nếu mới upload file, chưa có kết quả từ backend
                        <>
                          <strong>Dự đoán có thể tạo tối đa:</strong>{" "}
                          {fileStats.maxQuestions} câu hỏi chất lượng.
                        </>
                      )}
                    </Typography>
                  </Alert>
                )}
              </Stack>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Câu hỏi ({questions.length})</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => {
                    setCurrentQuestion({
                      questionText: "",
                      questionType: QuestionType.MULTIPLE_CHOICE,
                      points: 1,
                      orderNumber: questions.length + 1,
                      options: [
                        { optionText: "", isCorrect: false, orderNumber: 1 },
                        { optionText: "", isCorrect: false, orderNumber: 2 },
                      ],
                    });
                    setEditingQuestionIndex(null);
                  }}
                >
                  Thêm câu hỏi
                </Button>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  disabled={isLoading}
                >
                  Nhập từ tệp
                  <input
                    type="file"
                    hidden
                    accept=".docx,.pdf"
                    onChange={handleFileUpload}
                  />
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const blob = await generateDocxFromTemplate();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "mau-cau-hoi-quiz.docx"; // Changed extension to .docx
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error("Error generating template:", error);
                      toast.error("Có lỗi khi tạo file mẫu");
                    }
                  }}
                  size="small"
                  startIcon={<Download />}
                >
                  Tải mẫu định dạng
                </Button>
              </Stack>
            </Box>

            {questions.length > 0 ? (
              <List
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  maxHeight: "800px",
                  overflow: "auto",
                }}
              >
                {questions.map((question, index) => (
                  <ListItem
                    key={question.id}
                    divider={index < questions.length - 1}
                    sx={{
                      p: 0,
                      bgcolor:
                        editingQuestionIndex === index
                          ? "action.selected"
                          : "inherit",
                    }}
                  >
                    <Accordion sx={{ width: "100%", boxShadow: "none" }}>
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{ px: 2 }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <DragIndicator
                            sx={{ color: "text.disabled", mr: 1 }}
                          />
                          <Badge
                            badgeContent={index + 1}
                            color="primary"
                            sx={{ mr: 2 }}
                          >
                            <Box sx={{ width: 24, height: 24 }} />
                          </Badge>
                          <Typography
                            sx={{
                              width: "100%",
                            }}
                          >
                            {question.questionText}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mr: 2 }}
                          >
                            {question.points} điểm
                          </Typography>
                          <Box>
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviewQuestion(question.id);
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteQuestion(index);
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                        <List dense>
                          {question?.options?.map((option, optIndex) => (
                            <ListItem key={optIndex} sx={{ pl: 6 }}>
                              <FormControlLabel
                                value={optIndex}
                                control={
                                  <Radio
                                    checked={option.isCorrect}
                                    size="small"
                                    readOnly
                                  />
                                }
                                label={option.optionText}
                              />
                              {option.isCorrect && (
                                <CheckCircle
                                  fontSize="small"
                                  color="success"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </ListItem>
                          ))}
                        </List>
                        {question.correctExplanation && (
                          <Box sx={{ pl: 6, mt: 1 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              <strong>Giải thích:</strong>{" "}
                              {question.correctExplanation}
                            </Typography>
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box
                sx={{
                  p: 3,
                  textAlign: "center",
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Typography color="text.secondary">
                  Chưa có câu hỏi nào. Hãy thêm câu hỏi cho Bài trắc nghiệm.
                </Typography>
              </Box>
            )}
          </Box>
          <Divider ref={editSectionRef}>
            <Typography variant="caption" color="text.secondary">
              {editingQuestionIndex !== null
                ? "Chỉnh sửa câu hỏi"
                : "Thêm câu hỏi mới"}
            </Typography>
          </Divider>
          {/* Form thêm/sửa câu hỏi */}
          <Box
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <Stack spacing={2}>
              <TextField
                label="Câu hỏi"
                fullWidth
                value={currentQuestion.questionText}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    questionText: e.target.value,
                  })
                }
                required
              />

              <TextField
                label="Giải thích đáp án"
                fullWidth
                value={currentQuestion.correctExplanation || ""}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    correctExplanation: e.target.value,
                  })
                }
                helperText="Giải thích sẽ hiển thị sau khi học viên trả lời câu hỏi"
              />

              <TextField
                label="Điểm"
                type="number"
                value={currentQuestion.points || 1}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    points: parseInt(e.target.value) || 1,
                  })
                }
                InputProps={{ inputProps: { min: 1 } }}
              />

              <Typography variant="subtitle2">Các lựa chọn:</Typography>

              <RadioGroup
                value={currentQuestion.options.findIndex(
                  (opt) => opt.isCorrect
                )}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    options: currentQuestion.options.map((opt, i) => ({
                      ...opt,
                      isCorrect: i === parseInt(e.target.value),
                    })),
                  })
                }
              >
                {currentQuestion.options.map((option, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <FormControlLabel
                      value={index}
                      control={<Radio />}
                      label=""
                      sx={{ mr: 0 }}
                    />
                    <TextField
                      label={`Lựa chọn ${index + 1}`}
                      value={option.optionText}
                      onChange={(e) =>
                        handleOptionChange(
                          index,
                          e.target.value,
                          option.isCorrect
                        )
                      }
                      fullWidth
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeOption(index)}
                      disabled={currentQuestion.options.length <= 2}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
              </RadioGroup>

              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addOption}
                sx={{ alignSelf: "flex-start" }}
              >
                Thêm lựa chọn
              </Button>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                {editingQuestionIndex !== null && (
                  <Button
                    onClick={() => {
                      setEditingQuestionIndex(null);
                      setCurrentQuestion({
                        questionText: "",
                        questionType: QuestionType.MULTIPLE_CHOICE,
                        points: 1,
                        orderNumber: questions.length + 1,
                        options: [
                          { optionText: "", isCorrect: false, orderNumber: 1 },
                          { optionText: "", isCorrect: false, orderNumber: 2 },
                        ],
                      });
                    }}
                    sx={{ mr: 1 }}
                  >
                    Hủy sửa
                  </Button>
                )}
                <Button
                  variant="contained"
                  onClick={addQuestion}
                  disabled={
                    !currentQuestion.questionText.trim() ||
                    currentQuestion.options.some(
                      (opt) => !opt.optionText.trim()
                    )
                  }
                >
                  {editingQuestionIndex !== null
                    ? "Cập nhật câu hỏi"
                    : "Thêm câu hỏi"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!quizForm.title || questions.length === 0}
        >
          {editMode ? "Cập nhật Bài trắc nghiệm" : "Thêm Bài trắc nghiệm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAddEditQuiz;
