import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicClass } from '../../entities/AcademicClass';
import { AcademicClassInstructor } from '../../entities/AcademicClassInstructor';
import { AcademicClassesController } from './academic-class.controller';
import { AcademicClassesService } from './academic-class.service';
import { UserStudentAcademic } from 'src/entities/UserStudentAcademic';
import { AcademicClassCourse } from 'src/entities/AcademicClassCourse';
import { UserInstructor } from 'src/entities/UserInstructor';
import { UserStudent } from 'src/entities/UserStudent';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AcademicClass,
      AcademicClassCourse,
      AcademicClassInstructor,
      UserStudentAcademic,
      UserInstructor,
      UserStudent,
    ]),
  ],
  controllers: [AcademicClassesController],
  providers: [AcademicClassesService],
  exports: [AcademicClassesService],
})
export class AcademicClassesModule {}
