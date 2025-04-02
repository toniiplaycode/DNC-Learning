import { Expose } from 'class-transformer';
import { GradeType } from '../../../entities/UserGrade';

export class GradeSummaryDto {
  @Expose()
  userId: number;

  @Expose()
  courseId: number;

  @Expose()
  overallGrade: number;

  @Expose()
  assignments: {
    average: number;
    totalWeight: number;
    count: number;
  };

  @Expose()
  quizzes: {
    average: number;
    totalWeight: number;
    count: number;
  };

  @Expose()
  midterm: {
    score: number;
    maxScore: number;
    weight: number;
  };

  @Expose()
  final: {
    score: number;
    maxScore: number;
    weight: number;
  };

  @Expose()
  participation: {
    score: number;
    maxScore: number;
    weight: number;
  };

  @Expose()
  gradesByType: Record<
    GradeType,
    {
      average: number;
      weight: number;
      count: number;
    }
  >;
}
