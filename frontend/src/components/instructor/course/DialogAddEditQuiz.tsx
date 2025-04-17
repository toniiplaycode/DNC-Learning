import React, { useState, useEffect } from "react";
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
} from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { parseQuizDocument } from "../../../utils/quizParser";
import { toast } from "react-toastify";
import { generateDocxFromTemplate } from "../../../utils/browserDocGenerator";
import { fetchCourseQuizzes } from "../../../features/course-lessons/courseLessonsApiSlice";
import { selectAllQuizzes } from "../../../features/course-lessons/courseLessonsSelector";
import { createQuiz } from "../../../features/quizzes/quizzesSlice";
import { fetchCourseById } from "../../../features/courses/coursesApiSlice";

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
  lessonId?: number | null; // Changed to allow null
  academicClassId?: number;
  title: string;
  description?: string;
  timeLimit?: number;
  passingScore?: number;
  attemptsAllowed: number;
  quizType: QuizType;
  showExplanation: boolean;
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
  onSubmit: (quizData: any) => void;
  initialLessonId?: number;
  quizToEdit?: Quiz;
  editMode: boolean;
  additionalInfo?: {
    targetType: string;
    className: string;
    faculty: string;
  };
}

const DialogAddEditQuiz: React.FC<DialogAddEditQuizProps> = ({
  open,
  onClose,
  onSubmit,
  initialLessonId,
  quizToEdit,
  editMode,
  additionalInfo,
}) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const lessonData = useAppSelector(selectAllQuizzes);

  // State cho form quiz
  const [quizForm, setQuizForm] = useState<Quiz>({
    title: "",
    description: "",
    lessonId: null,
    timeLimit: 30,
    passingScore: 50,
    attemptsAllowed: 1,
    quizType: QuizType.PRACTICE,
    showExplanation: true,
  });

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
          timeLimit: 30,
          passingScore: 50,
          attemptsAllowed: 1,
          quizType: QuizType.PRACTICE,
          showExplanation: true,
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
    }
  };

  // Xử lý submit form
  const handleSubmit = async () => {
    // Validate form
    if (!quizForm.title.trim() || questions.length === 0) {
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

    await dispatch(createQuiz(quizData));
    await dispatch(fetchCourseQuizzes(Number(id)));
    await dispatch(fetchCourseById(Number(id)));

    toast.success(
      editMode
        ? "Cập nhật bài kiểm tra thành công!"
        : "Thêm bài kiểm tra thành công!"
    );

    console.log("Quiz data to submit:", quizData);

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
      }));

      // Add parsed questions with proper type casting
      setQuestions((prevQuestions) => [
        ...prevQuestions,
        ...parsedQuestions.map(
          (q, index) =>
            ({
              ...q,
              orderNumber: prevQuestions.length + index + 1,
              options: q.options || [], // Ensure options is never undefined
              id: q.id || Date.now() + Math.random(),
              quizId: q.quizId || Date.now(),
              questionType: q.questionType || QuestionType.MULTIPLE_CHOICE,
              points: q.points || 1,
              correctExplanation: q.correctExplanation || "",
              createdAt: q.createdAt || new Date().toISOString(),
              updatedAt: q.updatedAt || new Date().toISOString(),
            } as QuizQuestion)
        ),
      ]);

      toast.success(`Đã nhập ${parsedQuestions.length} câu hỏi từ tệp`);
    } catch (error) {
      console.error("Error importing questions:", error);
      toast.error("Không thể đọc tệp. Vui lòng kiểm tra định dạng tệp.");
    } finally {
      setIsLoading(false);
    }
  };

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
            {editMode ? "Chỉnh sửa bài kiểm tra" : "Thêm bài kiểm tra mới"}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {/* Hiển thị thông tin bổ sung khi tạo bài tập cho sinh viên trường */}
        {additionalInfo && additionalInfo.targetType === "academic" && (
          <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Bài kiểm tra dành cho sinh viên trường
            </Typography>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2">
                <strong>Lớp:</strong> {additionalInfo.className}
              </Typography>
              <Typography variant="body2">
                <strong>Khoa:</strong> {additionalInfo.faculty}
              </Typography>
            </Stack>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: "block" }}
            >
              Bài kiểm tra này sẽ được gán cho tất cả sinh viên thuộc lớp và
              khoa đã chọn.
            </Typography>
          </Box>
        )}

        <Stack spacing={3}>
          {/* Thông tin cơ bản */}
          <TextField
            label="Tiêu đề bài kiểm tra"
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
          {lessonData.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>Nội dung</InputLabel>
              <Select
                value={quizForm.lessonId || 0}
                label="Nội dung"
                onChange={(e) =>
                  setQuizForm({
                    ...quizForm,
                    lessonId: Number(e.target.value) || null,
                  })
                }
              >
                <MenuItem value={0}>Không thuộc nội dung nào</MenuItem>
                {lessonData.map((lesson) => (
                  <MenuItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Nếu bài kiểm tra không thuộc nội dung cụ thể, chọn "Không thuộc
                nội dung nào"
              </FormHelperText>
            </FormControl>
          )}

          {/* Cài đặt quiz */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Loại bài kiểm tra</InputLabel>
              <Select
                value={quizForm.quizType}
                label="Loại bài kiểm tra"
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
                  onChange={(e) =>
                    setQuizForm({
                      ...quizForm,
                      showExplanation: e.target.checked,
                    })
                  }
                />
              }
              label="Hiện giải thích sau khi nộp bài"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Hiển thị danh sách câu hỏi đã thêm */}
          <Box>
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
                  maxHeight: "500px",
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
                          {question.options.map((option, optIndex) => (
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
                  Chưa có câu hỏi nào. Hãy thêm câu hỏi cho bài kiểm tra.
                </Typography>
              </Box>
            )}
          </Box>

          <Divider>
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
          {editMode ? "Cập nhật bài kiểm tra" : "Thêm bài kiểm tra"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogAddEditQuiz;
