import { RootState } from "../../app/store";

// Select all class instructors
export const selectAllClassInstructors = (state: RootState) =>
  state.academicClassInstructors.classInstructors;

// Select current class instructor
export const selectCurrentClassInstructor = (state: RootState) =>
  state.academicClassInstructors.currentClassInstructor;

// Select loading status
export const selectClassInstructorsStatus = (state: RootState) =>
  state.academicClassInstructors.status;

// Select error state
export const selectClassInstructorsError = (state: RootState) =>
  state.academicClassInstructors.error;

// Select class instructor by id
export const selectClassInstructorById = (state: RootState, id: number) =>
  state.academicClassInstructors.classInstructors.find(
    (instructor) => instructor.id === id
  );

// Select class instructors by class id
export const selectClassInstructorsByClassId = (
  state: RootState,
  classId: number
) =>
  state.academicClassInstructors.classInstructors.filter(
    (instructor) => instructor.classId === classId
  );

// Select class instructors by instructor id
export const selectClassInstructorsByInstructorId = (
  state: RootState,
  instructorId: number
) =>
  state.academicClassInstructors.classInstructors.filter(
    (instructor) => instructor.instructorId === instructorId
  );

// Select loading state
export const selectIsLoading = (state: RootState) =>
  state.academicClassInstructors.status === "loading";

// Select if data fetch was successful
export const selectIsSuccess = (state: RootState) =>
  state.academicClassInstructors.status === "succeeded";
