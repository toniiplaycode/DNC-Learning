import React, { useState, useMemo } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Grid,
  Button,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Timer,
  TimerOff,
  People,
  EditNote as EditNoteIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import { format, parseISO } from "date-fns";
import { TeachingSchedule } from "../../../types/teaching-schedule.types";
import { AttendanceStatus } from "../../../types/attendance.types";
import * as XLSX from "xlsx";

interface AttendanceTableProps {
  schedule: TeachingSchedule;
  onEditNote: (attendance: any, note: string) => void;
}

type SortOrder = "asc" | "desc" | "none" | "rate_desc" | "rate_asc";
type AttendanceRateFilter = "all" | "high" | "medium" | "low";

const AttendanceTable = ({ schedule, onEditNote }: AttendanceTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");
  const [attendanceRateFilter, setAttendanceRateFilter] =
    useState<AttendanceRateFilter>("all");

  const scheduleStart = new Date(schedule.startTime);
  const scheduleEnd = new Date(schedule.endTime);
  const totalDurationSeconds = Math.round(
    (scheduleEnd.getTime() - scheduleStart.getTime()) / 1000
  );

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

  const filteredAndSortedAttendances = useMemo(() => {
    if (!schedule.attendances) return [];

    let result = [...schedule.attendances];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        (attendance) =>
          attendance.studentAcademic?.studentCode
            ?.toLowerCase()
            .includes(lowerSearchTerm) ||
          attendance.studentAcademic?.fullName
            ?.toLowerCase()
            .includes(lowerSearchTerm)
      );
    }

    // Apply attendance rate filter
    if (attendanceRateFilter !== "all") {
      result = result.filter((attendance) => {
        const { duration } = formatAttendanceDuration(
          attendance.joinTime,
          attendance.leaveTime
        );
        const rate = (duration / totalDurationSeconds) * 100;

        switch (attendanceRateFilter) {
          case "high":
            return rate >= 80;
          case "medium":
            return rate >= 50 && rate < 80;
          case "low":
            return rate < 50;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    if (sortOrder !== "none") {
      result.sort((a, b) => {
        switch (sortOrder) {
          case "asc":
            return (
              a.studentAcademic?.fullName?.toLowerCase() || ""
            ).localeCompare(b.studentAcademic?.fullName?.toLowerCase() || "");
          case "desc":
            return (
              b.studentAcademic?.fullName?.toLowerCase() || ""
            ).localeCompare(a.studentAcademic?.fullName?.toLowerCase() || "");
          case "rate_desc":
            const rateA =
              formatAttendanceDuration(a.joinTime, a.leaveTime).duration /
              totalDurationSeconds;
            const rateB =
              formatAttendanceDuration(b.joinTime, b.leaveTime).duration /
              totalDurationSeconds;
            return rateB - rateA;
          case "rate_asc":
            const rateA2 =
              formatAttendanceDuration(a.joinTime, a.leaveTime).duration /
              totalDurationSeconds;
            const rateB2 =
              formatAttendanceDuration(b.joinTime, b.leaveTime).duration /
              totalDurationSeconds;
            return rateA2 - rateB2;
          default:
            return 0;
        }
      });
    }

    return result;
  }, [
    schedule.attendances,
    searchTerm,
    sortOrder,
    attendanceRateFilter,
    totalDurationSeconds,
  ]);

  const handleSortToggle = () => {
    setSortOrder((prev) => {
      switch (prev) {
        case "none":
          return "asc";
        case "asc":
          return "desc";
        case "desc":
          return "rate_desc";
        case "rate_desc":
          return "rate_asc";
        case "rate_asc":
          return "none";
        default:
          return "none";
      }
    });
  };

  const handleExportExcel = () => {
    // Prepare data for Excel
    const excelData = filteredAndSortedAttendances.map((attendance) => {
      const { duration, formattedTime } = formatAttendanceDuration(
        attendance.joinTime,
        attendance.leaveTime
      );
      const attendanceRate =
        totalDurationSeconds > 0 ? (duration / totalDurationSeconds) * 100 : 0;

      return {
        "Mã SV": attendance.studentAcademic?.studentCode || "",
        "Họ và tên": attendance.studentAcademic?.fullName || "",
        Khóa: attendance.studentAcademic?.academicYear || "",
        "Trạng thái": getAttendanceStatusText(attendance.status),
        "Thời gian tham gia": attendance.joinTime
          ? format(parseISO(attendance.joinTime), "HH:mm:ss")
          : "-",
        "Thời gian rời đi": attendance.leaveTime
          ? format(parseISO(attendance.leaveTime), "HH:mm:ss")
          : "-",
        "Thời gian tham dự": formattedTime,
        "Tỷ lệ tham dự": `${attendanceRate.toFixed(2)}%`,
        "Ghi chú": attendance.notes || "",
      };
    });

    // Add summary information (A1-A7)
    const summary = [
      ["Tiêu đề", schedule.title],
      ["Ngày học", format(parseISO(schedule.startTime), "dd/MM/yyyy")],
      [
        "Thời gian",
        `${format(parseISO(schedule.startTime), "HH:mm")} - ${format(
          parseISO(schedule.endTime),
          "HH:mm"
        )}`,
      ],
      [
        "Lớp học",
        `${schedule.academicClass?.classCode} - ${schedule.academicClass?.className}`,
      ],
      ["Giảng viên", schedule.academicClassInstructor?.instructor?.fullName],
      [],
      [],
    ];

    // Create worksheet and add summary
    const ws = XLSX.utils.aoa_to_sheet(summary);
    // Add student table with headers at A8
    XLSX.utils.sheet_add_json(ws, excelData, {
      origin: "A8",
      header: [
        "Mã SV",
        "Họ và tên",
        "Khóa",
        "Trạng thái",
        "Thời gian tham gia",
        "Thời gian rời đi",
        "Thời gian tham dự",
        "Tỷ lệ tham dự",
        "Ghi chú",
      ],
    });

    // Set column widths
    const wscols = [
      { wch: 20 }, // Mã SV
      { wch: 30 }, // Họ và tên
      { wch: 10 }, // Khóa
      { wch: 15 }, // Trạng thái
      { wch: 15 }, // Thời gian tham gia
      { wch: 15 }, // Thời gian rời đi
      { wch: 20 }, // Thời gian tham dự
      { wch: 15 }, // Tỷ lệ tham dự
      { wch: 30 }, // Ghi chú
    ];
    ws["!cols"] = wscols;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Điểm danh");

    // Generate filename
    const fileName = `DiemDanh_${schedule.academicClass?.classCode}_${format(
      parseISO(schedule.startTime),
      "ddMMyyyy"
    )}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  const getAttendanceStatusText = (status: AttendanceStatus) => {
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
        return "";
    }
  };

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm theo mã SV hoặc tên sinh viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            size="small"
            value={attendanceRateFilter}
            onChange={(e) =>
              setAttendanceRateFilter(e.target.value as AttendanceRateFilter)
            }
            label="Lọc theo tỷ lệ tham dự"
          >
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value="high">≥ 80%</MenuItem>
            <MenuItem value="medium">≥ 50% và &lt; 80%</MenuItem>
            <MenuItem value="low">&lt; 50%</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Sắp xếp"
            value={sortOrder}
            select
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SortIcon
                    sx={{
                      transform:
                        sortOrder === "desc"
                          ? "rotate(180deg)"
                          : sortOrder === "rate_desc"
                          ? "rotate(180deg)"
                          : "none",
                      transition: "transform 0.2s",
                    }}
                  />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="none">Không sắp xếp</MenuItem>
            <MenuItem value="asc">Tên A → Z</MenuItem>
            <MenuItem value="desc">Tên Z → A</MenuItem>
            <MenuItem value="rate_desc">Tỷ lệ tham dự cao nhất</MenuItem>
            <MenuItem value="rate_asc">Tỷ lệ tham dự thấp nhất</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
            disabled={!filteredAndSortedAttendances.length}
            sx={{ height: "40px" }}
          >
            Xuất Excel
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Mã SV</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography>Sinh viên</Typography>
                  <IconButton size="small" onClick={handleSortToggle}>
                    <SortIcon
                      fontSize="small"
                      color={sortOrder !== "none" ? "primary" : "inherit"}
                      sx={{
                        transform:
                          sortOrder === "desc" ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s",
                      }}
                    />
                  </IconButton>
                </Stack>
              </TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thời gian tham gia</TableCell>
              <TableCell>Thời gian rời đi</TableCell>
              <TableCell>Thời gian tham dự</TableCell>
              <TableCell>Tỷ lệ tham dự</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell align="center">Chỉnh sửa</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedAttendances.map((attendance) => {
              const { duration, formattedTime } = formatAttendanceDuration(
                attendance.joinTime,
                attendance.leaveTime
              );

              const attendanceRate =
                totalDurationSeconds > 0
                  ? (duration / totalDurationSeconds) * 100
                  : 0;
              const attendanceRateDisplay = attendanceRate.toFixed(2);

              return (
                <TableRow key={attendance.id}>
                  <TableCell>
                    {attendance.studentAcademic?.studentCode}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar
                        src={attendance.studentAcademic?.user?.avatarUrl}
                        alt={attendance.studentAcademic?.fullName}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Box>
                        <Typography variant="body2">
                          {attendance.studentAcademic?.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {attendance.studentAcademic?.academicYear}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {getAttendanceStatusChip(attendance.status)}
                  </TableCell>
                  <TableCell>
                    {attendance.joinTime ? (
                      <Tooltip
                        title={format(
                          parseISO(attendance.joinTime),
                          "dd/MM/yyyy HH:mm:ss"
                        )}
                      >
                        <Typography variant="body2">
                          {format(parseISO(attendance.joinTime), "HH:mm:ss")}
                        </Typography>
                      </Tooltip>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {attendance.leaveTime ? (
                      <Tooltip
                        title={format(
                          parseISO(attendance.leaveTime),
                          "dd/MM/yyyy HH:mm:ss"
                        )}
                      >
                        <Typography variant="body2">
                          {format(parseISO(attendance.leaveTime), "HH:mm:ss")}
                        </Typography>
                      </Tooltip>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {duration > 0 ? (
                      <Tooltip
                        title={`Tham dự ${formattedTime} trong tổng số ${Math.floor(
                          totalDurationSeconds / 60
                        )} phút của buổi học`}
                      >
                        <Chip
                          size="small"
                          label={formattedTime}
                          color={
                            attendanceRate >= 80
                              ? "success"
                              : attendanceRate >= 50
                              ? "warning"
                              : "error"
                          }
                          variant="outlined"
                        />
                      </Tooltip>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {duration > 0 ? (
                      <Tooltip
                        title={`Tham dự ${attendanceRateDisplay}% thời gian của buổi học`}
                      >
                        <Chip
                          size="small"
                          label={`${attendanceRateDisplay}%`}
                          color={
                            attendanceRate >= 80
                              ? "success"
                              : attendanceRate >= 50
                              ? "warning"
                              : "error"
                          }
                          variant="outlined"
                        />
                      </Tooltip>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {attendance.notes || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Chỉnh sửa ghi chú">
                      <IconButton
                        size="small"
                        onClick={() =>
                          onEditNote(attendance, attendance.notes || "")
                        }
                      >
                        <EditNoteIcon color="primary" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredAndSortedAttendances.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      py: 3,
                      bgcolor: "#f8fafc",
                      borderRadius: 2,
                      gap: 1,
                    }}
                  >
                    <People sx={{ fontSize: 40, color: "#90caf9" }} />
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      {searchTerm || attendanceRateFilter !== "all"
                        ? "Không tìm thấy kết quả phù hợp"
                        : "Chưa có dữ liệu điểm danh"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ opacity: 0.7 }}
                    >
                      {searchTerm || attendanceRateFilter !== "all"
                        ? "Vui lòng thử lại với từ khóa hoặc bộ lọc khác"
                        : "Danh sách điểm danh sẽ hiển thị tại đây khi có dữ liệu."}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AttendanceTable;
