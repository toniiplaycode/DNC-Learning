import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignmentsService } from './assignments.service';
import { Assignment } from '../../entities/Assignment';
import { CourseLesson } from '../../entities/CourseLesson';
import { AcademicClass } from '../../entities/AcademicClass';
import { UserGrade } from '../../entities/UserGrade';
import { UserStudentAcademic } from '../../entities/UserStudentAcademic';
import { UserGradesModule } from '../user-grades/user-grades.module';
import { AssignmentsController } from './assignments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Assignment,
      CourseLesson,
      AcademicClass,
      UserGrade,
      UserStudentAcademic,
    ]),
    UserGradesModule,
  ],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
