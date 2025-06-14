import { Box, Typography } from "@mui/material";
import { fetchAllTeachingSchedules } from "../../features/teaching-schedules/teachingSchedulesSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectAllTeachingSchedules } from "../../features/teaching-schedules/teachingSchedulesSelectors";
import { useEffect } from "react";
import InstructorSchedules from "../instructor/InstructorSchedules";
import { selectAllAcademicClasses } from "../../features/academic-classes/academicClassesSelectors";
import { fetchAcademicClasses } from "../../features/academic-classes/academicClassesSlice";

const AdminSchedules: React.FC = () => {
  const dispatch = useAppDispatch();
  const adminTeachingSchedules = useAppSelector(selectAllTeachingSchedules);
  const adminAcademicClasses = useAppSelector(selectAllAcademicClasses);

  useEffect(() => {
    dispatch(fetchAllTeachingSchedules());
    dispatch(fetchAcademicClasses());
  }, [dispatch]);

  return (
    <Box>
      <InstructorSchedules
        adminTeachingSchedules={adminTeachingSchedules}
        adminAcademicClasses={adminAcademicClasses}
        isAdmin={true}
      />
    </Box>
  );
};

export default AdminSchedules;
