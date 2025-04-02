import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from '../../entities/Review';
import { Course } from '../../entities/Course';
import { UserStudent } from '../../entities/UserStudent';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Course, UserStudent])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
