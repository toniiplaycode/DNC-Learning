import React, { useState } from "react";
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Stack,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Quiz,
  Assignment,
  AccessTime,
  Edit,
  Delete,
  Visibility,
  QueryBuilder,
  CheckCircle,
  Info,
} from "@mui/icons-material";

interface QuizItem {
  id: number;
  title: string;
  description: string;
  duration: string | number;
  maxAttempts: number;
  passingScore: number;
  sectionId?: number;
  totalQuestions: number;
}

interface AssignmentItem {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  sectionId?: number;
  totalSubmissions?: number;
}

interface CourseQuizAssignmentProps {
  quizzes?: QuizItem[];
  assignments?: AssignmentItem[];
  onEditQuiz?: (quiz: QuizItem) => void;
  onDeleteQuiz?: (quizId: number) => void;
  onEditAssignment?: (assignment: AssignmentItem) => void;
  onDeleteAssignment?: (assignmentId: number) => void;
  isInstructor?: boolean;
}

const CourseQuizAssignment: React.FC<CourseQuizAssignmentProps> = ({
  quizzes = [],
  assignments = [],
  onEditQuiz,
  onDeleteQuiz,
  onEditAssignment,
  onDeleteAssignment,
  isInstructor = true,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: "",
    id: 0,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDeleteClick = (type: string, id: number) => {
    setDeleteDialog({
      open: true,
      type,
      id,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.type === "quiz" && onDeleteQuiz) {
      onDeleteQuiz(deleteDialog.id);
    } else if (deleteDialog.type === "assignment" && onDeleteAssignment) {
      onDeleteAssignment(deleteDialog.id);
    }
    setDeleteDialog({ open: false, type: "", id: 0 });
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Quiz />
                <span>Bài kiểm tra ({quizzes.length})</span>
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Assignment />
                <span>Bài tập ({assignments.length})</span>
              </Stack>
            }
          />
        </Tabs>
      </Box>

      {/* Quiz List */}
      <TabPanel value={tabValue} index={0}>
        {quizzes.length > 0 ? (
          <List>
            {quizzes.map((quiz) => (
              <Card key={quiz.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6">{quiz.title}</Typography>
                      {isInstructor && (
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            onClick={() => onEditQuiz && onEditQuiz(quiz)}
                            size="small"
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteClick("quiz", quiz.id)}
                            size="small"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      {quiz.description}
                    </Typography>

                    <Divider />

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      divider={
                        <Divider
                          orientation="vertical"
                          flexItem
                          sx={{ display: { xs: "none", sm: "block" } }}
                        />
                      }
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <QueryBuilder fontSize="small" color="action" />
                        <Typography variant="body2">
                          {typeof quiz.duration === "number"
                            ? `${quiz.duration} phút`
                            : quiz.duration}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Info fontSize="small" color="action" />
                        <Typography variant="body2">
                          {quiz.totalQuestions} câu hỏi
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircle fontSize="small" color="action" />
                        <Typography variant="body2">
                          Điểm đạt: {quiz.passingScore}%
                        </Typography>
                      </Stack>

                      <Chip
                        label={`Tối đa ${quiz.maxAttempts} lần làm bài`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">
              Chưa có bài kiểm tra nào
            </Typography>
          </Box>
        )}
      </TabPanel>

      {/* Assignment List */}
      <TabPanel value={tabValue} index={1}>
        {assignments.length > 0 ? (
          <List>
            {assignments.map((assignment) => (
              <Card key={assignment.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6">{assignment.title}</Typography>
                      {isInstructor && (
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            onClick={() =>
                              onEditAssignment && onEditAssignment(assignment)
                            }
                            size="small"
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() =>
                              handleDeleteClick("assignment", assignment.id)
                            }
                            size="small"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      {assignment.description}
                    </Typography>

                    <Divider />

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      divider={
                        <Divider
                          orientation="vertical"
                          flexItem
                          sx={{ display: { xs: "none", sm: "block" } }}
                        />
                      }
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2">
                          Hạn nộp: {assignment.dueDate}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircle fontSize="small" color="action" />
                        <Typography variant="body2">
                          Điểm tối đa: {assignment.maxScore}
                        </Typography>
                      </Stack>

                      {assignment.totalSubmissions !== undefined && (
                        <Chip
                          label={`${assignment.totalSubmissions} bài nộp`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">Chưa có bài tập nào</Typography>
          </Box>
        )}
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
      >
        <DialogTitle>
          Xác nhận xóa{" "}
          {deleteDialog.type === "quiz" ? "bài kiểm tra" : "bài tập"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa{" "}
            {deleteDialog.type === "quiz" ? "bài kiểm tra" : "bài tập"} này?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}
          >
            Hủy
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// TabPanel component
const TabPanel: React.FC<{
  children?: React.ReactNode;
  index: number;
  value: number;
}> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`assignment-quiz-tabpanel-${index}`}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

export default CourseQuizAssignment;
