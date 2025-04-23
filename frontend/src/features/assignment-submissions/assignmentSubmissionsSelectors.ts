import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { SubmissionStatus } from "../../types/assignment-submission.types";

// Base selectors
export const selectSubmissionsState = (state: RootState) =>
  state.assignmentSubmissions;
export const selectAllSubmissions = (state: RootState) =>
  state.assignmentSubmissions.submissions;
export const selectUserSubmissions = (state: RootState) =>
  state.assignmentSubmissions.userSubmissions;
export const selectAssignmentSubmissions = (state: RootState) =>
  state.assignmentSubmissions.assignmentSubmissions;
export const selectCurrentSubmission = (state: RootState) =>
  state.assignmentSubmissions.currentSubmission;
export const selectSubmissionsStatus = (state: RootState) =>
  state.assignmentSubmissions.status;
export const selectSubmissionsError = (state: RootState) =>
  state.assignmentSubmissions.error;
export const selectInstructorSubmissions = (state: RootState) =>
  state.assignmentSubmissions.instructorSubmissions;

// Derived selectors
export const selectSubmissionsByStatus = (status: SubmissionStatus) =>
  createSelector([selectAllSubmissions], (submissions) =>
    submissions.filter((submission) => submission.status === status)
  );

export const selectGradedSubmissions = createSelector(
  [selectAllSubmissions],
  (submissions) =>
    submissions.filter(
      (submission) => submission.status === SubmissionStatus.GRADED
    )
);

export const selectPendingSubmissions = createSelector(
  [selectAllSubmissions],
  (submissions) =>
    submissions.filter(
      (submission) => submission.status === SubmissionStatus.SUBMITTED
    )
);

export const selectLateSubmissions = createSelector(
  [selectAllSubmissions],
  (submissions) =>
    submissions.filter(
      (submission) => submission.status === SubmissionStatus.LATE
    )
);

export const selectSubmissionsByAssignment = (assignmentId: number) =>
  createSelector([selectAllSubmissions], (submissions) =>
    submissions.filter((submission) => submission.assignmentId === assignmentId)
  );

export const selectUserSubmissionForAssignment = (
  userId: number,
  assignmentId: number
) =>
  createSelector(
    [selectAllSubmissions],
    (submissions) =>
      submissions.find(
        (submission) =>
          submission.userId === userId &&
          submission.assignmentId === assignmentId
      ) || null
  );

export const selectSubmissionById = (id: number) =>
  createSelector(
    [selectAllSubmissions],
    (submissions) =>
      submissions.find((submission) => submission.id === id) || null
  );

export const selectInstructorSubmissionsByStatus = (status: SubmissionStatus) =>
  createSelector([selectInstructorSubmissions], (submissions) =>
    submissions.filter((submission) => submission.status === status)
  );

export const selectInstructorPendingSubmissions = createSelector(
  [selectInstructorSubmissions],
  (submissions) =>
    submissions.filter(
      (submission) => submission.status === SubmissionStatus.SUBMITTED
    )
);

export const selectInstructorGradedSubmissions = createSelector(
  [selectInstructorSubmissions],
  (submissions) =>
    submissions.filter(
      (submission) => submission.status === SubmissionStatus.GRADED
    )
);

export const selectInstructorLateSubmissions = createSelector(
  [selectInstructorSubmissions],
  (submissions) =>
    submissions.filter(
      (submission) => submission.status === SubmissionStatus.LATE
    )
);
