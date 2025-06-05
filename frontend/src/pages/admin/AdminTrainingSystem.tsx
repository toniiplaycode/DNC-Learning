import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Tooltip,
  Stack,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Book as BookIcon,
  MenuBook as MenuBookIcon,
  Computer as ComputerIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  BookOnline as BookOnlineIcon,
  GroupWork as GroupWorkIcon,
  PlayCircle,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchFaculties,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} from "../../features/faculties/facultiesSlice";
import {
  createMajor,
  updateMajor,
  deleteMajor,
} from "../../features/majors/majorsSlice";
import {
  createProgram,
  updateProgram,
  deleteProgram,
} from "../../features/programs/programsSlice";
import {
  selectAllFaculties,
  selectFacultiesStatus,
  selectFacultiesError,
} from "../../features/faculties/facultiesSelectors";
import {
  CreateFacultyDto,
  FacultyStatus,
  UpdateFacultyDto,
} from "../../types/faculty.types";
import {
  CreateMajorDto,
  MajorStatus,
  UpdateMajorDto,
} from "../../types/major.types";
import {
  CreateProgramDto,
  ProgramStatus,
  UpdateProgramDto,
} from "../../types/program.types";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchCourses } from "../../features/courses/coursesApiSlice";
import { selectAllCourses } from "../../features/courses/coursesSelector";
import {
  createProgramCourse,
  updateProgramCourse,
  deleteProgramCourse,
} from "../../features/program-courses/programCoursesSlice";
import { format } from "date-fns";

interface Course {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  instructorId: string;
  price: string;
  for: string;
  level: string;
  status: string;
  thumbnailUrl: string;
  required: string;
  learned: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProgramCourse {
  id: string;
  programId: string;
  courseId: string;
  credits: number;
  isMandatory: boolean;
  createdAt: string;
  updatedAt: string;
  course: Course;
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
  createdAt: string;
  updatedAt: string;
  programCourses: ProgramCourse[];
}

interface Major {
  id: string;
  facultyId: string;
  majorCode: string;
  majorName: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  programs: Program[];
}

interface Faculty {
  id: string;
  facultyCode: string;
  facultyName: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  majors: Major[];
}

interface DialogState {
  open: boolean;
  type: "faculty" | "major" | "program" | "course" | "delete";
  parentId?: string;
  data?: any;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "success";
    case "inactive":
      return "error";
    default:
      return "default";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return <CheckCircleIcon fontSize="small" />;
    case "inactive":
      return <CancelIcon fontSize="small" />;
    default:
      return <InfoIcon fontSize="small" />;
  }
};

const AdminTrainingSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  const faculties = useAppSelector(selectAllFaculties) as unknown as Faculty[];
  const courses = useAppSelector(selectAllCourses) as unknown as Course[];
  const facultiesStatus = useAppSelector(selectFacultiesStatus);
  const facultiesError = useAppSelector(selectFacultiesError);
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    type: "faculty",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<
    "all" | "faculty" | "major" | "program" | "course"
  >("all");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [newFaculty, setNewFaculty] = useState<CreateFacultyDto>({
    facultyCode: "",
    facultyName: "",
    description: "",
    status: FacultyStatus.ACTIVE,
  });
  const [editFaculty, setEditFaculty] = useState<UpdateFacultyDto>({
    facultyCode: "",
    facultyName: "",
    description: "",
    status: FacultyStatus.ACTIVE,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: DialogState["type"];
    id: string;
    name: string;
  }>({
    open: false,
    type: "faculty",
    id: "",
    name: "",
  });
  const [newMajor, setNewMajor] = useState<CreateMajorDto>({
    facultyId: 0,
    majorCode: "",
    majorName: "",
    description: "",
    status: MajorStatus.ACTIVE,
  });
  const [editMajor, setEditMajor] = useState<UpdateMajorDto>({
    majorCode: "",
    majorName: "",
    description: "",
    status: MajorStatus.ACTIVE,
  });
  const [newProgram, setNewProgram] = useState<CreateProgramDto>({
    majorId: 0,
    programCode: "",
    programName: "",
    description: "",
    totalCredits: 0,
    durationYears: 4,
    status: ProgramStatus.ACTIVE,
  });
  const [editProgram, setEditProgram] = useState<UpdateProgramDto>({
    programCode: "",
    programName: "",
    description: "",
    totalCredits: 0,
    durationYears: 4,
    status: ProgramStatus.ACTIVE,
  });
  const [newCourse, setNewCourse] = useState<{
    courseId: number;
    credits: number;
    isMandatory: boolean;
  }>({
    courseId: 0,
    credits: 3,
    isMandatory: true,
  });
  const [editProgramCourse, setEditProgramCourse] = useState<{
    id: number;
    credits: number;
    isMandatory: boolean;
  }>({
    id: 0,
    credits: 3,
    isMandatory: true,
  });

  useEffect(() => {
    if (facultiesStatus === "idle") {
      dispatch(fetchFaculties());
    }
  }, [facultiesStatus, dispatch]);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleOpenDialog = (
    type: DialogState["type"],
    parentId?: string,
    data?: any
  ) => {
    if (type === "faculty" && data) {
      const faculty = faculties.find((f) => f.id === data.id);
      if (faculty) {
        setEditFaculty({
          facultyCode: faculty.facultyCode,
          facultyName: faculty.facultyName,
          description: faculty.description || "",
          status: faculty.status as FacultyStatus,
        });
      }
    } else if (type === "major") {
      if (data) {
        // Edit mode
        const major = faculties
          .find((f) => f.id === parentId)
          ?.majors.find((m) => m.id === data.id);
        if (major) {
          setEditMajor({
            majorCode: major.majorCode,
            majorName: major.majorName,
            description: major.description || "",
            status: major.status as MajorStatus,
          });
        }
      } else {
        // Create mode
        setNewMajor((prev) => ({
          ...prev,
          facultyId: Number(parentId),
        }));
      }
    } else if (type === "program") {
      if (data) {
        // Edit mode
        const program = faculties
          .find((f) => f.majors.some((m) => m.id === parentId))
          ?.majors.find((m) => m.id === parentId)
          ?.programs.find((p) => p.id === data.id);
        if (program) {
          setEditProgram({
            programCode: program.programCode,
            programName: program.programName,
            description: program.description || "",
            totalCredits: program.totalCredits,
            durationYears: program.durationYears,
            status: program.status as ProgramStatus,
          });
        }
      } else {
        // Create mode
        setNewProgram((prev) => ({
          ...prev,
          majorId: Number(parentId),
        }));
      }
    } else if (type === "course" && data) {
      // Edit mode for program course
      const programCourse = faculties
        .find((f) =>
          f.majors.some((m) => m.programs.some((p) => p.id === parentId))
        )
        ?.majors.find((m) => m.programs.some((p) => p.id === parentId))
        ?.programs.find((p) => p.id === parentId)
        ?.programCourses.find((pc) => pc.id === data.id);

      if (programCourse) {
        setEditProgramCourse({
          id: Number(programCourse.id),
          credits: programCourse.credits,
          isMandatory: programCourse.isMandatory,
        });
      }
    }
    setDialogState({
      open: true,
      type,
      parentId,
      data,
    });
  };

  const handleCloseDialog = () => {
    setDialogState({
      open: false,
      type: "faculty",
    });
  };

  const handleSave = async () => {
    const { type, data, parentId } = dialogState;

    if (type === "faculty") {
      try {
        if (data) {
          await dispatch(
            updateFaculty({
              id: data.id,
              updateDto: editFaculty,
            })
          ).unwrap();
        } else {
          await dispatch(createFaculty(newFaculty)).unwrap();
          setNewFaculty({
            facultyCode: "",
            facultyName: "",
            description: "",
            status: FacultyStatus.ACTIVE,
          });
        }
        dispatch(fetchFaculties());
        handleCloseDialog();
      } catch (error) {
        console.error("Failed to save faculty:", error);
      }
    } else if (type === "major" && parentId) {
      try {
        if (data) {
          // Update existing major
          await dispatch(
            updateMajor({
              id: data.id,
              updateDto: editMajor,
            })
          ).unwrap();
        } else {
          // Create new major
          await dispatch(createMajor(newMajor)).unwrap();
          // Reset form
          setNewMajor({
            facultyId: 0,
            majorCode: "",
            majorName: "",
            description: "",
            status: MajorStatus.ACTIVE,
          });
        }
        dispatch(fetchFaculties());
        handleCloseDialog();
      } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra khi lưu ngành");
      }
    } else if (type === "program" && parentId) {
      try {
        if (data) {
          // Update existing program
          await dispatch(
            updateProgram({
              id: data.id,
              updateDto: editProgram,
            })
          ).unwrap();
        } else {
          // Create new program
          await dispatch(createProgram(newProgram)).unwrap();
          // Reset form
          setNewProgram({
            majorId: 0,
            programCode: "",
            programName: "",
            description: "",
            totalCredits: 0,
            durationYears: 4,
            status: ProgramStatus.ACTIVE,
          });
        }
        dispatch(fetchFaculties());
        handleCloseDialog();
      } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra khi lưu chương trình");
      }
    } else if (type === "course" && parentId) {
      try {
        if (data) {
          // Update existing program course
          await dispatch(
            updateProgramCourse({
              id: editProgramCourse.id,
              updateDto: {
                credits: editProgramCourse.credits,
                isMandatory: editProgramCourse.isMandatory,
              },
            })
          ).unwrap();
          toast.success("Cập nhật môn học thành công");
        } else {
          // Create new program course
          await dispatch(
            createProgramCourse({
              programId: Number(parentId),
              courseId: newCourse.courseId,
              credits: newCourse.credits,
              isMandatory: newCourse.isMandatory,
            })
          ).unwrap();
          // Reset form
          setNewCourse({
            courseId: 0,
            credits: 3,
            isMandatory: true,
          });
          toast.success("Thêm môn học thành công");
        }

        dispatch(fetchFaculties());
        handleCloseDialog();
      } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra khi thao tác với môn học");
      }
    }
  };

  const handleDelete = async (type: DialogState["type"], id: string) => {
    if (type === "faculty") {
      const faculty = faculties.find((f) => f.id === id);
      if (!faculty) return;

      // Kiểm tra xem khoa có ngành con không
      if (faculty.majors && faculty.majors.length > 0) {
        toast.error(
          "Không thể xóa khoa đang có ngành con. Vui lòng xóa các ngành trước."
        );
        return;
      }

      // Mở dialog xác nhận xóa
      setDeleteDialog({
        open: true,
        type: "faculty",
        id: id,
        name: faculty.facultyName,
      });
    } else if (type === "major") {
      const faculty = faculties.find((f) => f.majors.some((m) => m.id === id));
      if (!faculty) return;

      const major = faculty.majors.find((m) => m.id === id);
      if (!major) return;

      // Kiểm tra xem ngành có chương trình con không
      if (major.programs && major.programs.length > 0) {
        toast.error(
          "Không thể xóa ngành đang có chương trình con. Vui lòng xóa các chương trình trước."
        );
        return;
      }

      // Mở dialog xác nhận xóa
      setDeleteDialog({
        open: true,
        type: "major",
        id: id,
        name: major.majorName,
      });
    } else if (type === "program") {
      const faculty = faculties.find((f) =>
        f.majors.some((m) => m.programs.some((p) => p.id === id))
      );
      if (!faculty) return;

      const major = faculty.majors.find((m) =>
        m.programs.some((p) => p.id === id)
      );
      if (!major) return;

      const program = major.programs.find((p) => p.id === id);
      if (!program) return;

      // Kiểm tra xem chương trình có môn học con không
      if (program.programCourses && program.programCourses.length > 0) {
        toast.error(
          "Không thể xóa chương trình đang có môn học. Vui lòng xóa các môn học trước."
        );
        return;
      }

      // Mở dialog xác nhận xóa
      setDeleteDialog({
        open: true,
        type: "program",
        id: id,
        name: program.programName,
      });
    } else if (type === "course") {
      // Find the program course to get its name
      const faculty = faculties.find((f) =>
        f.majors.some((m) =>
          m.programs.some((p) => p.programCourses.some((pc) => pc.id === id))
        )
      );
      if (!faculty) return;

      const major = faculty.majors.find((m) =>
        m.programs.some((p) => p.programCourses.some((pc) => pc.id === id))
      );
      if (!major) return;

      const program = major.programs.find((p) =>
        p.programCourses.some((pc) => pc.id === id)
      );
      if (!program) return;

      const programCourse = program.programCourses.find((pc) => pc.id === id);
      if (!programCourse) return;

      // Open delete confirmation dialog
      setDeleteDialog({
        open: true,
        type: "course",
        id: id,
        name: programCourse.course.title,
      });
    }
  };

  const handleConfirmDelete = async () => {
    const { type, id } = deleteDialog;

    if (type === "faculty") {
      try {
        await dispatch(deleteFaculty(Number(id))).unwrap();
        dispatch(fetchFaculties());
        toast.success("Xóa khoa thành công");
      } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra khi xóa khoa");
      }
    } else if (type === "major") {
      try {
        await dispatch(deleteMajor(Number(id))).unwrap();
        dispatch(fetchFaculties());
        toast.success("Xóa ngành thành công");
      } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra khi xóa ngành");
      }
    } else if (type === "program") {
      try {
        await dispatch(deleteProgram(Number(id))).unwrap();
        dispatch(fetchFaculties());
        toast.success("Xóa chương trình thành công");
      } catch (error: any) {
        toast.error(error.message || "Có lỗi xảy ra khi xóa chương trình");
      }
    } else if (type === "course") {
      try {
        await dispatch(deleteProgramCourse(Number(id))).unwrap();
        dispatch(fetchFaculties());
        toast.success("Xóa môn học khỏi chương trình thành công");
      } catch (error: any) {
        toast.error(
          error.message || "Có lỗi xảy ra khi xóa môn học khỏi chương trình"
        );
      }
    }

    setDeleteDialog((prev) => ({ ...prev, open: false }));
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog((prev) => ({ ...prev, open: false }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  const handleSearchTypeChange = (
    event: SelectChangeEvent<"all" | "faculty" | "major" | "program" | "course">
  ) => {
    const value = event.target.value as
      | "all"
      | "faculty"
      | "major"
      | "program"
      | "course";
    setSearchType(value);
  };

  const handleFacultyFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedFaculty(event.target.value);
    setSelectedMajor(""); // Reset major when faculty changes
    setSelectedProgram(""); // Reset program when faculty changes
  };

  const handleMajorFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedMajor(event.target.value);
    setSelectedProgram(""); // Reset program when major changes
  };

  const handleProgramFilterChange = (event: SelectChangeEvent<string>) => {
    setSelectedProgram(event.target.value);
  };

  const handleInputChange =
    (
      field:
        | keyof CreateFacultyDto
        | keyof UpdateFacultyDto
        | keyof CreateMajorDto
        | keyof UpdateMajorDto
        | keyof CreateProgramDto
        | keyof UpdateProgramDto
    ) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { type, data } = dialogState;
      if (type === "faculty") {
        if (data) {
          setEditFaculty((prev) => ({
            ...prev,
            [field]: event.target.value,
          }));
        } else {
          setNewFaculty((prev) => ({
            ...prev,
            [field]: event.target.value,
          }));
        }
      } else if (type === "major") {
        if (data) {
          setEditMajor((prev) => ({
            ...prev,
            [field]: event.target.value,
          }));
        } else {
          setNewMajor((prev) => ({
            ...prev,
            [field]: event.target.value,
          }));
        }
      } else if (type === "program") {
        const value =
          event.target.type === "number"
            ? Number(event.target.value)
            : event.target.value;

        if (data) {
          setEditProgram((prev) => ({
            ...prev,
            [field]: value,
          }));
        } else {
          setNewProgram((prev) => ({
            ...prev,
            [field]: value,
          }));
        }
      }
    };

  const filterData = () => {
    const query = searchQuery.toLowerCase();
    let filteredFaculties = faculties;

    // Sort majors by createdAt in descending order (newest first)
    filteredFaculties = filteredFaculties.map((faculty) => ({
      ...faculty,
      majors: Array.from(faculty.majors || [])
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .map((major) => ({
          ...major,
          // Sort programs by createdAt in descending order (newest first)
          programs: Array.from(major.programs || [])
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .map((program) => ({
              ...program,
              // Sort program courses by createdAt in descending order (newest first)
              programCourses: Array.from(program.programCourses || []).sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              ),
            })),
        })),
    }));

    // Filter by faculty
    if (selectedFaculty) {
      filteredFaculties = filteredFaculties.filter(
        (faculty) => faculty.id === selectedFaculty
      );
    }

    // Filter by major
    if (selectedMajor) {
      filteredFaculties = filteredFaculties.map((faculty) => ({
        ...faculty,
        majors: Array.from(faculty.majors || []).filter(
          (major) => major.id === selectedMajor
        ),
      }));
    }

    // Filter by program
    if (selectedProgram) {
      filteredFaculties = filteredFaculties.map((faculty) => ({
        ...faculty,
        majors: Array.from(faculty.majors || []).map((major) => ({
          ...major,
          programs: Array.from(major.programs || []).filter(
            (program) => program.id === selectedProgram
          ),
        })),
      }));
    }

    // Filter by search query
    if (!query) return filteredFaculties;

    return filteredFaculties.filter((faculty) => {
      const facultyMatch =
        faculty.facultyName.toLowerCase().includes(query) ||
        faculty.facultyCode.toLowerCase().includes(query) ||
        (faculty.description || "").toLowerCase().includes(query);

      const majorsMatch = Array.from(faculty.majors || []).some((major) => {
        const majorMatch =
          major.majorName.toLowerCase().includes(query) ||
          major.majorCode.toLowerCase().includes(query) ||
          (major.description || "").toLowerCase().includes(query);

        const programsMatch = Array.from(major.programs || []).some(
          (program) => {
            const programMatch =
              program.programName.toLowerCase().includes(query) ||
              program.programCode.toLowerCase().includes(query) ||
              (program.description || "").toLowerCase().includes(query);

            const coursesMatch = Array.from(program.programCourses || []).some(
              (pc) =>
                pc.course.title.toLowerCase().includes(query) ||
                (pc.course.description || "").toLowerCase().includes(query)
            );

            return programMatch || coursesMatch;
          }
        );

        return majorMatch || programsMatch;
      });

      return facultyMatch || majorsMatch;
    });
  };

  const renderSearchBar = () => (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Khoa</InputLabel>
            <Select
              value={selectedFaculty}
              label="Khoa"
              onChange={handleFacultyFilterChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {faculties.map((faculty) => (
                <MenuItem key={faculty.id} value={faculty.id}>
                  {faculty.facultyName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Ngành</InputLabel>
            <Select
              value={selectedMajor}
              label="Ngành"
              onChange={handleMajorFilterChange}
              disabled={!selectedFaculty}
            >
              <MenuItem value="">Tất cả</MenuItem>
              {selectedFaculty &&
                faculties
                  .find((f) => f.id === selectedFaculty)
                  ?.majors.map((major) => (
                    <MenuItem key={major.id} value={major.id}>
                      {major.majorName}
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
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
                faculties
                  .find((f) => f.id === selectedFaculty)
                  ?.majors.find((m) => m.id === selectedMajor)
                  ?.programs.map((program) => (
                    <MenuItem key={program.id} value={program.id}>
                      {program.programName}
                    </MenuItem>
                  ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Loại</InputLabel>
            <Select
              value={searchType}
              label="Loại"
              onChange={handleSearchTypeChange}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="faculty">Khoa</MenuItem>
              <MenuItem value="major">Ngành</MenuItem>
              <MenuItem value="program">Chương trình</MenuItem>
              <MenuItem value="course">Môn học</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );

  const renderTableView = () => {
    const filteredData = filterData();

    if (facultiesStatus === "loading") {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (facultiesStatus === "failed") {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {facultiesError || "Có lỗi xảy ra khi tải dữ liệu"}
        </Alert>
      );
    }

    if (!faculties || faculties.length === 0) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert severity="info">Chưa có dữ liệu khoa</Alert>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ color: "primary.main", fontWeight: "bold" }}>
            Thêm mới khoa
          </Typography>
          {renderAddButton("faculty")}
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Loại</TableCell>
              <TableCell>Mã</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((faculty) => (
              <React.Fragment key={faculty.id}>
                <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SchoolIcon color="primary" />
                      <Typography>Khoa</Typography>
                      {renderAddButton("major", faculty.id)}
                    </Box>
                  </TableCell>
                  <TableCell>{faculty.facultyCode}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {faculty.facultyName}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography noWrap sx={{ maxWidth: 300 }}>
                      {faculty.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={getStatusIcon(faculty.status)}
                      label={
                        faculty.status === "active"
                          ? "Đang hoạt động"
                          : "Không hoạt động"
                      }
                      color={getStatusColor(faculty.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {renderActionButtons("faculty", faculty.id)}
                  </TableCell>
                </TableRow>
                {faculty.majors &&
                  faculty.majors.map((major) => (
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
                            <Typography>Ngành</Typography>
                            {renderAddButton("program", major.id)}
                          </Box>
                        </TableCell>
                        <TableCell>{major.majorCode}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {major.majorName}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography noWrap sx={{ maxWidth: 300 }}>
                            {major.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            icon={getStatusIcon(major.status)}
                            label={
                              major.status === "active"
                                ? "Đang hoạt động"
                                : "Không hoạt động"
                            }
                            color={getStatusColor(major.status)}
                          />
                        </TableCell>
                        <TableCell>
                          {renderActionButtons("major", major.id, faculty.id)}
                        </TableCell>
                      </TableRow>
                      {major.programs.map((program) => (
                        <React.Fragment key={program.id}>
                          <TableRow
                            sx={{ backgroundColor: alpha("#f5f5f5", 0.1) }}
                          >
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
                                <Typography>
                                  Chương trình đào tạo -{" "}
                                  {format(new Date(program.createdAt), "yyyy")}
                                  {renderAddButton("course", program.id)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{program.programCode}</TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {program.programName}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography noWrap sx={{ maxWidth: 300 }}>
                                {program.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                icon={getStatusIcon(program.status)}
                                label={
                                  program.status === "active"
                                    ? "Đang áp dụng"
                                    : "Không áp dụng"
                                }
                                color={getStatusColor(program.status)}
                              />
                            </TableCell>
                            <TableCell>
                              {renderActionButtons(
                                "program",
                                program.id,
                                major.id
                              )}
                            </TableCell>
                          </TableRow>
                          {program.programCourses.map((pc) => (
                            <TableRow key={pc.id}>
                              <TableCell>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    pl: 12,
                                  }}
                                >
                                  <PlayCircle color="primary" />
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
                                  <Chip
                                    size="small"
                                    label={`${pc.credits} tín chỉ`}
                                    color="primary"
                                  />
                                  <Chip
                                    size="small"
                                    label={
                                      pc.isMandatory ? "Bắt buộc" : "Tự chọn"
                                    }
                                    color={pc.isMandatory ? "error" : "success"}
                                  />
                                </Stack>
                              </TableCell>
                              <TableCell>
                                {renderActionButtons(
                                  "course",
                                  pc.id,
                                  program.id
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </React.Fragment>
                      ))}
                    </React.Fragment>
                  ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderDialog = () => {
    const { type, data, parentId } = dialogState;
    const isEdit = !!data;

    // Get existing program courses when adding a new course
    const existingProgramCourses = React.useMemo(() => {
      if (type === "course" && parentId) {
        const faculty = faculties.find((f) =>
          f.majors.some((m) => m.programs.some((p) => p.id === parentId))
        );
        if (faculty) {
          const major = faculty.majors.find((m) =>
            m.programs.some((p) => p.id === parentId)
          );
          if (major) {
            const program = major.programs.find((p) => p.id === parentId);
            if (program) {
              return program.programCourses.map((pc) => pc.courseId);
            }
          }
        }
      }
      return [];
    }, [type, parentId, faculties]);

    // Get course info when editing
    const editingCourse = React.useMemo(() => {
      if (type === "course" && data && parentId) {
        const programCourse = faculties
          .find((f) =>
            f.majors.some((m) => m.programs.some((p) => p.id === parentId))
          )
          ?.majors.find((m) => m.programs.some((p) => p.id === parentId))
          ?.programs.find((p) => p.id === parentId)
          ?.programCourses.find((pc) => pc.id === data.id);

        return programCourse?.course;
      }
      return null;
    }, [type, data, parentId, faculties]);

    const validateProgram = (program: UpdateProgramDto | CreateProgramDto) => {
      return {
        hasValidCode: !!program.programCode,
        hasValidName: !!program.programName,
        hasValidCredits:
          typeof program.totalCredits === "number" && program.totalCredits > 0,
        hasValidDuration:
          typeof program.durationYears === "number" &&
          program.durationYears >= 1,
      };
    };

    const programValidation = isEdit
      ? validateProgram(editProgram)
      : validateProgram(newProgram);

    return (
      <Dialog
        open={dialogState.open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEdit ? "Chỉnh sửa" : "Thêm mới"}{" "}
          {type === "faculty"
            ? "khoa"
            : type === "major"
            ? "ngành"
            : type === "program"
            ? "chương trình đào tạo"
            : "môn học"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {type === "faculty" && (
              <>
                <TextField
                  label="Mã khoa"
                  fullWidth
                  value={
                    isEdit ? editFaculty.facultyCode : newFaculty.facultyCode
                  }
                  onChange={handleInputChange("facultyCode")}
                  required
                  error={
                    isEdit ? !editFaculty.facultyCode : !newFaculty.facultyCode
                  }
                  helperText={
                    isEdit
                      ? !editFaculty.facultyCode
                        ? "Vui lòng nhập mã khoa"
                        : ""
                      : !newFaculty.facultyCode
                      ? "Vui lòng nhập mã khoa"
                      : ""
                  }
                />
                <TextField
                  label="Tên khoa"
                  fullWidth
                  value={
                    isEdit ? editFaculty.facultyName : newFaculty.facultyName
                  }
                  onChange={handleInputChange("facultyName")}
                  required
                  error={
                    isEdit ? !editFaculty.facultyName : !newFaculty.facultyName
                  }
                  helperText={
                    isEdit
                      ? !editFaculty.facultyName
                        ? "Vui lòng nhập tên khoa"
                        : ""
                      : !newFaculty.facultyName
                      ? "Vui lòng nhập tên khoa"
                      : ""
                  }
                />
                <TextField
                  label="Mô tả"
                  fullWidth
                  multiline
                  rows={3}
                  value={
                    isEdit ? editFaculty.description : newFaculty.description
                  }
                  onChange={handleInputChange("description")}
                />
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={isEdit ? editFaculty.status : newFaculty.status}
                    label="Trạng thái"
                    onChange={(e) => {
                      const value = e.target.value as FacultyStatus;
                      if (isEdit) {
                        setEditFaculty((prev) => ({
                          ...prev,
                          status: value,
                        }));
                      } else {
                        setNewFaculty((prev) => ({
                          ...prev,
                          status: value,
                        }));
                      }
                    }}
                  >
                    <MenuItem value={FacultyStatus.ACTIVE}>
                      Đang hoạt động
                    </MenuItem>
                    <MenuItem value={FacultyStatus.INACTIVE}>
                      Không hoạt động
                    </MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            {type === "major" && (
              <>
                <TextField
                  label="Mã ngành"
                  fullWidth
                  value={isEdit ? editMajor.majorCode : newMajor.majorCode}
                  onChange={handleInputChange("majorCode")}
                  required
                  error={isEdit ? !editMajor.majorCode : !newMajor.majorCode}
                  helperText={
                    isEdit
                      ? !editMajor.majorCode
                        ? "Vui lòng nhập mã ngành"
                        : ""
                      : !newMajor.majorCode
                      ? "Vui lòng nhập mã ngành"
                      : ""
                  }
                />
                <TextField
                  label="Tên ngành"
                  fullWidth
                  value={isEdit ? editMajor.majorName : newMajor.majorName}
                  onChange={handleInputChange("majorName")}
                  required
                  error={isEdit ? !editMajor.majorName : !newMajor.majorName}
                  helperText={
                    isEdit
                      ? !editMajor.majorName
                        ? "Vui lòng nhập tên ngành"
                        : ""
                      : !newMajor.majorName
                      ? "Vui lòng nhập tên ngành"
                      : ""
                  }
                />
                <TextField
                  label="Mô tả"
                  fullWidth
                  multiline
                  rows={3}
                  value={isEdit ? editMajor.description : newMajor.description}
                  onChange={handleInputChange("description")}
                />
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={isEdit ? editMajor.status : newMajor.status}
                    label="Trạng thái"
                    onChange={(e) => {
                      const value = e.target.value as MajorStatus;
                      if (isEdit) {
                        setEditMajor((prev) => ({
                          ...prev,
                          status: value,
                        }));
                      } else {
                        setNewMajor((prev) => ({
                          ...prev,
                          status: value,
                        }));
                      }
                    }}
                  >
                    <MenuItem value={MajorStatus.ACTIVE}>
                      Đang hoạt động
                    </MenuItem>
                    <MenuItem value={MajorStatus.INACTIVE}>
                      Không hoạt động
                    </MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            {type === "program" && (
              <>
                <TextField
                  label="Mã chương trình"
                  fullWidth
                  value={
                    isEdit ? editProgram.programCode : newProgram.programCode
                  }
                  onChange={handleInputChange("programCode")}
                  required
                  error={!programValidation.hasValidCode}
                  helperText={
                    !programValidation.hasValidCode
                      ? "Vui lòng nhập mã chương trình"
                      : ""
                  }
                />
                <TextField
                  label="Tên chương trình"
                  fullWidth
                  value={
                    isEdit ? editProgram.programName : newProgram.programName
                  }
                  onChange={handleInputChange("programName")}
                  required
                  error={!programValidation.hasValidName}
                  helperText={
                    !programValidation.hasValidName
                      ? "Vui lòng nhập tên chương trình"
                      : ""
                  }
                />
                <TextField
                  label="Mô tả"
                  fullWidth
                  multiline
                  rows={3}
                  value={
                    isEdit ? editProgram.description : newProgram.description
                  }
                  onChange={handleInputChange("description")}
                />
                <TextField
                  label="Tổng số tín chỉ"
                  type="number"
                  fullWidth
                  value={
                    isEdit ? editProgram.totalCredits : newProgram.totalCredits
                  }
                  onChange={handleInputChange("totalCredits")}
                  required
                  error={!programValidation.hasValidCredits}
                  helperText={
                    !programValidation.hasValidCredits
                      ? "Vui lòng nhập số tín chỉ lớn hơn 0"
                      : ""
                  }
                  InputProps={{ inputProps: { min: 0 } }}
                />
                <TextField
                  label="Thời gian đào tạo (năm)"
                  type="number"
                  fullWidth
                  value={
                    isEdit
                      ? editProgram.durationYears
                      : newProgram.durationYears
                  }
                  onChange={handleInputChange("durationYears")}
                  required
                  error={!programValidation.hasValidDuration}
                  helperText={
                    !programValidation.hasValidDuration
                      ? "Vui lòng nhập thời gian đào tạo từ 1 năm trở lên"
                      : ""
                  }
                  InputProps={{ inputProps: { min: 1 } }}
                />
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={isEdit ? editProgram.status : newProgram.status}
                    label="Trạng thái"
                    onChange={(e) => {
                      const value = e.target.value as ProgramStatus;
                      if (isEdit) {
                        setEditProgram((prev) => ({
                          ...prev,
                          status: value,
                        }));
                      } else {
                        setNewProgram((prev) => ({
                          ...prev,
                          status: value,
                        }));
                      }
                    }}
                  >
                    <MenuItem value={ProgramStatus.ACTIVE}>
                      Đang áp dụng
                    </MenuItem>
                    <MenuItem value={ProgramStatus.INACTIVE}>
                      Không áp dụng
                    </MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            {type === "course" && (
              <>
                {isEdit && editingCourse ? (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Box
                        component="img"
                        src={editingCourse.thumbnailUrl}
                        alt={editingCourse.title}
                        sx={{
                          width: 40,
                          height: 40,
                          objectFit: "cover",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      />
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "medium" }}
                      >
                        {editingCourse.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {editingCourse.description}
                    </Typography>
                  </Paper>
                ) : (
                  <FormControl fullWidth>
                    <InputLabel>Môn học</InputLabel>
                    <Select
                      value={newCourse.courseId || ""}
                      label="Môn học"
                      onChange={(e) => {
                        setNewCourse((prev) => ({
                          ...prev,
                          courseId: Number(e.target.value),
                        }));
                      }}
                      required
                      error={!newCourse.courseId}
                    >
                      {courses.map((course) => {
                        const isCourseAdded = existingProgramCourses.includes(
                          course.id
                        );
                        return (
                          <MenuItem
                            key={course.id}
                            value={course.id}
                            disabled={isCourseAdded}
                            sx={{
                              "&.Mui-disabled": {
                                color: isCourseAdded ? "red" : "inherit",
                              },
                              py: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                width: "100%",
                              }}
                            >
                              <Box
                                component="img"
                                src={course.thumbnailUrl}
                                alt={course.title}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  objectFit: "cover",
                                  borderRadius: 1,
                                  border: "1px solid",
                                  borderColor: "divider",
                                }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Typography>
                                  {course.title}{" "}
                                  {isCourseAdded && (
                                    <Typography
                                      variant="caption"
                                      sx={{ ml: 1 }}
                                    >
                                      Đã được thêm vào chương trình
                                    </Typography>
                                  )}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block", mt: 0.5 }}
                                >
                                  {course.description}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {!newCourse.courseId && (
                      <Typography color="error" variant="caption">
                        Vui lòng chọn môn học
                      </Typography>
                    )}
                  </FormControl>
                )}

                <TextField
                  label="Số tín chỉ"
                  type="number"
                  fullWidth
                  value={isEdit ? editProgramCourse.credits : newCourse.credits}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value >= 1 && value <= 10) {
                      if (isEdit) {
                        setEditProgramCourse((prev) => ({
                          ...prev,
                          credits: value,
                        }));
                      } else {
                        setNewCourse((prev) => ({
                          ...prev,
                          credits: value,
                        }));
                      }
                    }
                  }}
                  required
                  error={
                    (isEdit ? editProgramCourse.credits : newCourse.credits) <
                      1 ||
                    (isEdit ? editProgramCourse.credits : newCourse.credits) >
                      10
                  }
                  helperText={
                    (isEdit ? editProgramCourse.credits : newCourse.credits) <
                      1 ||
                    (isEdit ? editProgramCourse.credits : newCourse.credits) >
                      10
                      ? "Số tín chỉ phải từ 1 đến 10"
                      : ""
                  }
                  InputProps={{ inputProps: { min: 1, max: 10 } }}
                />

                <FormControl fullWidth>
                  <InputLabel>Loại môn học</InputLabel>
                  <Select
                    value={
                      (
                        isEdit
                          ? editProgramCourse.isMandatory
                          : newCourse.isMandatory
                      )
                        ? "true"
                        : "false"
                    }
                    label="Loại môn học"
                    onChange={(e) => {
                      const value = e.target.value === "true";
                      if (isEdit) {
                        setEditProgramCourse((prev) => ({
                          ...prev,
                          isMandatory: value,
                        }));
                      } else {
                        setNewCourse((prev) => ({
                          ...prev,
                          isMandatory: value,
                        }));
                      }
                    }}
                  >
                    <MenuItem value="true">Bắt buộc</MenuItem>
                    <MenuItem value="false">Tự chọn</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={
              type === "faculty"
                ? isEdit
                  ? !editFaculty.facultyCode || !editFaculty.facultyName
                  : !newFaculty.facultyCode || !newFaculty.facultyName
                : type === "major"
                ? isEdit
                  ? !editMajor.majorCode || !editMajor.majorName
                  : !newMajor.majorCode || !newMajor.majorName
                : type === "program"
                ? !programValidation.hasValidCode ||
                  !programValidation.hasValidName ||
                  !programValidation.hasValidCredits ||
                  !programValidation.hasValidDuration
                : type === "course"
                ? isEdit
                  ? editProgramCourse.credits < 1 ||
                    editProgramCourse.credits > 10
                  : !newCourse.courseId ||
                    newCourse.credits < 1 ||
                    newCourse.credits > 10
                : false
            }
          >
            {isEdit ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderDeleteDialog = () => {
    const { open, type, name } = deleteDialog;
    if (!open) return null;

    const title =
      type === "faculty"
        ? "Xóa khoa"
        : type === "major"
        ? "Xóa ngành"
        : type === "program"
        ? "Xóa chương trình"
        : "Xóa môn học khỏi chương trình";

    const content =
      type === "faculty"
        ? `Bạn có chắc chắn muốn xóa khoa "${name}"?`
        : type === "major"
        ? `Bạn có chắc chắn muốn xóa ngành "${name}"?`
        : type === "program"
        ? `Bạn có chắc chắn muốn xóa chương trình "${name}"?`
        : `Bạn có chắc chắn muốn xóa môn học "${name}" khỏi chương trình?`;

    const warning =
      type === "faculty"
        ? "Lưu ý: Khoa này sẽ bị xóa vĩnh viễn và không thể khôi phục."
        : type === "major"
        ? "Lưu ý: Ngành này sẽ bị xóa vĩnh viễn và không thể khôi phục."
        : type === "program"
        ? "Lưu ý: Chương trình này sẽ bị xóa vĩnh viễn và không thể khôi phục."
        : "Lưu ý: Môn học này sẽ bị xóa khỏi chương trình và không thể khôi phục.";

    return (
      <Dialog
        open={open}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Typography>{content}</Typography>
          <Typography color="error" sx={{ mt: 1 }}>
            {warning}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderActionButtons = (
    type: DialogState["type"],
    id: string,
    parentId?: string
  ) => (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Tooltip title="Chỉnh sửa">
        <IconButton
          size="small"
          onClick={() => handleOpenDialog(type, parentId, { id })}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Xóa">
        <IconButton size="small" onClick={() => handleDelete(type, id)}>
          <DeleteIcon fontSize="small" color="error" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderAddButton = (type: DialogState["type"], parentId?: string) => (
    <Tooltip
      title={`Thêm ${
        type === "faculty"
          ? "khoa"
          : type === "major"
          ? "ngành"
          : type === "program"
          ? "chương trình"
          : "môn học"
      }`}
    >
      <IconButton
        size="small"
        onClick={() => handleOpenDialog(type, parentId)}
        sx={{ ml: 1 }}
      >
        <AddIcon fontSize="small" color="primary" />
      </IconButton>
    </Tooltip>
  );

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
        Hệ thống đào tạo
      </Typography>

      {renderSearchBar()}

      <Paper sx={{ borderRadius: 2 }}>{renderTableView()}</Paper>

      {renderDialog()}
      {renderDeleteDialog()}
    </Box>
  );
};

export default AdminTrainingSystem;
