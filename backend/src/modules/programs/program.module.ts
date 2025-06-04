import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Program } from '../../entities/Program';
import { ProgramCourse } from '../../entities/ProgramCourse';
import { Course } from '../../entities/Course';
import { AcademicClass } from '../../entities/AcademicClass';
import { ProgramController } from './program.controller';
import { ProgramService } from './program.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Program, ProgramCourse, Course, AcademicClass]),
  ],
  controllers: [ProgramController],
  providers: [ProgramService],
  exports: [ProgramService],
})
export class ProgramModule {}
