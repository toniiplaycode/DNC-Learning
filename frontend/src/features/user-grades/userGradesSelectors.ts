import { RootState } from "../../app/store";
import { createSelector } from "@reduxjs/toolkit";
import { GradeType } from "../../types/user-grade.types";

// Base selectors
export const selectUserGradesState = (state: RootState) => state.userGrades;
export const selectAllUserGrades = (state: RootState) =>
  state.userGrades.userGrades;
export const selectUserCourseGrades = (state: RootState) =>
  state.userGrades.userCourseGrades;
export const selectCurrentGrade = (state: RootState) =>
  state.userGrades.currentGrade;
export const selectCourseSummary = (state: RootState) =>
  state.userGrades.courseSummary;
export const selectPerformanceStats = (state: RootState) =>
  state.userGrades.performanceStats;
export const selectUserGradesStatus = (state: RootState) =>
  state.userGrades.status;
export const selectUserGradesError = (state: RootState) =>
  state.userGrades.error;

// Derived selectors
export const selectUserGradeById = (id: number) =>
  createSelector([selectAllUserGrades], (grades) =>
    grades.find((grade) => grade.id === id)
  );

export const selectGradesByUserId = (userId: number) =>
  createSelector([selectAllUserGrades], (grades) =>
    grades.filter((grade) => grade.userId === userId)
  );

export const selectGradesByCourseId = (courseId: number) =>
  createSelector([selectAllUserGrades], (grades) =>
    grades.filter((grade) => grade.courseId === courseId)
  );

export const selectGradesByType = (gradeType: GradeType) =>
  createSelector([selectAllUserGrades], (grades) =>
    grades.filter((grade) => grade.gradeType === gradeType)
  );

export const selectUserCourseGradesByType = (gradeType: GradeType) =>
  createSelector([selectUserCourseGrades], (grades) =>
    grades.filter((grade) => grade.gradeType === gradeType)
  );

// Selector để tính điểm trung bình theo loại điểm
export const selectAverageGradeByType = (gradeType: GradeType) =>
  createSelector([selectUserCourseGrades], (grades) => {
    const filteredGrades = grades.filter(
      (grade) => grade.gradeType === gradeType
    );

    if (filteredGrades.length === 0) return 0;

    let totalPercentage = 0;

    filteredGrades.forEach((grade) => {
      totalPercentage += (grade.score / grade.maxScore) * 100;
    });

    return totalPercentage / filteredGrades.length;
  });

// Selector để lấy tổng điểm có trọng số
export const selectWeightedTotalGrade = createSelector(
  [selectUserCourseGrades],
  (grades) => {
    if (grades.length === 0) return 0;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    grades.forEach((grade) => {
      const normalizedScore = (grade.score / grade.maxScore) * 100;
      totalWeightedScore += normalizedScore * grade.weight;
      totalWeight += grade.weight;
    });

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  }
);

// Selector để lấy thống kê điểm theo loại
export const selectGradeTypeDistribution = createSelector(
  [selectUserCourseGrades],
  (grades) => {
    const distribution: Record<string, { count: number; average: number }> = {
      [GradeType.ASSIGNMENT]: { count: 0, average: 0 },
      [GradeType.QUIZ]: { count: 0, average: 0 },
      [GradeType.MIDTERM]: { count: 0, average: 0 },
      [GradeType.FINAL]: { count: 0, average: 0 },
      [GradeType.PARTICIPATION]: { count: 0, average: 0 },
    };

    Object.keys(distribution).forEach((type) => {
      const typeGrades = grades.filter(
        (grade) => grade.gradeType === (type as GradeType)
      );

      distribution[type].count = typeGrades.length;

      if (typeGrades.length > 0) {
        let totalPercentage = 0;
        typeGrades.forEach((grade) => {
          totalPercentage += (grade.score / grade.maxScore) * 100;
        });
        distribution[type].average = totalPercentage / typeGrades.length;
      }
    });

    return distribution;
  }
);

// Selector để lấy điểm cao nhất và thấp nhất
export const selectGradeExtremes = createSelector(
  [selectUserCourseGrades],
  (grades) => {
    if (grades.length === 0) {
      return { highest: null, lowest: null };
    }

    const normalizedGrades = grades.map((grade) => ({
      ...grade,
      percentage: (grade.score / grade.maxScore) * 100,
    }));

    const sortedGrades = [...normalizedGrades].sort(
      (a, b) => b.percentage - a.percentage
    );

    return {
      highest: sortedGrades[0],
      lowest: sortedGrades[sortedGrades.length - 1],
    };
  }
);

// Selector để lấy điểm trung bình theo khóa học từ performanceStats
export const selectCoursePerformance = createSelector(
  [selectPerformanceStats],
  (stats) => {
    if (!stats) return [];
    return stats.coursePerformance;
  }
);
