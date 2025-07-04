import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Avatar,
  Tooltip,
  TextField,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Collapse,
  CardContent,
} from "@mui/material";
import {
  AccessTime,
  People,
  VideoCall,
  CheckCircle,
  Cancel,
  Timer,
  TimerOff,
  Event,
  CalendarToday,
  ExpandMore,
  ExpandLess,
  Search,
  EditNote,
  Email,
  Notifications,
  Info,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import {
  TeachingSchedule,
  ScheduleStatus,
} from "../../types/teaching-schedule.types";
import { AttendanceStatus } from "../../types/attendance.types";
import { format, parseISO, isToday, isPast } from "date-fns";
import {
  selectInstructorSchedules,
  selectTeachingSchedulesError,
  selectTeachingSchedulesStatus,
} from "../../features/teaching-schedules/teachingSchedulesSelectors";
import { fetchTeachingSchedulesByInstructor } from "../../features/teaching-schedules/teachingSchedulesSlice";
import { updateAttendance } from "../../features/session-attendances/sessionAttendancesSlice";
import SearchIcon from "@mui/icons-material/Search";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AttendanceTable from "./component/AttendanceTable";
import { toast } from "react-toastify";
import { createNotification } from "../../features/notifications/notificationsSlice";

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
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const TAB_LABELS = {
  ALL: 0,
  UPCOMING: 1,
  PAST: 2,
} as const;

const InstructorAttendances = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const instructorSchedules = useAppSelector(selectInstructorSchedules);
  const status = useAppSelector(selectTeachingSchedulesStatus);
  const error = useAppSelector(selectTeachingSchedulesError);

  const [tabValue, setTabValue] = useState<number>(TAB_LABELS.ALL);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<ScheduleStatus | "ALL">(
    "ALL"
  );
  const [filterClass, setFilterClass] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<
    "date_desc" | "date_asc" | "student_desc" | "student_asc"
  >("date_desc");

  // State cho dialog chỉnh sửa ghi chú
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<any>(null);
  const [noteValue, setNoteValue] = useState("");
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [shouldSendEmail, setShouldSendEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");

  const classOptions = Array.from(
    new Set(
      instructorSchedules.map(
        (s) => s.academicClass?.classCode + " - " + s.academicClass?.className
      )
    )
  ).filter(Boolean);

  useEffect(() => {
    if (currentUser?.userInstructor?.id) {
      dispatch(
        fetchTeachingSchedulesByInstructor(
          Number(currentUser.userInstructor.id)
        )
      );
    }
  }, [dispatch, currentUser]);

  console.log(instructorSchedules);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusChip = (schedule: TeachingSchedule) => {
    const now = new Date();
    const startTime = new Date(schedule.startTime);
    const endTime = new Date(schedule.endTime);
    const isInProgress = now >= startTime && now <= endTime;

    if (schedule.status === ScheduleStatus.COMPLETED) {
      return (
        <Chip
          icon={<CheckCircle />}
          label="Đã hoàn thành"
          color="success"
          size="small"
          sx={{ fontWeight: "bold" }}
        />
      );
    } else if (schedule.status === ScheduleStatus.CANCELLED) {
      return (
        <Chip
          icon={<Cancel />}
          label="Đã hủy"
          color="error"
          size="small"
          sx={{ fontWeight: "bold" }}
        />
      );
    } else if (isInProgress) {
      return (
        <Chip
          icon={<VideoCall />}
          label="Đang diễn ra"
          color="primary"
          size="small"
          sx={{ fontWeight: "bold" }}
        />
      );
    } else if (isToday(startTime)) {
      return (
        <Chip
          icon={<Event />}
          label="Hôm nay"
          color="warning"
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
  };

  const getAttendanceStatusChip = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return (
          <Chip
            icon={<CheckCircle />}
            label="Có mặt"
            color="success"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        );
      case AttendanceStatus.LATE:
        return (
          <Chip
            icon={<Timer />}
            label="Đi muộn"
            color="warning"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        );
      case AttendanceStatus.ABSENT:
        return (
          <Chip
            icon={<Cancel />}
            label="Vắng mặt"
            color="error"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        );
      case AttendanceStatus.EXCUSED:
        return (
          <Chip
            icon={<TimerOff />}
            label="Có phép"
            color="default"
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        );
      default:
        return null;
    }
  };

  const calculateAttendanceStats = (schedule: TeachingSchedule) => {
    const totalStudents = schedule.attendances?.length || 0;
    const presentCount =
      schedule.attendances?.filter((a) => a.status === AttendanceStatus.PRESENT)
        .length || 0;
    const lateCount =
      schedule.attendances?.filter((a) => a.status === AttendanceStatus.LATE)
        .length || 0;
    const absentCount =
      schedule.attendances?.filter((a) => a.status === AttendanceStatus.ABSENT)
        .length || 0;
    const excusedCount =
      schedule.attendances?.filter((a) => a.status === AttendanceStatus.EXCUSED)
        .length || 0;

    return {
      totalStudents,
      presentCount,
      lateCount,
      absentCount,
      excusedCount,
      attendanceRate: totalStudents
        ? Math.round(((presentCount + lateCount) / totalStudents) * 100)
        : 0,
    };
  };

  const formatAttendanceDuration = (
    joinTime: string | null,
    leaveTime: string | null
  ) => {
    if (!joinTime) return { duration: 0, formattedTime: "-" };
    if (!leaveTime) return { duration: 0, formattedTime: "Đang tham dự" };

    const join = new Date(joinTime);
    const leave = new Date(leaveTime);

    let diffInSeconds = Math.round((leave.getTime() - join.getTime()) / 1000);
    if (diffInSeconds < 0) diffInSeconds = 0;

    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;

    let formattedTime = "";
    if (hours > 0) {
      formattedTime += `${hours} giờ `;
    }
    if (minutes > 0 || hours > 0) {
      formattedTime += `${minutes} phút `;
    }
    formattedTime += `${seconds} giây`;

    return {
      duration: diffInSeconds,
      formattedTime: formattedTime.trim(),
    };
  };

  // Helper function to check if a schedule is in progress
  const isScheduleInProgress = (schedule: TeachingSchedule) => {
    const now = new Date();
    const startTime = new Date(schedule.startTime);
    const endTime = new Date(schedule.endTime);
    return now >= startTime && now <= endTime;
  };

  const handleEditNote = (attendance: any, note: string) => {
    setEditingAttendance(attendance);
    setNoteValue(note || "");
    setNoteError(null);
    setShouldSendEmail(false);
    setEmailSubject("");
    setEmailContent("");
    setOpenNoteDialog(true);
  };

  const handleSaveNote = async () => {
    if (!editingAttendance || !currentUser?.userInstructor?.id) return;

    try {
      setIsUpdatingNote(true);
      setNoteError(null);

      // Update attendance note
      await dispatch(
        updateAttendance({
          id: editingAttendance.id,
          data: { notes: noteValue },
        })
      ).unwrap();

      // Update local state after successful API call
      const updatedAttendance = {
        ...editingAttendance,
        notes: noteValue,
      };
      setEditingAttendance(updatedAttendance);

      // Send notification if email option is selected
      if (shouldSendEmail && emailSubject && emailContent) {
        const notificationData = {
          userIds: [
            editingAttendance.studentAcademic?.user?.id.toString(),
          ].filter(Boolean),
          title: emailSubject,
          content: emailContent,
          type: "message",
          sendEmail: true,
        };

        await dispatch(createNotification(notificationData)).unwrap();
      }

      // Refresh schedules
      dispatch(
        fetchTeachingSchedulesByInstructor(
          Number(currentUser.userInstructor.id)
        )
      );

      toast.success("Cập nhật ghi chú thành công");
      setOpenNoteDialog(false);
    } catch (err: any) {
      setNoteError(
        err.message || "Không thể cập nhật ghi chú. Vui lòng thử lại sau."
      );
    } finally {
      setIsUpdatingNote(false);
    }
  };

  const renderScheduleList = (schedules: TeachingSchedule[]) => {
    return (
      <Grid container spacing={3}>
        {schedules.map((schedule) => {
          const stats = calculateAttendanceStats(schedule);
          return (
            <Grid item xs={12} key={schedule.id}>
              <Card
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: 3,
                  },
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {schedule.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {format(parseISO(schedule.startTime), "dd/MM/yyyy")}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        {schedule.description}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Chip
                          label={`${schedule.academicClass?.classCode} - ${schedule.academicClass?.className}`}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Học kỳ: {schedule.academicClass?.semester}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          {format(parseISO(schedule.startTime), "HH:mm")} -{" "}
                          {format(parseISO(schedule.endTime), "HH:mm")}
                        </Typography>
                        {getStatusChip(schedule)}
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Tooltip title="Tổng số sinh viên">
                        <Chip
                          icon={<People />}
                          label={`${stats.totalStudents} sinh viên`}
                          variant="outlined"
                          size="small"
                        />
                      </Tooltip>
                      <Tooltip title="Tỷ lệ điểm danh">
                        <Chip
                          icon={<CheckCircle />}
                          label={`${stats.attendanceRate}%`}
                          color={
                            stats.attendanceRate >= 80 ? "success" : "warning"
                          }
                          size="small"
                        />
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: "background.default",
                      borderRadius: 1,
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <VideoCall color="primary" />
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          Link phòng học: {schedule.meetingLink}
                        </Typography>
                        <Typography variant="body2">
                          ID phòng: {schedule.meetingId} | Mật khẩu:{" "}
                          {schedule.meetingPassword}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Giảng viên
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={
                            schedule.academicClassInstructor?.instructor?.user
                              ?.avatarUrl
                          }
                          alt={
                            schedule.academicClassInstructor?.instructor
                              ?.fullName
                          }
                          sx={{ width: 40, height: 40 }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {
                              schedule.academicClassInstructor?.instructor
                                ?.fullName
                            }
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {
                              schedule.academicClassInstructor?.instructor
                                ?.professionalTitle
                            }
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    <AttendanceTable
                      schedule={schedule}
                      onEditNote={handleEditNote}
                    />
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const filterAndSearchSchedules = (schedules: TeachingSchedule[]) => {
    let filtered = schedules.filter((schedule) => {
      // Lọc theo trạng thái
      const matchStatus =
        filterStatus === "ALL" ? true : schedule.status === filterStatus;

      // Lọc theo lớp
      const classLabel =
        schedule.academicClass?.classCode +
        " - " +
        schedule.academicClass?.className;
      const matchClass =
        filterClass === "ALL" ? true : classLabel === filterClass;

      // Lọc theo search term
      const lowerSearch = searchTerm.toLowerCase();
      const matchSearch =
        schedule.title?.toLowerCase().includes(lowerSearch) ||
        schedule.description?.toLowerCase().includes(lowerSearch) ||
        schedule.academicClass?.className
          ?.toLowerCase()
          .includes(lowerSearch) ||
        schedule.academicClass?.classCode?.toLowerCase().includes(lowerSearch);

      return matchStatus && matchClass && (!searchTerm || matchSearch);
    });

    // Sắp xếp
    if (sortBy === "date_desc") {
      filtered = filtered.sort((a, b) => {
        const aInProgress = isScheduleInProgress(a);
        const bInProgress = isScheduleInProgress(b);

        // Ưu tiên buổi học đang diễn ra lên đầu
        if (aInProgress && !bInProgress) return -1;
        if (!aInProgress && bInProgress) return 1;

        // Nếu cả hai đều đang diễn ra hoặc không đang diễn ra, sắp xếp theo thời gian
        if (aInProgress && bInProgress) {
          // Nếu đều đang diễn ra, sắp xếp theo thời gian bắt đầu (sớm hơn lên đầu)
          return (
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
        }

        // Nếu không đang diễn ra, sắp xếp theo thời gian (mới nhất lên đầu)
        return (
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
      });
    } else if (sortBy === "date_asc") {
      filtered = filtered.sort((a, b) => {
        const aInProgress = isScheduleInProgress(a);
        const bInProgress = isScheduleInProgress(b);

        // Ưu tiên buổi học đang diễn ra lên đầu
        if (aInProgress && !bInProgress) return -1;
        if (!aInProgress && bInProgress) return 1;

        // Nếu cả hai đều đang diễn ra hoặc không đang diễn ra, sắp xếp theo thời gian
        if (aInProgress && bInProgress) {
          // Nếu đều đang diễn ra, sắp xếp theo thời gian bắt đầu (sớm hơn lên đầu)
          return (
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
        }

        // Nếu không đang diễn ra, sắp xếp theo thời gian (cũ nhất lên đầu)
        return (
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      });
    } else if (sortBy === "student_desc") {
      filtered = filtered.sort((a, b) => {
        const aInProgress = isScheduleInProgress(a);
        const bInProgress = isScheduleInProgress(b);

        // Ưu tiên buổi học đang diễn ra lên đầu
        if (aInProgress && !bInProgress) return -1;
        if (!aInProgress && bInProgress) return 1;

        // Nếu cả hai đều đang diễn ra hoặc không đang diễn ra, sắp xếp theo số sinh viên
        return (b.attendances?.length || 0) - (a.attendances?.length || 0);
      });
    } else if (sortBy === "student_asc") {
      filtered = filtered.sort((a, b) => {
        const aInProgress = isScheduleInProgress(a);
        const bInProgress = isScheduleInProgress(b);

        // Ưu tiên buổi học đang diễn ra lên đầu
        if (aInProgress && !bInProgress) return -1;
        if (!aInProgress && bInProgress) return 1;

        // Nếu cả hai đều đang diễn ra hoặc không đang diễn ra, sắp xếp theo số sinh viên
        return (a.attendances?.length || 0) - (b.attendances?.length || 0);
      });
    }

    return filtered;
  };

  if (status === "loading") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const now = new Date();
  const upcomingSchedules = instructorSchedules.filter(
    (schedule) =>
      new Date(schedule.startTime) > now ||
      (isToday(new Date(schedule.startTime)) &&
        schedule.status === ScheduleStatus.SCHEDULED)
  );
  const pastSchedules = instructorSchedules.filter(
    (schedule) =>
      new Date(schedule.startTime) < now &&
      (!isToday(new Date(schedule.startTime)) ||
        schedule.status === ScheduleStatus.COMPLETED)
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Điểm danh học trực tuyến
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <TextField
          size="small"
          variant="outlined"
          placeholder="Tìm kiếm theo tên lịch, lớp, mô tả..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 360 }}
        />
        <TextField
          select
          size="small"
          label="Trạng thái"
          value={filterStatus}
          onChange={(e) =>
            setFilterStatus(e.target.value as ScheduleStatus | "ALL")
          }
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="ALL">Tất cả</MenuItem>
          <MenuItem value={ScheduleStatus.SCHEDULED}>Sắp diễn ra</MenuItem>
          <MenuItem value={ScheduleStatus.COMPLETED}>Đã hoàn thành</MenuItem>
          <MenuItem value={ScheduleStatus.CANCELLED}>Đã hủy</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Lớp học"
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          sx={{
            minWidth: 180,
            background: "#fff",
            borderRadius: "24px",
          }}
        >
          <MenuItem value="ALL">Tất cả</MenuItem>
          {classOptions.map((classLabel) => (
            <MenuItem key={classLabel} value={classLabel}>
              {classLabel}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Sắp xếp"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          sx={{
            minWidth: 180,
            background: "#fff",
          }}
        >
          <MenuItem value="date_desc">Ngày mới nhất</MenuItem>
          <MenuItem value="date_asc">Ngày cũ nhất</MenuItem>
          <MenuItem value="student_desc">
            Sinh viên tham gia nhiều nhất
          </MenuItem>
          <MenuItem value="student_asc">Sinh viên tham gia ít nhất</MenuItem>
        </TextField>
      </Box>

      {filterAndSearchSchedules(instructorSchedules).length > 0 ? (
        renderScheduleList(filterAndSearchSchedules(instructorSchedules))
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 240,
            py: 4,
            gap: 2,
            boxShadow: 0,
          }}
        >
          <SearchIcon sx={{ fontSize: 56, color: "#90caf9" }} />
          <Typography variant="h6" color="text.secondary" fontWeight={600}>
            {searchTerm || filterStatus !== "ALL" || filterClass !== "ALL"
              ? "Không tìm thấy kết quả phù hợp"
              : "Không có lịch học nào"}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ opacity: 0.8 }}
          >
            {searchTerm || filterStatus !== "ALL" || filterClass !== "ALL"
              ? "Vui lòng thử lại với từ khóa hoặc bộ lọc khác."
              : "Hệ thống chưa có lịch học nào cho bạn."}
          </Typography>
        </Box>
      )}

      <Dialog
        open={openNoteDialog}
        onClose={() => !isUpdatingNote && setOpenNoteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <EditNote color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Chỉnh sửa ghi chú điểm danh
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {noteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {noteError}
            </Alert>
          )}
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Ghi chú"
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              fullWidth
              multiline
              minRows={3}
              autoFocus
              disabled={isUpdatingNote}
              error={!!noteError}
              helperText={noteError}
              InputProps={{
                sx: {
                  borderRadius: 2,
                },
              }}
            />

            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: shouldSendEmail ? "primary.main" : "divider",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: shouldSendEmail
                    ? "primary.main"
                    : "text.secondary",
                },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={shouldSendEmail}
                      onChange={(e) => setShouldSendEmail(e.target.checked)}
                      disabled={isUpdatingNote}
                      color="primary"
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Email color={shouldSendEmail ? "primary" : "action"} />
                      <Typography
                        variant="subtitle1"
                        color={shouldSendEmail ? "primary" : "text.primary"}
                        fontWeight={shouldSendEmail ? "bold" : "normal"}
                      >
                        Gửi thông báo cho sinh viên
                      </Typography>
                    </Stack>
                  }
                  sx={{ width: "100%", m: 0 }}
                />

                <Collapse in={shouldSendEmail}>
                  <Box sx={{ mt: 2, pl: 4 }}>
                    <Alert
                      severity="info"
                      icon={<Info />}
                      sx={{
                        mb: 2,
                        borderRadius: 1,
                        "& .MuiAlert-icon": {
                          color: "primary.main",
                        },
                      }}
                    >
                      Thông báo sẽ được gửi đến sinh viên qua email và hiển thị
                      trong phần thông báo của hệ thống.
                    </Alert>

                    <Stack spacing={2}>
                      <TextField
                        label="Tiêu đề thông báo"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        fullWidth
                        size="small"
                        disabled={isUpdatingNote}
                        placeholder="Ví dụ: Cập nhật điểm danh - Lớp ABC123"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Notifications fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                          sx: {
                            borderRadius: 1.5,
                          },
                        }}
                      />
                      <TextField
                        label="Nội dung thông báo"
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                        disabled={isUpdatingNote}
                        placeholder="Nhập nội dung thông báo cho sinh viên..."
                        InputProps={{
                          sx: {
                            borderRadius: 1.5,
                          },
                        }}
                      />
                    </Stack>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpenNoteDialog(false)}
            disabled={isUpdatingNote}
            sx={{
              borderRadius: 1.5,
              px: 2,
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveNote}
            disabled={
              isUpdatingNote ||
              (shouldSendEmail && (!emailSubject || !emailContent))
            }
            startIcon={
              isUpdatingNote ? <CircularProgress size={20} /> : <CheckCircle />
            }
            sx={{
              borderRadius: 1.5,
              px: 2,
            }}
          >
            {isUpdatingNote ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstructorAttendances;
