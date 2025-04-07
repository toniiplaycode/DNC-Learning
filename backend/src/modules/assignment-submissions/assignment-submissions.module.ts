import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentSubmissionsController } from './assignment-submissions.controller';
import { AssignmentSubmissionsService } from './assignment-submissions.service';
import { AssignmentSubmission } from '../../entities/AssignmentSubmission';
import { Assignment } from '../../entities/Assignment';
import { User } from '../../entities/User';
import { UserGradesModule } from '../user-grades/user-grades.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssignmentSubmission, Assignment, User]),
    UserGradesModule,
  ],
  controllers: [AssignmentSubmissionsController],
  providers: [AssignmentSubmissionsService],
  exports: [AssignmentSubmissionsService],
})
export class AssignmentSubmissionsModule {}
