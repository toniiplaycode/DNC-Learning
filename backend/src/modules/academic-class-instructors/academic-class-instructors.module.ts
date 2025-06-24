import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicClassInstructorsController } from './academic-class-instructors.controller';
import { AcademicClassInstructorsService } from './academic-class-instructors.service';
import { AcademicClassInstructor } from '../../entities/AcademicClassInstructor';
import { AcademicClass } from '../../entities/AcademicClass';
import { UserInstructor } from '../../entities/UserInstructor';
import { UserStudentAcademic } from 'src/entities/UserStudentAcademic';
import { TeachingSchedule } from 'src/entities/TeachingSchedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AcademicClassInstructor,
      AcademicClass,
      UserInstructor,
      UserStudentAcademic,
      TeachingSchedule,
    ]),
  ],
  controllers: [AcademicClassInstructorsController],
  providers: [AcademicClassInstructorsService],
  exports: [AcademicClassInstructorsService],
})
export class AcademicClassInstructorsModule {}
