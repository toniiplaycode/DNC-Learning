import { UserRole } from "../../types/user.types";
import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";

// Base selectors
export const selectUsersState = (state: RootState) => state.users;
export const selectAllUsers = (state: RootState) => state.users.users;
export const selectInstructorStudents = (state: RootState) =>
  state.users.instructorStudents;
export const selectUserId = (state: RootState) => state.users.currentUser;
export const selectUsersStatus = (state: RootState) => state.users.status;
export const selectUsersError = (state: RootState) => state.users.error;
export const selectStudentAcademicCourses = (state: RootState) =>
  state.users.studentAcademicCourses;

export const selectInstructorAcademicStudents = (state: RootState) =>
  state.users.instructorAcademicStudents;

export const selectAcademicClassStudents = (state: RootState) =>
  state.users.academicClassStudents;

// Derived selectors
export const selectUserById = (userId: number) =>
  createSelector(
    [selectAllUsers],
    (users) => users.find((user) => user.id === userId) || null
  );

export const selectUsersByRole = (role: UserRole) =>
  createSelector([selectAllUsers], (users) =>
    users.filter((user) => user.role === role)
  );

export const selectStudents = createSelector([selectAllUsers], (users) =>
  users.filter((user) => user.role === UserRole.STUDENT)
);

export const selectInstructors = createSelector([selectAllUsers], (users) =>
  users.filter((user) => user.role === UserRole.INSTRUCTOR)
);

export const selectAdmins = createSelector([selectAllUsers], (users) =>
  users.filter((user) => user.role === UserRole.ADMIN)
);

// User statistics selectors
export const selectUserCounts = createSelector([selectAllUsers], (users) => {
  return {
    total: users.length,
    students: users.filter((user) => user.role === UserRole.STUDENT).length,
    instructors: users.filter((user) => user.role === UserRole.INSTRUCTOR)
      .length,
    admins: users.filter((user) => user.role === UserRole.ADMIN).length,
    academicStudents: users.filter(
      (user) => user.role === UserRole.STUDENT_ACADEMIC
    ).length,
  };
});

// Active/inactive users
export const selectActiveUsers = createSelector([selectAllUsers], (users) =>
  users.filter((user) => user.status === "active")
);

export const selectInactiveUsers = createSelector([selectAllUsers], (users) =>
  users.filter((user) => user.status !== "active")
);
