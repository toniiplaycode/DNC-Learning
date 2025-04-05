import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { QuizType, AttemptStatus } from "../../types/quiz.types";

// Basic selectors
export const selectQuizzesState = (state: RootState) => state.quizzes;
export const selectAllQuizzes = (state: RootState) => state.quizzes.quizzes;
export const selectLessonQuizzes = (state: RootState) =>
  state.quizzes.lessonQuizzes;
export const selectCurrentQuiz = (state: RootState) =>
  state.quizzes.currentQuiz;
export const selectUserAttempts = (state: RootState) =>
  state.quizzes.userAttempts;
export const selectCurrentAttempt = (state: RootState) =>
  state.quizzes.currentAttempt;
export const selectQuizResult = (state: RootState) => state.quizzes.quizResult;
export const selectQuizzesStatus = (state: RootState) => state.quizzes.status;
export const selectQuizzesError = (state: RootState) => state.quizzes.error;

// Derived selectors
export const selectQuizById = (quizId: number) =>
  createSelector([selectAllQuizzes], (quizzes) =>
    quizzes.find((quiz) => quiz.id === quizId)
  );

export const selectQuizzesByType = (type: QuizType) =>
  createSelector([selectAllQuizzes], (quizzes) =>
    quizzes.filter((quiz) => quiz.quizType === type)
  );

export const selectActiveQuizzes = createSelector(
  [selectAllQuizzes],
  (quizzes) => quizzes.filter((quiz) => quiz.isActive)
);

export const selectQuizzesByLesson = (lessonId: number) =>
  createSelector([selectAllQuizzes], (quizzes) =>
    quizzes.filter((quiz) => quiz.lessonId === lessonId)
  );

export const selectUserAttemptsByQuiz = (quizId: number) =>
  createSelector([selectUserAttempts], (attempts) =>
    attempts.filter((attempt) => attempt.quizId === quizId)
  );

export const selectUserCompletedAttempts = createSelector(
  [selectUserAttempts],
  (attempts) =>
    attempts.filter((attempt) => attempt.status === AttemptStatus.COMPLETED)
);

export const selectUserAttemptCount = (quizId: number) =>
  createSelector(
    [selectUserAttemptsByQuiz(quizId)],
    (attempts) => attempts.length
  );

export const selectLastAttemptForQuiz = (quizId: number) =>
  createSelector([selectUserAttemptsByQuiz(quizId)], (attempts) => {
    if (attempts.length === 0) return null;
    return attempts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  });

export const selectBestAttemptForQuiz = (quizId: number) =>
  createSelector([selectUserAttemptsByQuiz(quizId)], (attempts) => {
    const completedAttempts = attempts.filter(
      (a) => a.status === AttemptStatus.COMPLETED && a.score !== undefined
    );
    if (completedAttempts.length === 0) return null;
    return completedAttempts.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  });

export const selectQuizPassingStatus = (quizId: number) =>
  createSelector(
    [selectUserAttemptsByQuiz(quizId), selectQuizById(quizId)],
    (attempts, quiz) => {
      if (!quiz || !quiz.passingScore) return null;

      const completedAttempts = attempts.filter(
        (a) => a.status === AttemptStatus.COMPLETED && a.score !== undefined
      );

      if (completedAttempts.length === 0) return false;

      return completedAttempts.some(
        (a) => (a.score || 0) >= (quiz.passingScore || 0)
      );
    }
  );

export const selectRecentAttempts = createSelector(
  [selectUserAttempts],
  (attempts) => {
    return [...attempts]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5); // Get the 5 most recent attempts
  }
);

export const selectUserQuizStats = createSelector(
  [selectUserAttempts],
  (attempts) => {
    const totalAttempts = attempts.length;
    const completedAttempts = attempts.filter(
      (a) => a.status === AttemptStatus.COMPLETED
    ).length;
    const inProgressAttempts = attempts.filter(
      (a) => a.status === AttemptStatus.IN_PROGRESS
    ).length;
    const abandonedAttempts = attempts.filter(
      (a) => a.status === AttemptStatus.ABANDONED
    ).length;

    // Calculate average score from completed attempts with scores
    const attemptsWithScores = attempts.filter(
      (a) => a.status === AttemptStatus.COMPLETED && a.score !== undefined
    );

    const averageScore = attemptsWithScores.length
      ? attemptsWithScores.reduce((sum, a) => sum + (a.score || 0), 0) /
        attemptsWithScores.length
      : 0;

    return {
      totalAttempts,
      completedAttempts,
      inProgressAttempts,
      abandonedAttempts,
      averageScore,
    };
  }
);

// Selector để lấy quiz cho sinh viên học thuật
export const selectQuizzesByStudentAcademic = createSelector(
  [selectAllQuizzes],
  (quizzes) => quizzes
);

// Selector để lọc quiz theo lớp học thuật và đang hoạt động
export const selectActiveAcademicQuizzes = createSelector(
  [selectAllQuizzes],
  (quizzes) =>
    quizzes.filter((quiz) => quiz.isActive && quiz.academicClassId !== null)
);

// Selector để lấy quiz đang diễn ra (trong khoảng thời gian từ startTime đến endTime)
export const selectOngoingAcademicQuizzes = createSelector(
  [selectActiveAcademicQuizzes],
  (quizzes) => {
    const now = new Date();
    return quizzes.filter(
      (quiz) =>
        quiz.startTime &&
        quiz.endTime &&
        new Date(quiz.startTime) <= now &&
        new Date(quiz.endTime) >= now
    );
  }
);

// Selector để lấy quiz sắp diễn ra
export const selectUpcomingAcademicQuizzes = createSelector(
  [selectActiveAcademicQuizzes],
  (quizzes) => {
    const now = new Date();
    return quizzes.filter(
      (quiz) => quiz.startTime && new Date(quiz.startTime) > now
    );
  }
);
