import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Avatar,
  Chip,
  Divider,
  Stack,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  Badge,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  Videocam as VideocamIcon,
  Group as GroupIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  VideocamOff as VideocamOffIcon,
  Forum as ForumIcon,
  Assignment as AssignmentIcon,
  MenuBook as MenuBookIcon,
  People as PeopleIcon,
  EmojiPeople as EmojiPeopleIcon,
  TimerOutlined,
  TaskAlt,
  Close,
  ArrowBack,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import CustomContainer from "../../../components/common/CustomContainer";
import { fetchTeachingScheduleById } from "../../../features/teaching-schedules/teachingSchedulesSlice";
import { selectCurrentSchedule } from "../../../features/teaching-schedules/teachingSchedulesSelectors";
import { ScheduleStatus } from "../../../types/teaching-schedule.types";
import {
  joinClass,
  leaveClass,
} from "../../../features/teaching-schedules/activeClassSlice";
import {
  selectIsClassActive,
  selectElapsedTime,
} from "../../../features/teaching-schedules/activeClassSelectors";
import { AttendanceStatus } from "../../../types/attendance.types";
import {
  fetchAttendances,
  markAttendance,
  markLeave,
} from "../../../features/session-attendances/sessionAttendancesSlice";
import { User, UserStudentAcademic } from "../../../types/user.types";
import { selectAllAttendances } from "../../../features/session-attendances/sessionAttendancesSelector";
import { format as formatDate } from "date-fns";

const getAttendanceStatusLabel = (status: string) => {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return "Có mặt";
    case AttendanceStatus.LATE:
      return "Đi muộn";
    case AttendanceStatus.ABSENT:
      return "Vắng mặt";
    case AttendanceStatus.EXCUSED:
      return "Có phép";
    default:
      return "Không xác định";
  }
};

const formatTimeFromISO = (isoString: string | Date | null): string => {
  if (!isoString) return "N/A";
  return formatDate(new Date(isoString), "HH:mm");
};

const getStudentFullName = (
  attendance: any,
  currentUser: (User & { userStudentAcademic?: UserStudentAcademic }) | null
): string => {
  // First try to get name from attendance record
  if (attendance.studentAcademic?.fullName) {
    return attendance.studentAcademic.fullName;
  }

  // If this is the current user's attendance but studentAcademic is missing
  if (
    currentUser?.userStudentAcademic?.id &&
    String(attendance.studentAcademicId) ===
      String(currentUser.userStudentAcademic.id)
  ) {
    // Use the user's name from student academic data
    return currentUser.userStudentAcademic.fullName || "Bạn";
  }

  // Fallback to a generic name
  return "Học viên";
};

const JoinClass = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentUser = useAppSelector(selectCurrentUser) as
    | (User & {
        userStudentAcademic?: UserStudentAcademic;
      })
    | null;
  const currentSchedule = useAppSelector(selectCurrentSchedule);
  const attendances = useAppSelector(selectAllAttendances);
  const isClassActive = useAppSelector(selectIsClassActive);
  const elapsedTime = useAppSelector(selectElapsedTime);
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] =
    useState<AttendanceStatus | null>(null);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUserAttendance, setCurrentUserAttendance] = useState<any>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      dispatch(fetchTeachingScheduleById(Number(id)));
      dispatch(fetchAttendances({ scheduleId: Number(id) }));
    }
  }, [dispatch, id]);

  console.log(attendances);

  // Update loading state when currentSchedule is fetched
  useEffect(() => {
    if (currentSchedule) {
      setLoading(false);
    }
  }, [currentSchedule]);

  // Updated process attendances function to directly use the attendance data
  useEffect(() => {
    if (attendances.length > 0) {
      // No need to transform the data anymore - use it directly
      setAttendees(attendances);

      // Check if current user's attendance is in the list
      if (currentUser?.userStudentAcademic?.id) {
        const currentUserAcademicId = currentUser.userStudentAcademic.id;
        const userAttendance = attendances.find(
          (a) => String(a.studentAcademicId) === String(currentUserAcademicId)
        );
        if (userAttendance) {
          setAttendanceStatus(userAttendance.status);
          setCurrentUserAttendance(userAttendance);
        }
      }
    }
  }, [attendances, currentUser]);

  // Function to check if class is currently in progress based on time
  const checkClassInProgress = () => {
    if (!currentSchedule) return false;

    const now = new Date();
    const startTime = parseISO(currentSchedule.startTime);
    const endTime = parseISO(currentSchedule.endTime);

    return now >= startTime && now <= endTime;
  };

  const copyToClipboard = (text: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
    }
  };

  const handleJoinClass = async () => {
    try {
      if (!currentSchedule || !currentUser?.userStudentAcademic?.id) {
        throw new Error("Missing schedule or student information");
      }

      const userStudentAcademic = currentUser.userStudentAcademic;

      // Create the attendance data
      const attendanceData = {
        scheduleId: currentSchedule.id,
        studentAcademicId: userStudentAcademic.id,
        status: AttendanceStatus.PRESENT,
      };

      // Mark attendance using the session-attendances slice
      const response = await dispatch(markAttendance(attendanceData)).unwrap();

      // Update local state
      setAttendanceStatus(AttendanceStatus.PRESENT);
      setCurrentUserAttendance(response);

      // Add the current user's attendance to the attendees list if not already there
      const userAttendanceExists = attendees.some(
        (a) => String(a.studentAcademicId) === String(userStudentAcademic.id)
      );

      if (!userAttendanceExists) {
        // Create a simulated attendance record with user info if the API response doesn't include it
        const newAttendance = {
          ...response,
          studentAcademic: response.studentAcademic || {
            id: userStudentAcademic.id,
            fullName: userStudentAcademic.fullName || "Bạn",
            user: {
              id: currentUser.id,
              email: currentUser.email,
              avatarUrl: currentUser.avatarUrl,
            },
          },
        };

        setAttendees((prev) => [newAttendance, ...prev]);
      } else {
        // Update the existing attendance
        setAttendees((prev) =>
          prev.map((a) =>
            String(a.studentAcademicId) === String(userStudentAcademic.id)
              ? { ...a, ...response }
              : a
          )
        );
      }

      // Dispatch join class action
      dispatch(joinClass(currentSchedule));

      // Navigate to external meeting link in a new tab
      if (currentSchedule?.meetingLink) {
        window.open(currentSchedule.meetingLink, "_blank");
      }
    } catch (err) {
      console.error("Error joining class:", err);
      setError("Không thể tham gia buổi học. Vui lòng thử lại sau.");
    }
  };

  const handleLeaveClass = async () => {
    try {
      setConfirmLeaveOpen(false);

      if (!currentSchedule || !currentUser?.userStudentAcademic?.id) {
        throw new Error("Missing schedule or student information");
      }

      // Mark leave using the session-attendances slice
      await dispatch(
        markLeave({
          scheduleId: currentSchedule.id,
          studentAcademicId: currentUser.userStudentAcademic.id,
        })
      ).unwrap();

      // Dispatch leave class action
      dispatch(leaveClass());

      navigate("/teaching-schedules");
    } catch (err) {
      console.error("Error leaving class:", err);
      setError("Không thể cập nhật trạng thái tham gia. Vui lòng thử lại sau.");
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours > 0 ? `${hours}h ` : ""}${minutes}m ${remainingSeconds}s`;
  };

  // Calculate class duration in minutes
  const getClassDurationMinutes = () => {
    if (!currentSchedule) return 90; // Default value

    const startTime = parseISO(currentSchedule.startTime);
    const endTime = parseISO(currentSchedule.endTime);
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang tải thông tin buổi học...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <CancelIcon color="error" sx={{ fontSize: 60 }} />
        <Typography variant="h6" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/teaching-schedules")}
          sx={{ mt: 2 }}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  if (!currentSchedule) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        <CancelIcon color="error" sx={{ fontSize: 60 }} />
        <Typography variant="h6" color="error" sx={{ mt: 2 }}>
          Không tìm thấy thông tin buổi học
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/teaching-schedules")}
          sx={{ mt: 2 }}
        >
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  const isClassInProgress =
    currentSchedule.status === ScheduleStatus.IN_PROGRESS ||
    checkClassInProgress();
  const attendancePercentage = 72; // Mock attendance percentage - in real app, calculate from attendees

  return (
    <CustomContainer>
      <Box sx={{ px: { xs: 2, md: 4 } }}>
        {/* Back Button */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="text"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/teaching-schedules")}
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": { color: theme.palette.primary.main },
            }}
          >
            Quay lại danh sách
          </Button>
        </Box>

        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              bgcolor: alpha("#fff", 0.1),
              transform: "translate(30%, -30%)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: "10%",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              bgcolor: alpha("#fff", 0.1),
              transform: "translate(-50%, 50%)",
            }}
          />

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {currentSchedule.title}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Avatar
                  src={
                    currentSchedule.academicClassInstructor?.instructor?.user
                      ?.avatarUrl
                  }
                  alt={
                    currentSchedule.academicClassInstructor?.instructor
                      ?.fullName
                  }
                />
                <Typography variant="subtitle1">
                  {
                    currentSchedule.academicClassInstructor?.instructor
                      ?.fullName
                  }
                </Typography>
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ mb: 2 }}
              >
                <Chip
                  icon={<EventIcon />}
                  label={format(
                    parseISO(currentSchedule.startTime),
                    "EEEE, dd/MM/yyyy",
                    {
                      locale: vi,
                    }
                  )}
                  sx={{
                    bgcolor: alpha("#fff", 0.2),
                    color: "white",
                    fontWeight: 500,
                  }}
                />
                <Chip
                  icon={<AccessTimeIcon />}
                  label={`${format(
                    parseISO(currentSchedule.startTime),
                    "HH:mm"
                  )} - ${format(parseISO(currentSchedule.endTime), "HH:mm")}`}
                  sx={{
                    bgcolor: alpha("#fff", 0.2),
                    color: "white",
                    fontWeight: 500,
                  }}
                />
                <Chip
                  icon={<GroupIcon />}
                  label={`${
                    attendees.filter(
                      (a) => a.status !== AttendanceStatus.ABSENT
                    ).length
                  }/${attendees.length} sinh viên tham gia`}
                  sx={{
                    bgcolor: alpha("#fff", 0.2),
                    color: "white",
                    fontWeight: 500,
                  }}
                />
              </Stack>
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "flex-end" },
              }}
            >
              {isClassActive ? (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CancelIcon />}
                  onClick={() => setConfirmLeaveOpen(true)}
                  sx={{
                    bgcolor: alpha("#fff", 0.9),
                    color: theme.palette.error.main,
                    fontWeight: "bold",
                    "&:hover": {
                      bgcolor: alpha("#fff", 0.95),
                    },
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  Kết thúc buổi học
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<VideocamIcon />}
                  onClick={handleJoinClass}
                  disabled={!isClassInProgress}
                  sx={{
                    bgcolor: isClassInProgress
                      ? alpha("#fff", 0.9)
                      : alpha("#fff", 0.5),
                    color: isClassInProgress
                      ? theme.palette.success.main
                      : theme.palette.text.secondary,
                    fontWeight: "bold",
                    "&:hover": {
                      bgcolor: alpha("#fff", 0.95),
                    },
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  {isClassInProgress ? "Tham gia ngay" : "Chưa đến giờ học"}
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>

        {currentUserAttendance && (
          <Card
            sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: theme.shadows[3],
              position: "relative",
              overflow: "hidden",
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            }}
          >
            <Box
              sx={{
                height: 8,
                width: "100%",
                bgcolor: theme.palette.success.main,
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
            <CardContent sx={{ p: 3, pt: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.success.main,
                    mr: 2,
                    width: 48,
                    height: 48,
                  }}
                >
                  <CheckCircleIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Bạn đã được điểm danh
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Trạng thái:{" "}
                    <Chip
                      size="small"
                      label={getAttendanceStatusLabel(
                        currentUserAttendance.status
                      )}
                      color={
                        currentUserAttendance.status ===
                        AttendanceStatus.PRESENT
                          ? "success"
                          : currentUserAttendance.status ===
                            AttendanceStatus.LATE
                          ? "warning"
                          : currentUserAttendance.status ===
                            AttendanceStatus.EXCUSED
                          ? "info"
                          : "error"
                      }
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ ml: 7, mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Thời gian vào lớp:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formatTimeFromISO(currentUserAttendance.joinTime)}
                    </Typography>
                  </Grid>

                  {currentUserAttendance.leaveTime && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Thời gian ra khỏi lớp:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatTimeFromISO(currentUserAttendance.leaveTime)}
                      </Typography>
                    </Grid>
                  )}

                  {currentUserAttendance.durationMinutes !== null &&
                    currentUserAttendance.durationMinutes !== undefined && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Thời gian tham gia:
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {currentUserAttendance.durationMinutes} phút
                        </Typography>
                      </Grid>
                    )}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        )}

        <Grid container spacing={3}>
          {/* Left column - Class information */}
          <Grid item xs={12} md={8}>
            {isClassActive && (
              <Card
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  boxShadow: theme.shadows[3],
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: 8,
                    width: "100%",
                    bgcolor: theme.palette.success.main,
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />
                <CardContent sx={{ p: 3, pt: 4 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          <TimerOutlined />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Thời gian tham gia
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {formatDuration(elapsedTime)}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ mt: 1 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Thời gian tham gia / Tổng thời gian
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(
                            (elapsedTime / 60 / getClassDurationMinutes()) *
                              100,
                            100
                          )}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            "& .MuiLinearProgress-bar": {
                              bgcolor: theme.palette.primary.main,
                            },
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, textAlign: "right" }}
                        >
                          {formatDuration(elapsedTime)} /{" "}
                          {getClassDurationMinutes()} phút
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[3] }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Mô tả buổi học
                </Typography>
                <Typography variant="body1" paragraph>
                  {currentSchedule.description}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[3] }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Thông tin phòng học
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Link phòng học
                    </Typography>
                    <Typography
                      variant="body1"
                      component="a"
                      href={currentSchedule.meetingLink}
                      target="_blank"
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: "none",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {currentSchedule.meetingLink}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      ID phòng học
                    </Typography>
                    <Tooltip title="Nhấp để sao chép">
                      <Typography
                        variant="body1"
                        sx={{
                          cursor: "pointer",
                          "&:hover": { color: theme.palette.primary.main },
                        }}
                        onClick={() =>
                          copyToClipboard(currentSchedule.meetingId || "")
                        }
                      >
                        {currentSchedule.meetingId}
                      </Typography>
                    </Tooltip>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Mật khẩu
                    </Typography>
                    <Tooltip title="Nhấp để sao chép">
                      <Typography
                        variant="body1"
                        sx={{
                          cursor: "pointer",
                          "&:hover": { color: theme.palette.primary.main },
                        }}
                        onClick={() =>
                          copyToClipboard(currentSchedule.meetingPassword || "")
                        }
                      >
                        {currentSchedule.meetingPassword}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Right column - Attendees */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[3] }}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Danh sách điểm danh
                  </Typography>
                  <Chip
                    label={`${
                      attendees.filter(
                        (a) => a.status !== AttendanceStatus.ABSENT
                      ).length
                    }/${attendees.length}`}
                    color="primary"
                    size="small"
                  />
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={
                    attendees.length > 0
                      ? (attendees.filter(
                          (a) => a.status !== AttendanceStatus.ABSENT
                        ).length /
                          attendees.length) *
                        100
                      : 0
                  }
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mb: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                />

                {attendees.length === 0 ? (
                  <Typography
                    align="center"
                    color="text.secondary"
                    sx={{ py: 4 }}
                  >
                    Chưa có dữ liệu điểm danh
                  </Typography>
                ) : (
                  <Stack
                    spacing={2}
                    sx={{ maxHeight: 400, overflow: "auto", pr: 1 }}
                  >
                    {attendees.map((attendance) => (
                      <Paper
                        key={attendance.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor:
                            currentUser?.userStudentAcademic?.id &&
                            String(attendance.studentAcademicId) ===
                              String(currentUser.userStudentAcademic.id)
                              ? alpha(theme.palette.primary.main, 0.05)
                              : theme.palette.background.default,
                          border: `1px solid ${alpha(
                            currentUser?.userStudentAcademic?.id &&
                              String(attendance.studentAcademicId) ===
                                String(currentUser.userStudentAcademic.id)
                              ? theme.palette.primary.main
                              : theme.palette.divider,
                            0.1
                          )}`,
                          position: "relative",
                          overflow: "hidden",
                          "&::before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: "4px",
                            backgroundColor:
                              attendance.status === AttendanceStatus.PRESENT
                                ? theme.palette.success.main
                                : attendance.status === AttendanceStatus.LATE
                                ? theme.palette.warning.main
                                : attendance.status === AttendanceStatus.ABSENT
                                ? theme.palette.error.main
                                : theme.palette.info.main,
                            borderTopLeftRadius: "8px",
                            borderBottomLeftRadius: "8px",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Avatar
                              src={
                                attendance.studentAcademic?.user?.avatarUrl ||
                                null
                              }
                              alt={
                                attendance.studentAcademic?.fullName ||
                                "Student"
                              }
                              sx={{
                                width: 40,
                                height: 40,
                                ...(currentUser?.userStudentAcademic?.id &&
                                  String(attendance.studentAcademicId) ===
                                    String(
                                      currentUser.userStudentAcademic.id
                                    ) && {
                                    border: `2px solid ${theme.palette.primary.main}`,
                                  }),
                              }}
                            >
                              {getStudentFullName(
                                attendance,
                                currentUser
                              ).charAt(0) || "S"}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                {getStudentFullName(attendance, currentUser)}
                                {currentUser?.userStudentAcademic?.id &&
                                  String(attendance.studentAcademicId) ===
                                    String(
                                      currentUser.userStudentAcademic.id
                                    ) && (
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      sx={{
                                        ml: 1,
                                        color: theme.palette.primary.main,
                                        fontWeight: "bold",
                                      }}
                                    >
                                      (Bạn)
                                    </Typography>
                                  )}
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            size="small"
                            label={getAttendanceStatusLabel(attendance.status)}
                            color={
                              attendance.status === AttendanceStatus.PRESENT
                                ? "success"
                                : attendance.status === AttendanceStatus.LATE
                                ? "warning"
                                : attendance.status === AttendanceStatus.EXCUSED
                                ? "info"
                                : "error"
                            }
                            sx={{ height: 24 }}
                          />
                        </Box>

                        <Box sx={{ pl: 6.5, display: "flex", gap: 2 }}>
                          {attendance.status !== AttendanceStatus.ABSENT && (
                            <>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Tham gia lúc{" "}
                                {formatTimeFromISO(attendance.joinTime)}
                              </Typography>
                              {attendance.durationMinutes !== null &&
                                attendance.durationMinutes !== undefined && (
                                  <>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mx: 0.5 }}
                                    >
                                      •
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {attendance.durationMinutes} phút
                                    </Typography>
                                  </>
                                )}
                            </>
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Confirm leave dialog */}
        <Dialog
          open={confirmLeaveOpen}
          onClose={() => setConfirmLeaveOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1,
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                Xác nhận kết thúc
              </Typography>
              <IconButton onClick={() => setConfirmLeaveOpen(false)}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Bạn có chắc chắn muốn kết thúc buổi học? Hệ thống sẽ ghi nhận thời
              gian tham gia của bạn là{" "}
              <strong>{formatDuration(elapsedTime)}</strong>.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              variant="outlined"
              onClick={() => setConfirmLeaveOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              Hủy bỏ
            </Button>
            <Button
              variant="contained"
              onClick={handleLeaveClass}
              color="primary"
              sx={{ borderRadius: 2 }}
            >
              Xác nhận
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </CustomContainer>
  );
};

export default JoinClass;
