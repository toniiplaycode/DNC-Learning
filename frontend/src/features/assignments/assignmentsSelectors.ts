import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { AssignmentType } from "../../types/assignment.types";

// Base selectors
export const selectAssignmentsState = (state: RootState) => state.assignments;
export const selectAllAssignments = (state: RootState) =>
  state.assignments.assignments;
export const selectCurrentAssignment = (state: RootState) =>
  state.assignments.currentAssignment;
export const selectLessonAssignments = (state: RootState) =>
  state.assignments.lessonAssignments;
export const selectStudentAcademicAssignments = (state: RootState) =>
  state.assignments.studentAcademicAssignments;
export const selectInstructorAcademicClassAssignments = (state: RootState) =>
  state.assignments.instructorAcademicClassAssignments;
export const selectAcademicClassAssignments = (state: RootState) =>
  state.assignments.academicClassAssignments;
export const selectAssignmentsCourse = (state: RootState) =>
  state.assignments.assignmentsCourse;
export const selectUserSubmissions = (state: RootState) =>
  state.assignments.userSubmissions;
export const selectCurrentSubmission = (state: RootState) =>
  state.assignments.currentSubmission;
export const selectAssignmentsStatus = (state: RootState) =>
  state.assignments.status;
export const selectAssignmentsError = (state: RootState) =>
  state.assignments.error;

// Add to existing selectors
export const selectCurrentAssignmentInstructor = (state: RootState) =>
  state.assignments.currentAssignmentInstructor;

// Selector để lọc assignment theo trạng thái (đang diễn ra, sắp diễn ra, đã kết thúc)
export const selectOngoingAssignments = createSelector(
  [selectAllAssignments],
  (assignments) => {
    const now = new Date();
    return assignments.filter(
      (assignment) =>
        assignment.startTime &&
        assignment.endTime &&
        new Date(assignment.startTime) <= now &&
        new Date(assignment.endTime) >= now
    );
  }
);

export const selectUpcomingAssignments = createSelector(
  [selectAllAssignments],
  (assignments) => {
    const now = new Date();
    return assignments.filter(
      (assignment) =>
        assignment.startTime && new Date(assignment.startTime) > now
    );
  }
);

export const selectPastAssignments = createSelector(
  [selectAllAssignments],
  (assignments) => {
    const now = new Date();
    return assignments.filter(
      (assignment) => assignment.endTime && new Date(assignment.endTime) < now
    );
  }
);

// Selectors để lọc assignments theo loại
export const selectAssignmentsByType = (type: AssignmentType) =>
  createSelector([selectAllAssignments], (assignments) =>
    assignments.filter((assignment) => assignment.assignmentType === type)
  );

export const selectPracticeAssignments = createSelector(
  [selectAllAssignments],
  (assignments) =>
    assignments.filter(
      (assignment) => assignment.assignmentType === AssignmentType.PRACTICE
    )
);

export const selectHomeworkAssignments = createSelector(
  [selectAllAssignments],
  (assignments) =>
    assignments.filter(
      (assignment) => assignment.assignmentType === AssignmentType.HOMEWORK
    )
);

export const selectExamAssignments = createSelector(
  [selectAllAssignments],
  (assignments) =>
    assignments.filter(
      (assignment) =>
        assignment.assignmentType === AssignmentType.MIDTERM ||
        assignment.assignmentType === AssignmentType.FINAL
    )
);

export const selectProjectAssignments = createSelector(
  [selectAllAssignments],
  (assignments) =>
    assignments.filter(
      (assignment) => assignment.assignmentType === AssignmentType.PROJECT
    )
);

// Selector để tìm assignment theo ID
export const selectAssignmentById = (id: number) =>
  createSelector([selectAllAssignments], (assignments) =>
    assignments.find((assignment) => assignment.id === id)
  );

// Selector để lấy số lượng bài tập theo loại
export const selectAssignmentCounts = createSelector(
  [selectAllAssignments],
  (assignments) => {
    return {
      total: assignments.length,
      practice: assignments.filter(
        (a) => a.assignmentType === AssignmentType.PRACTICE
      ).length,
      homework: assignments.filter(
        (a) => a.assignmentType === AssignmentType.HOMEWORK
      ).length,
      midterm: assignments.filter(
        (a) => a.assignmentType === AssignmentType.MIDTERM
      ).length,
      final: assignments.filter(
        (a) => a.assignmentType === AssignmentType.FINAL
      ).length,
      project: assignments.filter(
        (a) => a.assignmentType === AssignmentType.PROJECT
      ).length,
    };
  }
);
