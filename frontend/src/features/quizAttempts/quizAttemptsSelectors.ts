import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

// Basic selectors
export const selectQuizAttemptsState = (state: RootState) => state.quizAttempts;

// Selectors matching exactly the state structure in quizAttemptsSlice.ts
export const selectQuizAttempts = createSelector(
  [selectQuizAttemptsState],
  (state) => state.attemptsUser
);

export const selectUserAttempt = createSelector(
  [selectQuizAttemptsState],
  (state) => state.attemptsUser
);

export const selectCurrentAttempt = createSelector(
  [selectQuizAttemptsState],
  (state) => state.currentAttempt
);

export const selectIsLoading = createSelector(
  [selectQuizAttemptsState],
  (state) => state.isLoading
);

export const selectError = createSelector(
  [selectQuizAttemptsState],
  (state) => state.error
);

// More complex selectors
export const selectCompletedAttempts = createSelector(
  [selectQuizAttempts],
  (attemptsUser) =>
    attemptsUser.filter((attempt) => attempt.status === "completed")
);

export const selectInProgressAttempts = createSelector(
  [selectQuizAttempts],
  (attemptsUser) =>
    attemptsUser.filter((attempt) => attempt.status === "in_progress")
);

export const selectAttemptById = (attemptId: number) =>
  createSelector(
    [selectQuizAttempts],
    (attemptsUser) =>
      attemptsUser.find((attempt) => attempt.id === attemptId) || null
  );

export const selectCurrentAttemptResponses = createSelector(
  [selectCurrentAttempt],
  (currentAttempt) => currentAttempt?.responses || []
);

export const selectCurrentAttemptProgress = createSelector(
  [selectCurrentAttempt],
  (currentAttempt) => {
    if (!currentAttempt) return 0;

    const totalQuestions = currentAttempt.quiz.questions.length;
    const answeredQuestions = currentAttempt.responses.length;

    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  }
);

export const selectResponseForQuestion = (questionId: number) =>
  createSelector(
    [selectCurrentAttemptResponses],
    (responses) =>
      responses.find((response) => response.questionId === questionId) || null
  );
