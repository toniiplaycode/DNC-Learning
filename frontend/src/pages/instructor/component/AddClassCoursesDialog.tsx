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

interface AddClassCoursesDialogProps {
  open: boolean;
  onClose: () => void;
  classData: any;
}

export const AddClassCoursesDialog = ({
  open,
  onClose,
  classData,
}: AddClassCoursesDialogProps) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const classCourses = useAppSelector(selectAllClassCourses);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [initialExistingCourses, setInitialExistingCourses] = useState<
    number[]
  >([]);
  const coursesByInstructor = useAppSelector(selectCoursesByInstructor);

  useEffect(() => {
    if (open) {
      dispatch(fetchCoursesByInstructor(currentUser?.userInstructor?.id));
      dispatch(fetchClassCourses());

      // Store initial existing courses when dialog opens
      const existing = classCourses
        .filter((cc) => cc.classId === classData?.academicClass.id)
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
        await dispatch(
          createAcademicClassCourses({
            classId: classData.academicClass.id,
            courseIds: coursesToAdd,
          })
        ).unwrap();
      }

      dispatch(fetchClassCourses());
      toast.success("Cập nhật khóa học cho lớp thành công!");
      onClose();
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra khi cập nhật khóa học!");
    }
  };

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
          }}
        >
          <Info color="info" sx={{ mt: 0.5 }} />
          <Typography variant="body2">
            Khi thêm các khóa học cho lớp, tất cả sinh viên thuộc lớp{" "}
            <b>
              {classData?.academicClass.className} -{" "}
              {classData?.academicClass.classCode}
            </b>{" "}
            sẽ được quyền truy cập và học các khóa học được thêm.
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          {coursesByInstructor.length === 0 ? (
            <Typography color="text.secondary">
              Chưa có khóa học nào để thêm
            </Typography>
          ) : (
            coursesByInstructor.map((course) => (
              <Box
                key={course.id}
                sx={{
                  p: 2,
                  mb: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  "&:hover": { bgcolor: "action.hover" },
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
                    <Box>
                      <Typography variant="subtitle1">
                        {course.title}
                      </Typography>
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
                  }
                />
              </Box>
            ))
          )}
        </Box>
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
