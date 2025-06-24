import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Card,
  CardContent,
  List,
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
  QueryBuilder,
  CheckCircle,
  Info,
  Shuffle,
  HelpOutline,
  MenuBook,
  Assignment as AssignmentIcon,
  Schedule,
  EditNote,
  Grade,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectAllQuizzes } from "../../../features/quizzes/quizzesSelectors";
import {
  deleteQuiz,
  fetchQuizzesByCourse,
} from "../../../features/quizzes/quizzesSlice";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchCourseQuizzes } from "../../../features/course-lessons/courseLessonsApiSlice";
import { fetchCourseById } from "../../../features/courses/coursesApiSlice";
import {
  deleteAssignment,
  fetchAssignmentByCourse,
} from "../../../features/assignments/assignmentsSlice";
import { selectAssignmentsCourse } from "../../../features/assignments/assignmentsSelectors";
import { formatDateTime } from "../../../utils/formatters";
import EmptyState from "../../common/EmptyState";

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
  onEditQuiz?: (quiz: any) => void;
  onEditAssignment?: (assignment: AssignmentItem) => void;
  isInstructor?: boolean;
}

const CourseQuizAssignment: React.FC<CourseQuizAssignmentProps> = ({
  onEditQuiz,
  onEditAssignment,
  isInstructor = true,
}) => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const quizzesData = useAppSelector(selectAllQuizzes);
  const assignmentsData = useAppSelector(selectAssignmentsCourse);
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: "",
    id: 0,
  });

  console.log(assignmentsData);

  useEffect(() => {
    dispatch(fetchQuizzesByCourse(Number(id)));
    dispatch(fetchAssignmentByCourse(Number(id)));
  }, [dispatch, id]);

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

  const handleConfirmDelete = async () => {
    if (deleteDialog.type === "quiz") {
      await dispatch(deleteQuiz(deleteDialog.id)).then((result) => {
        if (result?.payload?.error == "Rejected") {
          toast.error(
            "Không thể xóa bài trắc nghiệm vì đã có học sinh/sinh viên làm !"
          );
          return;
        }
        toast.success("Xóa bài trắc nghiệm thành công!");
      });

      await dispatch(fetchCourseQuizzes(Number(id)));
      await dispatch(fetchQuizzesByCourse(Number(id)));
    } else if (deleteDialog.type === "assignment") {
      await dispatch(deleteAssignment(deleteDialog.id)).then((result) => {
        if (result?.error?.message == "Rejected") {
          toast.error(
            "Không thể xóa bài tập vì đã có học sinh/sinh viên làm !"
          );
          return;
        }
        toast.success("Xóa bài tập thành công!");
      });
      await dispatch(fetchAssignmentByCourse(Number(id)));
    }

    await dispatch(fetchCourseById(Number(id)));
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
                <span>Bài trắc nghiệm ({quizzesData.length})</span>
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Assignment />
                <span>Bài tập ({assignmentsData.length})</span>
              </Stack>
            }
          />
        </Tabs>
      </Box>

      {/* Quiz List */}
      <TabPanel value={tabValue} index={0}>
        {quizzesData.length > 0 ? (
          <List>
            {quizzesData.map((quiz) => (
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
                            color={
                              quiz?.attempts?.length == 0
                                ? "primary"
                                : "default"
                            }
                            disabled={quiz?.attempts?.length > 0}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteClick("quiz", quiz.id)}
                            size="small"
                            color={
                              quiz?.attempts?.length == 0 ? "error" : "default"
                            }
                            disabled={quiz?.attempts?.length > 0}
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="body2" color="text.secondary">
                        {quiz.description}
                      </Typography>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="body2"
                          color="primary"
                          fontWeight={600}
                        >
                          Đã có {quiz?.attempts?.length} lần làm bài
                        </Typography>
                      </Stack>
                    </Stack>

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
                        <QueryBuilder fontSize="small" color="primary" />
                        <Typography variant="body2">
                          {quiz.timeLimit} phút
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Info fontSize="small" color="info" />
                        <Typography variant="body2">
                          {quiz?.questions?.length} câu hỏi
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircle fontSize="small" color="success" />
                        <Typography variant="body2">
                          Điểm đạt: {quiz.passingScore}%
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Shuffle fontSize="small" color="warning" />
                        <Typography variant="body2">
                          {quiz.random === 1
                            ? "Hiển thị ngẫu nhiên"
                            : "Hiển thị tuần tự"}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <HelpOutline fontSize="small" color="#333" />
                        <Typography variant="body2">
                          {quiz.showExplanation === 1
                            ? "Hiển thị giải thích"
                            : "Không hiển thị giải thích"}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <EditNote fontSize="small" color="error" />
                        <Typography variant="body2">
                          Tối đa {quiz.attemptsAllowed} lần làm bài
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Grade fontSize="small" color="error" />
                        <Typography variant="body2">
                          Trọng số {quiz.weight}
                        </Typography>
                      </Stack>

                      {/* Hiển thị thời gian bắt đầu và kết thúc nếu có */}
                      {quiz.startTime && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Schedule fontSize="small" color="success" />
                          <Typography variant="body2">
                            Bắt đầu: {formatDateTime(quiz.startTime)}
                          </Typography>
                        </Stack>
                      )}

                      {quiz.endTime && (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <AccessTime fontSize="small" color="error" />
                          <Typography variant="body2">
                            Kết thúc: {formatDateTime(quiz.endTime)}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </List>
        ) : (
          <EmptyState
            icon={<MenuBook />}
            title="Chưa có Bài trắc nghiệm nào"
            description="Hãy thêm Bài trắc nghiệm đầu tiên để bắt đầu đánh giá kiến thức của học viên"
          />
        )}
      </TabPanel>

      {/* Assignment List */}
      <TabPanel value={tabValue} index={1}>
        {assignmentsData.length > 0 ? (
          <List>
            {assignmentsData.map((assignment) => (
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
                            color={
                              assignment?.assignmentSubmissions?.length == 0
                                ? "primary"
                                : "disabled"
                            }
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>

                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="body2" color="text.secondary">
                        {assignment.description}
                      </Typography>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="body2"
                          color="primary"
                          fontWeight={600}
                        >
                          Đã có {assignment?.assignmentSubmissions?.length} bài
                          nộp
                        </Typography>
                      </Stack>
                    </Stack>

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
                        <AccessTime fontSize="small" color="warning" />
                        <Typography variant="body2">
                          Hạn nộp {formatDateTime(assignment.dueDate)}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircle fontSize="small" color="success" />
                        <Typography variant="body2">
                          Điểm tối đa: {assignment.maxScore}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </List>
        ) : (
          <EmptyState
            icon={<AssignmentIcon />}
            title="Chưa có bài tập nào"
            description="Hãy thêm bài tập đầu tiên để bắt đầu giao bài tập cho học viên"
          />
        )}
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}
      >
        <DialogTitle>
          Xác nhận xóa{" "}
          {deleteDialog.type === "quiz" ? "Bài trắc nghiệm" : "bài tập"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa{" "}
            {deleteDialog.type === "quiz" ? "Bài trắc nghiệm" : "bài tập"} này?
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
