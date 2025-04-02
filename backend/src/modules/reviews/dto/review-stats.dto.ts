import { Expose } from 'class-transformer';

export class ReviewStatsDto {
  @Expose()
  averageRating: number;

  @Expose()
  totalReviews: number;

  @Expose()
  ratings: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
