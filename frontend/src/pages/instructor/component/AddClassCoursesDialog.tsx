import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Avatar,
  Stack,
  Chip,
} from "@mui/material";
import { School, Info } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectCoursesByInstructor } from "../../../features/courses/coursesSelector";
import { fetchCoursesByInstructor } from "../../../features/courses/coursesApiSlice";
import { selectCurrentUser } from "../../../features/auth/authSelectors";
import {
  fetchClassCourses,
  createAcademicClassCourses,
  deleteAcademicClassCourse,
} from "../../../features/academic-class-courses/academicClassCoursesSlice";
import { selectAllClassCourses } from "../../../features/academic-class-courses/academicClassCoursesSelectors";
import { toast } from "react-toastify";
import { createNotification } from "../../../features/notifications/notificationsSlice";
import { selectProgramCourses } from "../../../features/academic-classes/academicClassesSelectors";
import { fetchClassProgramCourses } from "../../../features/academic-classes/academicClassesSlice";

interface AddClassCoursesDialogProps {
  open: boolean;
  onClose: () => void;
  classData: any;
  studentAcademic: any;
}

export const AddClassCoursesDialog = ({
  open,
  onClose,
  classData,
  studentAcademic,
}: AddClassCoursesDialogProps) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const classCourses = useAppSelector(selectAllClassCourses);
  const programCourses = useAppSelector(selectProgramCourses);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [initialExistingCourses, setInitialExistingCourses] = useState<
    number[]
  >([]);
  const coursesByInstructor = useAppSelector(selectCoursesByInstructor);

  // Tạo Map chứa thông tin khóa học trong chương trình
  const programCoursesMap = new Map(
    programCourses.map((pc) => [pc.courseId, pc])
  );

  // Lấy tất cả khóa học trong chương trình
  const instructorProgramCourses = programCourses.map((pc) => {
    const course = coursesByInstructor.find((c) => c.id === pc.courseId);
    return {
      ...course,
      programCourse: pc,
      isProgramCourse: true,
    };
  });

  const instructorNonProgramCourses = coursesByInstructor
    .filter((course) => !programCoursesMap.has(course.id))
    .map((course) => ({
      ...course,
      isProgramCourse: false,
    }));

  useEffect(() => {
    if (open) {
      dispatch(
        fetchCoursesByInstructor(Number(currentUser?.userInstructor?.id))
      );
      dispatch(fetchClassCourses());
      dispatch(fetchClassProgramCourses(Number(classData?.academicClass?.id)));

      const existing = classCourses
        .filter((cc) => cc.classId === classData?.academicClass?.id)
        .map((cc) => cc.courseId);
      setInitialExistingCourses(existing);
      setSelectedCourses(existing);
    }
  }, [dispatch, currentUser, classData, open]);

  const handleToggleCourse = (courseId: number) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = async () => {
    try {
      // Find courses to remove (were in initial but not in selected)
      const coursesToRemove = initialExistingCourses.filter(
        (id) => !selectedCourses.includes(id)
      );

      // Find courses to add (in selected but not in initial)
      const coursesToAdd = selectedCourses.filter(
        (id) => !initialExistingCourses.includes(id)
      );

      // Remove courses
      for (const courseId of coursesToRemove) {
        const classCourse = classCourses.find(
          (cc) =>
            cc.classId === classData.academicClass.id &&
            cc.courseId === courseId
        );
        if (classCourse) {
          await dispatch(deleteAcademicClassCourse(classCourse.id)).unwrap();
        }
      }

      // Add new courses
      if (coursesToAdd.length > 0) {
        try {
          // First create the academic class courses
          await dispatch(
            createAcademicClassCourses({
              classId: classData.academicClass.id,
              courseIds: coursesToAdd,
            })
          ).unwrap();

          // Get the course titles for the notification
          const addedCourses = coursesByInstructor.filter((course) =>
            coursesToAdd.includes(course.id)
          );
          const coursesTitles = addedCourses
            .map((course) => course.title)
            .join(", ");

          // Create notification with correct user IDs
          const notificationData = {
            userIds: studentAcademic.map((student) =>
              student.user.id.toString()
            ), // Map to user IDs from student records
            title: `${classData.academicClass.classCode} - Thêm khóa học mới`,
            content: `Giảng viên vừa thêm ${
              addedCourses.length > 1 ? "các" : ""
            } khóa học "${coursesTitles}" vào lớp ${
              classData.academicClass.classCode
            }.`,
            type: "course",
          };
          toast.success("Cập nhật khóa học cho lớp thành công!");

          dispatch(createNotification(notificationData)).unwrap();

          dispatch(fetchClassCourses());
        } catch (error: any) {
          toast.error(error?.message || "Có lỗi xảy ra khi cập nhật khóa học!");
        }
      }

      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra khi cập nhật khóa học!");
    }
  };

  const renderCourseList = (
    courses: any[],
    title: string,
    isProgramCourse: boolean
  ) => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2, color: "text.secondary" }}>
        {title}
      </Typography>
      {courses.length === 0 ? (
        <Typography color="text.secondary">Chưa có khóa học nào</Typography>
      ) : isProgramCourse ? (
        // Ultra compact grid layout for program courses
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 1,
            "& > *": {
              fontSize: "0.875rem",
            },
          }}
        >
          {courses.map((course) => (
            <Box
              key={course.programCourse.courseId}
              sx={{
                p: 1,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 0.5,
                bgcolor: "action.hover",
                opacity: 0.9,
                display: "flex",
                alignItems: "center",
                gap: 1,
                height: 40,
              }}
            >
              <Box
                component="img"
                src={course?.thumbnailUrl || "/src/assets/logo.png"}
                alt={course?.title || course.programCourse.course?.title}
                sx={{
                  width: 32,
                  height: 32,
                  objectFit: "cover",
                  borderRadius: 0.5,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    flex: 1,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  {course?.title || course.programCourse.course?.title}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    ml: "auto",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: "0.625rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {course.programCourse.credits} tín chỉ
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        // Original layout for non-program courses
        courses.map((course) => (
          <Box
            key={course.id}
            sx={{
              p: 2,
              mb: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedCourses.includes(course.id)}
                  onChange={() => handleToggleCourse(course.id)}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    component="img"
                    src={course.thumbnailUrl || "/src/assets/logo.png"}
                    alt={course.title}
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle1">{course.title}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {course.category?.name}
                      </Typography>
                      {initialExistingCourses.includes(course.id) && (
                        <Chip
                          size="small"
                          label="Đã thêm vào lớp"
                          color="success"
                        />
                      )}
                    </Stack>
                  </Box>
                </Box>
              }
            />
          </Box>
        ))
      )}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "primary.light" }}>
            <School />
          </Avatar>
          <Box>
            <Typography variant="h6">Thêm khóa học cho lớp</Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {classData?.academicClass.className} -{" "}
              {classData?.academicClass.classCode}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            bgcolor: "info.lighter",
            borderRadius: 1,
            mb: 2,
            p: 2,
          }}
        >
          <Info color="info" sx={{ mt: 0.5 }} />
          <Box>
            <Typography variant="body2" gutterBottom>
              Khi thêm các khóa học cho lớp, tất cả sinh viên thuộc lớp{" "}
              <b>
                {classData?.academicClass.className} -{" "}
                {classData?.academicClass.classCode}
              </b>{" "}
              sẽ được quyền truy cập và học các khóa học được thêm.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Các khóa học trong chương trình đào tạo sẽ tự động được thêm vào
              lớp và không thể thay đổi.
            </Typography>
          </Box>
        </Box>

        {renderCourseList(
          instructorProgramCourses,
          "Khóa học trong chương trình đào tạo",
          true
        )}
        {renderCourseList(
          instructorNonProgramCourses,
          "Khóa học ngoài chương trình đào tạo",
          false
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            JSON.stringify(selectedCourses.sort()) ===
            JSON.stringify(initialExistingCourses.sort())
          }
        >
          Cập nhật khóa học
        </Button>
      </DialogActions>
    </Dialog>
  );
};
