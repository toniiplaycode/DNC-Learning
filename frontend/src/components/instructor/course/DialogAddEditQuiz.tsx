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
} from "@mui/material";
import {
  Close,
  Add,
  Delete,
  Edit,
  ExpandMore,
  CheckCircle,
  DragIndicator,
} from "@mui/icons-material";

// Định nghĩa kiểu QuizItem
interface QuizItem {
  id: number;
  title: string;
  description: string;
  maxAttempts?: number;
  passingScore?: number;
  timeLimit?: number;
  questions?: QuizQuestion[];
  sectionId?: number;
}

// Định nghĩa kiểu QuizQuestion
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points?: number;
}

// Định nghĩa props cho component
interface DialogAddEditQuizProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (quizData: any) => void;
  initialSectionId?: number;
  quizToEdit?: QuizItem;
  sections: any[];
  editMode: boolean;
  additionalInfo?: {
    targetType: string;
    className: string;
    faculty: string;
  };
}

// Mock data cho quiz
const mockQuizData: QuizItem[] = [
  {
    id: 1,
    title: "Kiểm tra kiến thức React cơ bản",
    description: "Bài kiểm tra đánh giá kiến thức về React hooks và lifecycle",
    maxAttempts: 2,
    passingScore: 70,
    timeLimit: 30,
    sectionId: 1,
    questions: [
      {
        id: 1,
        question: "useState hook được sử dụng để làm gì?",
        options: [
          "Quản lý side effects",
          "Quản lý state trong functional component",
          "Tối ưu performance",
          "Xử lý routing",
        ],
        correctAnswer: 1,
        explanation:
          "useState là hook cơ bản để quản lý state trong functional component.",
        points: 10,
      },
      {
        id: 2,
        question: "useEffect hook được gọi khi nào?",
        options: [
          "Chỉ khi component mount",
          "Sau mỗi lần render",
          "Khi dependencies thay đổi",
          "Tất cả các trường hợp trên",
        ],
        correctAnswer: 3,
        explanation:
          "useEffect có thể được gọi trong cả 3 trường hợp tùy vào cách sử dụng dependencies.",
        points: 10,
      },
      {
        id: 3,
        question: "useMemo hook dùng để làm gì?",
        options: [
          "Tối ưu performance bằng cách cache giá trị",
          "Quản lý state",
          "Xử lý side effects",
          "Tạo ref",
        ],
        correctAnswer: 0,
        explanation:
          "useMemo giúp tối ưu performance bằng cách cache giá trị tính toán.",
        points: 10,
      },
    ],
  },
];

const DialogAddEditQuiz: React.FC<DialogAddEditQuizProps> = ({
  open,
  onClose,
  onSubmit,
  initialSectionId,
  quizToEdit,
  sections,
  editMode,
  additionalInfo,
}) => {
  // State cho form quiz
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    sectionId: 0,
    maxAttempts: 3,
    passingScore: 70,
    timeLimit: 30,
  });

  // State cho câu hỏi quiz
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    id: 0,
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    points: 1,
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);

  // Thêm state để lưu quiz mẫu được chọn
  const [selectedMockQuiz, setSelectedMockQuiz] = useState<number>(0);

  // Cập nhật useEffect để hiển thị mock data trong cả hai trường hợp
  useEffect(() => {
    if (open) {
      const sampleQuiz = mockQuizData[0]; // Quiz mẫu

      if (editMode && quizToEdit) {
        // Tìm section của quiz khi edit
        let sectionId = quizToEdit.sectionId || 0;

        // Nếu không có sectionId trong quizToEdit, tìm từ sections
        if (!sectionId) {
          for (const section of sections) {
            const quizIndex = section.contents?.findIndex(
              (c: any) => c.id === quizToEdit.id && c.type === "quiz"
            );
            if (quizIndex !== -1) {
              sectionId = section.id;
              break;
            }
          }
        }

        // Cập nhật form với dữ liệu của quiz đang edit
        setQuizForm({
          title: quizToEdit.title || "",
          description: quizToEdit.description || "",
          sectionId: sectionId,
          maxAttempts: quizToEdit.maxAttempts || 3,
          passingScore: quizToEdit.passingScore || 70,
          timeLimit: quizToEdit.timeLimit || 30,
        });

        // Load câu hỏi từ quiz đang edit
        // Nếu không có câu hỏi, tự động tải từ quiz mẫu
        if (quizToEdit.questions && quizToEdit.questions.length > 0) {
          setQuestions([...quizToEdit.questions]);
        } else {
          setQuestions(sampleQuiz.questions || []);
        }
      } else {
        // Khi thêm mới, tự động tải quiz mẫu
        setQuizForm({
          title: sampleQuiz.title || "",
          description: sampleQuiz.description || "",
          sectionId: initialSectionId || 0,
          maxAttempts: sampleQuiz.maxAttempts || 3,
          passingScore: sampleQuiz.passingScore || 70,
          timeLimit: sampleQuiz.timeLimit || 30,
        });

        // Tự động tải câu hỏi từ quiz mẫu
        setQuestions(sampleQuiz.questions || []);
      }
    }
  }, [open, editMode, quizToEdit, initialSectionId, sections]);

  // Xử lý thay đổi option trong câu hỏi hiện tại
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  // Thêm option cho câu hỏi hiện tại
  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, ""],
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
    let newCorrectAnswer = currentQuestion.correctAnswer;
    if (index === currentQuestion.correctAnswer) {
      newCorrectAnswer = 0;
    } else if (index < currentQuestion.correctAnswer) {
      newCorrectAnswer--;
    }

    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
      correctAnswer: newCorrectAnswer,
    });
  };

  // Thêm câu hỏi vào quiz
  const addQuestion = () => {
    if (
      !currentQuestion.question.trim() ||
      currentQuestion.options.some((opt) => !opt.trim())
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
      id: Date.now(),
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      points: 1,
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

  // Áp dụng quiz mẫu được chọn vào form
  const applyMockQuiz = (quizId: number) => {
    const sampleQuiz = mockQuizData.find((q) => q.id === quizId);
    if (!sampleQuiz) return;

    setQuizForm({
      ...quizForm,
      title: sampleQuiz.title,
      description: sampleQuiz.description,
      maxAttempts: sampleQuiz.maxAttempts || 3,
      passingScore: sampleQuiz.passingScore || 70,
      timeLimit: sampleQuiz.timeLimit || 30,
    });

    setQuestions(sampleQuiz.questions || []);
  };

  // Xử lý submit form
  const handleSubmit = () => {
    // Validate form
    if (!quizForm.title.trim() || questions.length === 0) {
      return;
    }

    // Chuẩn bị dữ liệu để submit
    const quizData = {
      ...quizForm,
      questions: questions,
      id: editMode && quizToEdit ? quizToEdit.id : Date.now(),
      type: "quiz",
    };

    onSubmit(quizData);
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

          <FormControl fullWidth>
            <InputLabel>Phần học</InputLabel>
            <Select
              value={quizForm.sectionId}
              label="Phần học"
              onChange={(e) =>
                setQuizForm({ ...quizForm, sectionId: Number(e.target.value) })
              }
            >
              <MenuItem value={0}>Không thuộc phần học nào</MenuItem>
              {sections.map((section) => (
                <MenuItem key={section.id} value={section.id}>
                  {section.title}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Nếu bài kiểm tra không thuộc phần học cụ thể, chọn "Không thuộc
              phần học nào"
            </FormHelperText>
          </FormControl>

          {/* Cài đặt quiz */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Số lần làm tối đa"
              type="number"
              value={quizForm.maxAttempts}
              onChange={(e) =>
                setQuizForm({
                  ...quizForm,
                  maxAttempts: parseInt(e.target.value) || 1,
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
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => {
                  setCurrentQuestion({
                    id: Date.now(),
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: 0,
                    explanation: "",
                    points: 1,
                  });
                  setEditingQuestionIndex(null);
                }}
              >
                Thêm câu hỏi
              </Button>
            </Box>

            {questions.length > 0 ? (
              <List
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  maxHeight: "300px",
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
                              flexGrow: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {question.question}
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
                                    checked={
                                      optIndex === question.correctAnswer
                                    }
                                    size="small"
                                    readOnly
                                  />
                                }
                                label={option}
                              />
                              {optIndex === question.correctAnswer && (
                                <CheckCircle
                                  fontSize="small"
                                  color="success"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </ListItem>
                          ))}
                        </List>
                        {question.explanation && (
                          <Box sx={{ pl: 6, mt: 1 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              <strong>Giải thích:</strong>{" "}
                              {question.explanation}
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
                value={currentQuestion.question}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    question: e.target.value,
                  })
                }
                required
              />

              <TextField
                label="Giải thích đáp án"
                fullWidth
                value={currentQuestion.explanation || ""}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    explanation: e.target.value,
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
                value={currentQuestion.correctAnswer}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    correctAnswer: parseInt(e.target.value),
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
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
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
                        id: Date.now(),
                        question: "",
                        options: ["", "", "", ""],
                        correctAnswer: 0,
                        explanation: "",
                        points: 1,
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
                    !currentQuestion.question.trim() ||
                    currentQuestion.options.some((opt) => !opt.trim())
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
