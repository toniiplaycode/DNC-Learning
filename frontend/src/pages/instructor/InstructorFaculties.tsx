import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  alpha,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
} from "@mui/material";
import {
  School as SchoolIcon,
  Book as BookIcon,
  MenuBook as MenuBookIcon,
  Group as GroupIcon,
  PlayCircle as PlayCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarMonth as CalendarMonthIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectInstructorFaculty,
  selectIsInstructorFacultyLoading,
} from "../../features/faculties/facultiesSelectors";
import { fetchInstructorFaculty } from "../../features/faculties/facultiesSlice";
import { format } from "date-fns";
import { selectCurrentUser } from "../../features/auth/authSelectors";
import * as XLSX from "xlsx";

interface ProgramCourse {
  id: string;
  programId: string;
  courseId: string;
  credits: number;
  semester: number;
  practice: number;
  theory: number;
  isMandatory: boolean;
  start_time?: string | null;
  end_time?: string | null;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
  };
}

interface Program {
  id: string;
  majorId: string;
  programCode: string;
  programName: string;
  description: string;
  totalCredits: number;
  durationYears: number;
  status: string;
  programCourses: ProgramCourse[];
}

interface Major {
  id: string;
  facultyId: string;
  majorCode: string;
  majorName: string;
  description: string;
  status: string;
  programs: Program[];
}

interface Faculty {
  id: string;
  facultyCode: string;
  facultyName: string;
  description: string;
  status: string;
  majors: Major[];
}

const InstructorFaculties: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const instructorFaculty = useAppSelector(
    selectInstructorFaculty
  ) as Faculty | null;
  const isLoading = useAppSelector(selectIsInstructorFacultyLoading);
  const [expandedSemesters, setExpandedSemesters] = useState<
    Record<string, boolean>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");

  useEffect(() => {
    if (currentUser?.userInstructor?.id) {
      dispatch(fetchInstructorFaculty(Number(currentUser.userInstructor.id)));
    }
  }, [dispatch, currentUser]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleMajorFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedMajor(event.target.value);
    setSelectedProgram(""); // Reset program when major changes
  };

  const handleProgramFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedProgram(event.target.value);
  };

  const filterData = () => {
    if (!instructorFaculty) return null;

    const query = searchQuery.toLowerCase();
    let filteredFaculty = { ...instructorFaculty };

    // Filter majors
    if (selectedMajor) {
      filteredFaculty = {
        ...filteredFaculty,
        majors: filteredFaculty.majors.filter(
          (major) => major.id === selectedMajor
        ),
      };
    }

    // Filter programs within majors
    if (selectedProgram) {
      filteredFaculty = {
        ...filteredFaculty,
        majors: filteredFaculty.majors.map((major) => ({
          ...major,
          programs: major.programs.filter(
            (program) => program.id === selectedProgram
          ),
        })),
      };
    }

    // Search filter
    if (query) {
      filteredFaculty = {
        ...filteredFaculty,
        majors: filteredFaculty.majors.filter((major) => {
          const majorMatch =
            major.majorName.toLowerCase().includes(query) ||
            major.majorCode.toLowerCase().includes(query) ||
            (major.description || "").toLowerCase().includes(query);

          const programsMatch = major.programs.some((program) => {
            const programMatch =
              program.programName.toLowerCase().includes(query) ||
              program.programCode.toLowerCase().includes(query) ||
              (program.description || "").toLowerCase().includes(query);

            const coursesMatch = program.programCourses.some(
              (pc) =>
                pc.course.title.toLowerCase().includes(query) ||
                (pc.course.description || "").toLowerCase().includes(query)
            );

            return programMatch || coursesMatch;
          });

          return majorMatch || programsMatch;
        }),
      };
    }

    return filteredFaculty;
  };

  const handleExportExcel = () => {
    if (!filteredFaculty) return;

    // Prepare data for Excel
    const excelData = [];

    // Add faculty info
    excelData.push(
      ["CHƯƠNG TRÌNH ĐÀO TẠO"],
      ["Mã khoa", filteredFaculty.facultyCode],
      ["Tên khoa", filteredFaculty.facultyName],
      ["Mô tả", filteredFaculty.description],
      [
        "Trạng thái",
        filteredFaculty.status === "active"
          ? "Đang hoạt động"
          : "Không hoạt động",
      ],
      [] // Empty row for spacing
    );

    // Add majors and programs
    filteredFaculty.majors.forEach((major) => {
      excelData.push(
        ["THÔNG TIN NGÀNH"],
        ["Mã ngành", major.majorCode],
        ["Tên ngành", major.majorName],
        ["Mô tả", major.description],
        [
          "Trạng thái",
          major.status === "active" ? "Đang hoạt động" : "Không hoạt động",
        ],
        [] // Empty row for spacing
      );

      major.programs.forEach((program) => {
        excelData.push(
          ["CHƯƠNG TRÌNH ĐÀO TẠO"],
          ["Mã chương trình", program.programCode],
          ["Tên chương trình", program.programName],
          ["Mô tả", program.description],
          ["Tổng số tín chỉ", program.totalCredits],
          ["Thời gian đào tạo", `${program.durationYears} năm`],
          [
            "Trạng thái",
            program.status === "active" ? "Đang áp dụng" : "Không áp dụng",
          ],
          [] // Empty row for spacing
        );

        // Group courses by semester
        const groupedCourses = groupCoursesBySemester(program.programCourses);
        const semesters = Object.keys(groupedCourses).sort(
          (a, b) => Number(a) - Number(b)
        );

        semesters.forEach((semester) => {
          const semesterCourses = groupedCourses[Number(semester)];
          const totalCredits = calculateSemesterCredits(semesterCourses);
          const semesterDates = calculateSemesterDates(semesterCourses);

          excelData.push(
            [`HỌC KỲ ${semester}`],
            ["Tổng số môn học", semesterCourses.length],
            ["Tổng số tín chỉ", totalCredits],
            semesterDates
              ? [
                  "Thời gian",
                  `${format(
                    semesterDates.semesterStart,
                    "dd/MM/yyyy"
                  )} - ${format(semesterDates.semesterEnd, "dd/MM/yyyy")}`,
                ]
              : [],
            [] // Empty row for spacing
          );

          // Add course details
          excelData.push([
            "Mã môn",
            "Tên môn",
            "Số tín chỉ",
            "Lý thuyết",
            "Thực hành",
            "Bắt buộc",
            "Thời gian bắt đầu",
            "Thời gian kết thúc",
          ]);

          semesterCourses.forEach((pc: ProgramCourse) => {
            excelData.push([
              pc.course.id,
              pc.course.title,
              pc.credits,
              pc.theory,
              pc.practice,
              pc.isMandatory ? "Có" : "Không",
              pc.start_time
                ? format(new Date(pc.start_time), "dd/MM/yyyy")
                : "",
              pc.end_time ? format(new Date(pc.end_time), "dd/MM/yyyy") : "",
            ]);
          });

          excelData.push([]); // Empty row for spacing
        });
      });
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Mã môn
      { wch: 40 }, // Tên môn
      { wch: 12 }, // Số tín chỉ
      { wch: 12 }, // Lý thuyết
      { wch: 12 }, // Thực hành
      { wch: 12 }, // Bắt buộc
      { wch: 15 }, // Thời gian bắt đầu
      { wch: 15 }, // Thời gian kết thúc
    ];
    ws["!cols"] = colWidths;

    // Create workbook and add worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Chương trình đào tạo");

    // Generate filename with current date
    const fileName = `thong_tin_chương_trình_đào_tạo_${format(
      new Date(),
      "dd-MM-yyyy"
    )}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fileName);
  };

  const renderSearchBar = () => (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tên, mã, mô tả..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Ngành</InputLabel>
            <Select
              value={selectedMajor}
              label="Ngành"
              onChange={handleMajorFilterChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {instructorFaculty?.majors.map((major) => (
                <MenuItem key={major.id} value={major.id}>
                  {major.majorName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Chương trình</InputLabel>
            <Select
              value={selectedProgram}
              label="Chương trình"
              onChange={handleProgramFilterChange}
              disabled={!selectedMajor}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {selectedMajor &&
                instructorFaculty?.majors
                  .find((m) => m.id === selectedMajor)
                  ?.programs.map((program) => (
                    <MenuItem key={program.id} value={program.id}>
                      {program.programName}
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <Tooltip title="Tải xuống Excel">
            <Button
              variant="contained"
              color="primary"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportExcel}
              fullWidth
            >
              Tải Excel
            </Button>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!instructorFaculty || !instructorFaculty.majors) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" color="text.secondary">
          Không tìm thấy chương trình đào tạo
        </Typography>
      </Box>
    );
  }

  const filteredFaculty = filterData();
  if (!filteredFaculty) return null;

  const toggleSemester = (programId: string, semester: number) => {
    const key = `${programId}-${semester}`;
    setExpandedSemesters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const calculateSemesterDates = (courses: any[]) => {
    const validDates = courses.filter(
      (course) => course.start_time && course.end_time
    );
    if (validDates.length === 0) return null;

    const startDates = validDates.map((course) => new Date(course.start_time));
    const endDates = validDates.map((course) => new Date(course.end_time));

    const semesterStart = new Date(
      Math.min(...startDates.map((date) => date.getTime()))
    );
    const semesterEnd = new Date(
      Math.max(...endDates.map((date) => date.getTime()))
    );

    return { semesterStart, semesterEnd };
  };

  const calculateSemesterCredits = (courses: any[]) => {
    return courses.reduce((total, course) => total + course.credits, 0);
  };

  const groupCoursesBySemester = (programCourses: any[]) => {
    const sortedCourses = [...programCourses].sort(
      (a, b) => a.semester - b.semester
    );
    return sortedCourses.reduce((acc, course) => {
      const semester = course.semester;
      if (!acc[semester]) {
        acc[semester] = [];
      }
      acc[semester].push(course);
      return acc;
    }, {} as Record<number, any[]>);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
        Chương trình đào tạo
      </Typography>

      {renderSearchBar()}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Loại</TableCell>
              <TableCell>Mã</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Thông tin</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SchoolIcon color="primary" />
                  <Typography sx={{ fontWeight: "bold" }}>Khoa</Typography>
                </Box>
              </TableCell>
              <TableCell>{filteredFaculty.facultyCode}</TableCell>
              <TableCell>{filteredFaculty.facultyName}</TableCell>
              <TableCell>
                <Typography noWrap sx={{ maxWidth: 300 }}>
                  {filteredFaculty.description}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={
                    filteredFaculty.status === "active"
                      ? "Đang hoạt động"
                      : "Không hoạt động"
                  }
                  color={
                    filteredFaculty.status === "active" ? "success" : "error"
                  }
                />
              </TableCell>
            </TableRow>

            {filteredFaculty.majors.map((major) => (
              <React.Fragment key={major.id}>
                <TableRow sx={{ backgroundColor: alpha("#f5f5f5", 0.3) }}>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        pl: 4,
                      }}
                    >
                      <MenuBookIcon color="primary" />
                      <Typography sx={{ fontWeight: "bold" }}>Ngành</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{major.majorCode}</TableCell>
                  <TableCell>{major.majorName}</TableCell>
                  <TableCell>
                    <Typography noWrap sx={{ maxWidth: 300 }}>
                      {major.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        major.status === "active"
                          ? "Đang hoạt động"
                          : "Không hoạt động"
                      }
                      color={major.status === "active" ? "success" : "error"}
                    />
                  </TableCell>
                </TableRow>

                {major.programs.map((program) => (
                  <React.Fragment key={program.id}>
                    <TableRow sx={{ backgroundColor: alpha("#f5f5f5", 0.1) }}>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            pl: 8,
                          }}
                        >
                          <GroupIcon color="primary" />
                          <Typography sx={{ fontWeight: "bold" }}>
                            Chương trình đào tạo
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              ({program.programCourses.length} môn học)
                            </Typography>
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{program.programCode}</TableCell>
                      <TableCell>{program.programName}</TableCell>
                      <TableCell>
                        <Typography noWrap sx={{ maxWidth: 300 }}>
                          {program.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            size="small"
                            label={
                              program.status === "active"
                                ? "Đang áp dụng"
                                : "Không áp dụng"
                            }
                            color={
                              program.status === "active" ? "success" : "error"
                            }
                          />
                          <Chip
                            size="small"
                            icon={<SchoolIcon fontSize="small" />}
                            label={`${program.totalCredits} tín chỉ`}
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            icon={<CalendarMonthIcon fontSize="small" />}
                            label={`${program.durationYears} năm học`}
                            color="info"
                            variant="outlined"
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>

                    {(() => {
                      const groupedCourses = groupCoursesBySemester(
                        program.programCourses
                      );
                      const semesters = Object.keys(groupedCourses).sort(
                        (a, b) => Number(a) - Number(b)
                      );

                      return semesters.map((semester) => {
                        const semesterKey = `${program.id}-${semester}`;
                        const isExpanded =
                          expandedSemesters[semesterKey] ?? false;
                        const semesterCourses =
                          groupedCourses[Number(semester)];
                        const totalCredits =
                          calculateSemesterCredits(semesterCourses);
                        const semesterDates =
                          calculateSemesterDates(semesterCourses);

                        return (
                          <React.Fragment key={`semester-${semester}`}>
                            <TableRow
                              sx={{ backgroundColor: alpha("#e3f2fd", 0.3) }}
                            >
                              <TableCell colSpan={5}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    pl: 12,
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    toggleSemester(program.id, Number(semester))
                                  }
                                >
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSemester(
                                        program.id,
                                        Number(semester)
                                      );
                                    }}
                                  >
                                    {isExpanded ? (
                                      <ExpandLessIcon
                                        fontSize="small"
                                        color="primary"
                                      />
                                    ) : (
                                      <ExpandMoreIcon
                                        fontSize="small"
                                        color="primary"
                                      />
                                    )}
                                  </IconButton>
                                  <CalendarMonthIcon color="primary" />
                                  <Typography
                                    variant="subtitle2"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    Học kỳ {semester}
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ ml: 1 }}
                                    >
                                      ({semesterCourses.length} môn học -{" "}
                                      {totalCredits} tín chỉ)
                                    </Typography>
                                    {semesterDates && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ display: "block", mt: 0.5 }}
                                      >
                                        {format(
                                          semesterDates.semesterStart,
                                          "dd/MM/yyyy"
                                        )}{" "}
                                        -{" "}
                                        {format(
                                          semesterDates.semesterEnd,
                                          "dd/MM/yyyy"
                                        )}
                                      </Typography>
                                    )}
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>

                            {isExpanded &&
                              semesterCourses.map((pc: ProgramCourse) => (
                                <TableRow key={pc.id}>
                                  <TableCell>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        pl: 12,
                                        ml: "60px",
                                      }}
                                    >
                                      <PlayCircleIcon color="primary" />
                                      <Typography>Môn học</Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>{pc.course.id}</TableCell>
                                  <TableCell>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                      }}
                                    >
                                      <Box
                                        component="img"
                                        src={pc.course.thumbnailUrl}
                                        alt={pc.course.title}
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          objectFit: "cover",
                                          borderRadius: 1,
                                          border: "1px solid",
                                          borderColor: "divider",
                                        }}
                                      />
                                      <Typography>{pc.course.title}</Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography noWrap sx={{ maxWidth: 300 }}>
                                      {pc.course.description}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Stack direction="row" spacing={1}>
                                      {pc.start_time && pc.end_time && (
                                        <Chip
                                          size="small"
                                          icon={
                                            <CalendarMonthIcon fontSize="small" />
                                          }
                                          label={`${format(
                                            new Date(pc.start_time),
                                            "dd/MM/yyyy"
                                          )} - ${format(
                                            new Date(pc.end_time),
                                            "dd/MM/yyyy"
                                          )}`}
                                          color="info"
                                        />
                                      )}
                                      <Chip
                                        size="small"
                                        label={`${pc.credits} tín chỉ`}
                                        color="primary"
                                      />
                                      <Chip
                                        size="small"
                                        label={`LT: ${pc.theory} | TH: ${pc.practice}`}
                                        color="secondary"
                                      />
                                      <Chip
                                        size="small"
                                        label={
                                          pc.isMandatory
                                            ? "Bắt buộc"
                                            : "Tự chọn"
                                        }
                                        color={
                                          pc.isMandatory ? "error" : "success"
                                        }
                                      />
                                    </Stack>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </React.Fragment>
                        );
                      });
                    })()}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InstructorFaculties;
