import React, { useState, useEffect } from "react";
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
  Tabs,
  Tab,
  Container,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  Videocam as VideocamIcon,
  VideoCall as VideoCallIcon,
  Group as GroupIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  VideocamOff as VideocamOffIcon,
  HistoryOutlined,
  PlayArrow,
  CalendarToday,
  ArrowForwardIos,
  ExpandMore,
  ExpandLess,
  VideoLibrary,
  ContentCopy,
  School,
  ExitToApp as ExitToAppIcon,
} from "@mui/icons-material";
import { format, isBefore, isAfter, isToday, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectCurrentUser } from "../../../features/auth/authSelectors";

import {
  User,
  UserStudent,
  UserStudentAcademic,
} from "../../../types/user.types";
import { fetchTeachingSchedulesByStudent } from "../../../features/teaching-schedules/teachingSchedulesSlice";
import { selectStudentSchedules } from "../../../features/teaching-schedules/teachingSchedulesSelectors";
import {
  AttendanceStatus,
  TeachingScheduleWithAttendance,
} from "../../../types/attendance.types";

// Add a helper function to get the user's attendance status for a schedule
const findUserAttendance = (schedule: any, currentUserId?: number | string) => {
  if (!schedule.attendances || !currentUserId) return null;

  return schedule.attendances.find(
    (attendance: any) =>
      String(attendance.studentAcademic?.userId) === String(currentUserId) ||
      attendance.studentAcademic?.user?.id === String(currentUserId)
  );
};

const TeachingSchedules = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser) as
    | (User & {
        userStudent?: UserStudent;
        userStudentAcademic?: UserStudentAcademic;
      })
    | null;
  const studentSchedules = useAppSelector(selectStudentSchedules);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [upcoming, setUpcoming] = useState<TeachingScheduleWithAttendance[]>(
    []
  );
  const [past, setPast] = useState<TeachingScheduleWithAttendance[]>([]);
  const [all, setAll] = useState<TeachingScheduleWithAttendance[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    totalSessions: 0,
    attendedSessions: 0,
    attendancePercentage: 0,
    lateCount: 0,
    absentCount: 0,
    excusedCount: 0,
  });
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

  // Define now at component level so it can be used throughout the component
  const now = new Date();

  useEffect(() => {
    // Tải lịch học khi có ID của học sinh
    if (currentUser?.userStudentAcademic?.id) {
      dispatch(
        fetchTeachingSchedulesByStudent(currentUser.userStudentAcademic.id)
      );
    }
  }, [dispatch, currentUser]);

  console.log(studentSchedules);

  useEffect(() => {
    if (!studentSchedules) {
      setLoading(true);
      return;
    }

    // Transform the studentSchedules data to match component structure
    const processedSchedules = studentSchedules.map((schedule) => {
      // Find user's attendance for this schedule
      const userAttendance = currentUser
        ? findUserAttendance(schedule, currentUser.id)
        : null;

      return {
        id: Number(schedule.id),
        courseId: schedule.academicClass?.id
          ? Number(schedule.academicClass.id)
          : 0,
        courseName: schedule.academicClass?.className || "",
        instructorId: schedule.academicClassInstructor?.instructor?.id
          ? Number(schedule.academicClassInstructor.instructor.id)
          : 0,
        instructorName:
          schedule.academicClassInstructor?.instructor?.fullName || "",
        instructorAvatar:
          schedule.academicClassInstructor?.instructor?.user?.avatarUrl || "",
        title: schedule.title,
        description: schedule.description,
        date: parseISO(schedule.startTime),
        startTime: format(parseISO(schedule.startTime), "HH:mm"),
        endTime: format(parseISO(schedule.endTime), "HH:mm"),
        duration: Math.round(
          (new Date(schedule.endTime).getTime() -
            new Date(schedule.startTime).getTime()) /
            (1000 * 60)
        ),
        meetingUrl: schedule.meetingLink,
        meetingId: schedule.meetingId,
        meetingPassword: schedule.meetingPassword,
        recordingUrl: schedule.recordingUrl,
        status: schedule.status,
        totalStudents: schedule.attendances?.length || 0,
        attendedStudents:
          schedule.attendances?.filter(
            (a: any) => a.status !== AttendanceStatus.ABSENT
          ).length || 0,
        createdAt: new Date(schedule.createdAt),
        updatedAt: new Date(schedule.updatedAt),
        attendances: schedule.attendances || [], // Include full attendance data
        userAttendance, // Include user's own attendance record
      };
    }) as TeachingScheduleWithAttendance[];

    const upcomingSchedules = processedSchedules.filter(
      (schedule) =>
        new Date(schedule.date) > now ||
        (isToday(schedule.date) && schedule.status === "scheduled")
    );
    const pastSchedules = processedSchedules.filter(
      (schedule) =>
        new Date(schedule.date) < now &&
        (!isToday(schedule.date) || schedule.status === "completed")
    );

    setUpcoming(upcomingSchedules);
    setPast(pastSchedules);
    setAll(processedSchedules);

    // Calculate attendance summary
    if (currentUser) {
      const attendedSessions = processedSchedules.filter(
        (s) =>
          s.userAttendance &&
          s.userAttendance.status === AttendanceStatus.PRESENT
      ).length;

      const lateSessions = processedSchedules.filter(
        (s) =>
          s.userAttendance && s.userAttendance.status === AttendanceStatus.LATE
      ).length;

      const absentSessions = processedSchedules.filter(
        (s) =>
          s.userAttendance &&
          s.userAttendance.status === AttendanceStatus.ABSENT
      ).length;

      const excusedSessions = processedSchedules.filter(
        (s) =>
          s.userAttendance &&
          s.userAttendance.status === AttendanceStatus.EXCUSED
      ).length;

      const totalWithAttendance = processedSchedules.filter(
        (s) => s.userAttendance
      ).length;

      setAttendanceSummary({
        totalSessions: totalWithAttendance,
        attendedSessions: attendedSessions + lateSessions,
        attendancePercentage:
          totalWithAttendance > 0
            ? Math.round(
                ((attendedSessions + lateSessions) / totalWithAttendance) * 100
              )
            : 0,
        lateCount: lateSessions,
        absentCount: absentSessions,
        excusedCount: excusedSessions,
      });
    }

    setLoading(false);
  }, [studentSchedules, currentUser]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleToggleExpand = (id: number) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleJoinClass = (id: number) => {
    navigate(`/join-class/${id}`);
  };

  // Kiểm tra nếu buổi học đang diễn ra dựa trên thời gian (không chỉ dựa vào status)
  const isScheduleInProgress = (schedule: TeachingScheduleWithAttendance) => {
    const scheduleDate = new Date(schedule.date);
    const startTime = schedule.startTime.split(":");
    const endTime = schedule.endTime.split(":");

    const startDateTime = new Date(scheduleDate);
    startDateTime.setHours(
      parseInt(startTime[0], 10),
      parseInt(startTime[1], 10)
    );

    const endDateTime = new Date(scheduleDate);
    endDateTime.setHours(parseInt(endTime[0], 10), parseInt(endTime[1], 10));

    const currentTime = new Date();

    // Buổi học đang diễn ra nếu thời gian hiện tại nằm giữa thời gian bắt đầu và kết thúc
    // Hoặc status đã được set là "in-progress"
    return (
      (currentTime >= startDateTime && currentTime <= endDateTime) ||
      schedule.status === "in-progress"
    );
  };

  const getStatusChip = (schedule: TeachingScheduleWithAttendance) => {
    if (schedule.status === "in-progress") {
      return (
        <Chip
          icon={<VideoCallIcon />}
          label="Đang diễn ra"
          color="success"
          size="small"
          sx={{ fontWeight: "bold" }}
        />
      );
    } else if (schedule.status === "scheduled") {
      if (isToday(schedule.date)) {
        return (
          <Chip
            icon={<EventIcon />}
            label="Hôm nay"
            color="primary"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        );
      } else {
        return (
          <Chip
            icon={<CalendarToday />}
            label="Sắp diễn ra"
            color="info"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        );
      }
    } else if (schedule.status === "completed") {
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Đã hoàn thành"
          color="default"
          size="small"
          sx={{ fontWeight: "bold" }}
        />
      );
    } else {
      return (
        <Chip
          icon={<CancelIcon />}
          label="Đã hủy"
          color="error"
          size="small"
          sx={{ fontWeight: "bold" }}
        />
      );
    }
  };

  const getAttendanceStatusChip = (
    schedule: TeachingScheduleWithAttendance
  ) => {
    if (!schedule.attendances || schedule.attendances.length === 0) {
      return null;
    }

    const attendance = schedule.attendances[0];

    switch (attendance.status) {
      case AttendanceStatus.PRESENT:
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Có mặt"
            color="success"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        );
      case AttendanceStatus.LATE:
        return (
          <Chip
            icon={<AccessTimeIcon />}
            label="Đi muộn"
            color="warning"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        );
      case AttendanceStatus.ABSENT:
        return (
          <Chip
            icon={<CancelIcon />}
            label="Vắng mặt"
            color="error"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        );
      case AttendanceStatus.EXCUSED:
        return (
          <Chip
            icon={<HistoryOutlined />}
            label="Có phép"
            color="info"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        );
      default:
        return null;
    }
  };

  // Add a function to render attendance status
  const renderAttendanceStatus = (schedule: TeachingScheduleWithAttendance) => {
    if (!schedule.userAttendance) {
      return null;
    }

    let color;
    let label;
    let icon;

    switch (schedule.userAttendance.status) {
      case AttendanceStatus.PRESENT:
        color = "success";
        label = "Có mặt";
        icon = <CheckCircleIcon fontSize="small" />;
        break;
      case AttendanceStatus.LATE:
        color = "warning";
        label = "Đi muộn";
        icon = <AccessTimeIcon fontSize="small" />;
        break;
      case AttendanceStatus.ABSENT:
        color = "error";
        label = "Vắng mặt";
        icon = <CancelIcon fontSize="small" />;
        break;
      case AttendanceStatus.EXCUSED:
        color = "info";
        label = "Có phép";
        icon = <HistoryOutlined fontSize="small" />;
        break;
      default:
        return null;
    }

    return (
      <Box sx={{ mt: 1 }}>
        <Chip
          icon={icon}
          label={label}
          color={color}
          size="small"
          sx={{ fontWeight: "medium" }}
        />

        {schedule.userAttendance.durationMinutes > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            • {schedule.userAttendance.durationMinutes} phút
          </Typography>
        )}

        {/* Display join and leave times */}
        <Box sx={{ mt: 0.5 }}>
          {schedule.userAttendance.joinTime && (
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              <AccessTimeIcon
                sx={{ fontSize: 12, mr: 0.5, verticalAlign: "text-bottom" }}
              />
              Vào lớp:{" "}
              {format(
                new Date(schedule.userAttendance.joinTime),
                "HH:mm:ss, dd/MM/yyyy"
              )}
            </Typography>
          )}

          {schedule.userAttendance.leaveTime && (
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              <ExitToAppIcon
                sx={{ fontSize: 12, mr: 0.5, verticalAlign: "text-bottom" }}
              />
              Rời lớp:{" "}
              {format(
                new Date(schedule.userAttendance.leaveTime),
                "HH:mm:ss, dd/MM/yyyy"
              )}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  // Create a reusable function to render schedule cards
  const renderScheduleCards = (schedules: TeachingScheduleWithAttendance[]) => {
    return (
      <Grid container spacing={3}>
        {schedules.length > 0 ? (
          schedules.map((schedule) => (
            <Grid item xs={12} md={6} key={schedule.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: theme.shadows[2],
                }}
              >
                <Box
                  sx={{
                    height: 8,
                    bgcolor:
                      schedule.status === "in-progress"
                        ? theme.palette.success.main
                        : isToday(schedule.date)
                        ? theme.palette.primary.main
                        : new Date(schedule.date) < now
                        ? theme.palette.grey[300]
                        : theme.palette.info.main,
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {schedule.title}
                    </Typography>
                    {getStatusChip(schedule)}
                  </Box>

                  <Stack spacing={2}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={schedule.instructorAvatar}
                        alt={schedule.instructorName}
                        sx={{ width: 36, height: 36, mr: 2 }}
                      />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Giảng viên
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {schedule.instructorName}
                        </Typography>
                      </Box>
                    </Box>

                    <Stack direction="row" spacing={2}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <EventIcon
                          color={
                            new Date(schedule.date) < now ? "action" : "primary"
                          }
                          sx={{ mr: 1, fontSize: 20 }}
                        />
                        <Typography variant="body2">
                          {format(schedule.date, "dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AccessTimeIcon
                          color={
                            new Date(schedule.date) < now ? "action" : "primary"
                          }
                          sx={{ mr: 1, fontSize: 20 }}
                        />
                        <Typography variant="body2">
                          {schedule.startTime} - {schedule.endTime}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <School color="action" sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        {schedule.courseName}
                      </Typography>
                    </Box>

                    {/* Attendance status card */}
                    {schedule.attendedStudents > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          p: 1.5,
                          bgcolor: alpha(theme.palette.primary.light, 0.1),
                          borderRadius: 2,
                          border: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.2
                          )}`,
                        }}
                      >
                        <Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <GroupIcon
                              sx={{
                                mr: 1,
                                fontSize: 18,
                                color: theme.palette.primary.main,
                              }}
                            />
                            <Typography variant="body2" fontWeight="medium">
                              {schedule.attendedStudents}/
                              {schedule.totalStudents} học viên tham gia
                            </Typography>
                          </Box>

                          {/* User's own attendance status */}
                          {renderAttendanceStatus(schedule)}
                        </Box>

                        {schedule.status === "completed" && (
                          <Chip
                            icon={<CheckCircleIcon fontSize="small" />}
                            label="Đã điểm danh"
                            color={
                              schedule.userAttendance
                                ? "success"
                                : ("default" as "success" | "default")
                            }
                            size="small"
                            sx={{ fontWeight: "medium" }}
                          />
                        )}
                      </Box>
                    )}

                    {/* Collapsible details section */}
                    <Collapse
                      in={expandedCardId === schedule.id}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body1" paragraph>
                          {schedule.description}
                        </Typography>

                        {/* Show meeting details or recording link based on whether the class is past or not */}
                        {new Date(schedule.date) < now &&
                        schedule.recordingUrl ? (
                          <Button
                            variant="outlined"
                            startIcon={<VideoLibrary />}
                            fullWidth
                            sx={{
                              py: 1.5,
                              borderRadius: 2,
                              justifyContent: "flex-start",
                              textTransform: "none",
                              mt: 2,
                            }}
                            onClick={() =>
                              window.open(schedule.recordingUrl, "_blank")
                            }
                          >
                            Xem lại buổi học
                          </Button>
                        ) : (
                          (schedule.meetingUrl ||
                            schedule.meetingId ||
                            schedule.meetingPassword) && (
                            <Box
                              sx={{
                                mt: 1,
                                p: 2,
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.05
                                ),
                                borderRadius: 2,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight="bold"
                                gutterBottom
                              >
                                Thông tin tham gia
                              </Typography>

                              {schedule.meetingUrl && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Link tham gia:
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      component="a"
                                      href={schedule.meetingUrl}
                                      target="_blank"
                                      sx={{
                                        color: theme.palette.primary.main,
                                        textDecoration: "none",
                                        "&:hover": {
                                          textDecoration: "underline",
                                        },
                                        maxWidth: "90%",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {schedule.meetingUrl}
                                    </Typography>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        copyToClipboard(
                                          schedule.meetingUrl || ""
                                        )
                                      }
                                      sx={{ ml: "auto" }}
                                    >
                                      <ContentCopy fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                              )}

                              <Grid container spacing={2}>
                                {schedule.meetingId && (
                                  <Grid item xs={12} sm={6}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Meeting ID:
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                      >
                                        {schedule.meetingId}
                                      </Typography>
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          copyToClipboard(
                                            schedule.meetingId || ""
                                          )
                                        }
                                        sx={{ ml: 1 }}
                                      >
                                        <ContentCopy fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Grid>
                                )}

                                {schedule.meetingPassword && (
                                  <Grid item xs={12} sm={6}>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Mật khẩu:
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                      >
                                        {schedule.meetingPassword}
                                      </Typography>
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          copyToClipboard(
                                            schedule.meetingPassword || ""
                                          )
                                        }
                                        sx={{ ml: 1 }}
                                      >
                                        <ContentCopy fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Grid>
                                )}
                              </Grid>
                            </Box>
                          )
                        )}
                      </Box>
                    </Collapse>

                    <Divider />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => handleToggleExpand(schedule.id)}
                        endIcon={
                          expandedCardId === schedule.id ? (
                            <ExpandLess />
                          ) : (
                            <ExpandMore />
                          )
                        }
                        sx={{ borderRadius: 2 }}
                      >
                        {expandedCardId === schedule.id
                          ? "Thu gọn"
                          : "Chi tiết"}
                      </Button>

                      {new Date(schedule.date) >= now ||
                      isScheduleInProgress(schedule) ? (
                        <Button
                          variant="contained"
                          color={
                            isScheduleInProgress(schedule)
                              ? "success"
                              : "primary"
                          }
                          startIcon={<VideocamIcon />}
                          onClick={() => handleJoinClass(schedule.id)}
                          disabled={!isScheduleInProgress(schedule)}
                          sx={{
                            borderRadius: 2,
                            opacity: isScheduleInProgress(schedule) ? 1 : 0.7,
                          }}
                        >
                          {isScheduleInProgress(schedule)
                            ? "Tham gia ngay"
                            : "Tham gia"}
                        </Button>
                      ) : schedule.recordingUrl ? (
                        <Button
                          variant="outlined"
                          startIcon={<VideoLibrary />}
                          onClick={() =>
                            window.open(schedule.recordingUrl, "_blank")
                          }
                          sx={{ borderRadius: 2 }}
                        >
                          Xem lại
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          disabled
                          sx={{ borderRadius: 2 }}
                        >
                          Đã diễn ra
                        </Button>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 6,
              }}
            >
              <CalendarToday
                sx={{
                  fontSize: 60,
                  color: alpha(theme.palette.text.secondary, 0.5),
                  mb: 2,
                }}
              />
              <Typography variant="h6" color="text.secondary">
                Không có buổi học nào
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    );
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
          Đang tải thông tin lịch học...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Lịch học trực tuyến
      </Typography>

      {/* Attendance summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              color: "white",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
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

            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Tỷ lệ tham gia
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  position: "relative",
                  width: 100,
                  height: 100,
                  mr: 3,
                }}
              >
                <CircularProgress
                  variant="determinate" 
                  value={100}
                  size={100}
                  thickness={5}
                  sx={{
                    color: alpha("#fff", 0.2),
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />
                <CircularProgress
                  variant="determinate"
                  value={attendanceSummary.attendancePercentage}
                  size={100}
                  thickness={5}
                  sx={{
                    color: "#fff",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    {Math.round(attendanceSummary.attendancePercentage)}%
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Tham gia: {attendanceSummary.attendedSessions}/
                  {attendanceSummary.totalSessions} buổi học
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Đi muộn: {attendanceSummary.lateCount} buổi
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Vắng mặt: {attendanceSummary.absentCount} buổi
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.light, 0.1),
              height: "100%",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              color="primary"
              gutterBottom
            >
              Buổi học sắp tới
            </Typography>

            {upcoming.length > 0 ? (
              <Box>
                <Stack spacing={2}>
                  {upcoming.slice(0, 2).map((schedule) => (
                    <Box
                      key={schedule.id}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Avatar
                        src={schedule.instructorAvatar}
                        alt={schedule.instructorName}
                        sx={{ width: 40, height: 40, mr: 2 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" fontWeight="bold">
                          {schedule.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(schedule.date, "EEEE, dd/MM/yyyy", {
                            locale: vi,
                          })}{" "}
                          • {schedule.startTime}-{schedule.endTime}
                        </Typography>
                      </Box>
                      {getStatusChip(schedule)}
                    </Box>
                  ))}
                </Stack>

                {upcoming.length > 2 && (
                  <Button
                    sx={{ mt: 2 }}
                    endIcon={<ArrowForwardIos fontSize="small" />}
                    onClick={() => setTabValue(0)}
                  >
                    Xem tất cả {upcoming.length} buổi học
                  </Button>
                )}
              </Box>
            ) : (
              <Typography variant="body1" sx={{ mt: 2 }}>
                Không có buổi học nào sắp tới
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="teaching schedule tabs"
        >
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarToday sx={{ mr: 1 }} />
                <Typography fontWeight="bold">Tất cả ({all.length})</Typography>
              </Box>
            }
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <VideoCallIcon sx={{ mr: 1 }} />
                <Typography fontWeight="bold">
                  Sắp tới ({upcoming.length})
                </Typography>
              </Box>
            }
            id="tab-1"
            aria-controls="tabpanel-1"
          />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <HistoryOutlined sx={{ mr: 1 }} />
                <Typography fontWeight="bold">
                  Đã qua ({past.length})
                </Typography>
              </Box>
            }
            id="tab-2"
            aria-controls="tabpanel-2"
          />
        </Tabs>
      </Box>

      {/* All classes */}
      <Box
        role="tabpanel"
        hidden={tabValue !== 0}
        id="tabpanel-0"
        aria-labelledby="tab-0"
        sx={{ py: 3 }}
      >
        {tabValue === 0 && renderScheduleCards(all)}
      </Box>

      {/* Upcoming classes */}
      <Box
        role="tabpanel"
        hidden={tabValue !== 1}
        id="tabpanel-1"
        aria-labelledby="tab-1"
        sx={{ py: 3 }}
      >
        {tabValue === 1 && renderScheduleCards(upcoming)}
      </Box>

      {/* Past classes */}
      <Box
        role="tabpanel"
        hidden={tabValue !== 2}
        id="tabpanel-2"
        aria-labelledby="tab-2"
        sx={{ py: 3 }}
      >
        {tabValue === 2 && renderScheduleCards(past)}
      </Box>
    </Container>
  );
};

export default TeachingSchedules;
