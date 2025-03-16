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
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { Close, Add, Delete } from "@mui/icons-material";

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
}

const DialogAddEditQuiz: React.FC<DialogAddEditQuizProps> = ({
  open,
  onClose,
  onSubmit,
  initialSectionId,
  quizToEdit,
  sections,
  editMode,
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

  // Cập nhật form khi mở modal và có dữ liệu ban đầu
  useEffect(() => {
    if (open) {
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

        setQuizForm({
          title: quizToEdit.title || "",
          description: quizToEdit.description || "",
          sectionId: sectionId,
          maxAttempts: quizToEdit.maxAttempts || 3,
          passingScore: quizToEdit.passingScore || 70,
          timeLimit: quizToEdit.timeLimit || 30,
        });

        // Load câu hỏi nếu có
        if (quizToEdit.questions && quizToEdit.questions.length > 0) {
          setQuestions([...quizToEdit.questions]);
        } else {
          setQuestions([]);
        }
      } else {
        // Khi thêm mới
        setQuizForm({
          title: "",
          description: "",
          sectionId: initialSectionId || 0,
          maxAttempts: 3,
          passingScore: 70,
          timeLimit: 30,
        });
        setQuestions([]);
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

          {/* Danh sách câu hỏi */}
          <Typography variant="h6">Câu hỏi ({questions.length})</Typography>

          {questions.length > 0 && (
            <List sx={{ bgcolor: "background.paper", borderRadius: 1 }}>
              {questions.map((q, index) => (
                <ListItem
                  key={q.id}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="subtitle1">
                      Câu {index + 1}: {q.question}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => editQuestion(index)}
                      >
                        <Add />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteQuestion(index)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                  <List sx={{ width: "100%" }}>
                    {q.options.map((option, optIndex) => (
                      <ListItem key={optIndex} sx={{ pl: 2 }}>
                        {optIndex === q.correctAnswer ? (
                          <Radio checked readOnly />
                        ) : (
                          <Radio disabled />
                        )}
                        <Typography>{option}</Typography>
                      </ListItem>
                    ))}
                  </List>
                  {q.explanation && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ pl: 2, mt: 1 }}
                    >
                      <strong>Giải thích:</strong> {q.explanation}
                    </Typography>
                  )}
                </ListItem>
              ))}
            </List>
          )}

          {/* Form thêm/sửa câu hỏi */}
          <Box
            sx={{
              bgcolor: "background.paper",
              p: 2,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle1" gutterBottom>
              {editingQuestionIndex !== null
                ? `Đang sửa câu hỏi ${editingQuestionIndex + 1}`
                : "Thêm câu hỏi mới"}
            </Typography>

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
