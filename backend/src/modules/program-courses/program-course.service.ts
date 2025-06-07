import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramCourse } from '../../entities/ProgramCourse';
import { CreateProgramCourseDto } from './dto/create-program-course.dto';
import { UpdateProgramCourseDto } from './dto/update-program-course.dto';
import { Program } from '../../entities/Program';
import { Course } from '../../entities/Course';
import { AcademicClass } from '../../entities/AcademicClass';
import { AcademicClassCourse } from '../../entities/AcademicClassCourse';
import { In } from 'typeorm';

@Injectable()
export class ProgramCourseService {
  constructor(
    @InjectRepository(ProgramCourse)
    private programCourseRepository: Repository<ProgramCourse>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(AcademicClass)
    private academicClassRepository: Repository<AcademicClass>,
    @InjectRepository(AcademicClassCourse)
    private academicClassCourseRepository: Repository<AcademicClassCourse>,
  ) {}

  async create(createDto: CreateProgramCourseDto): Promise<ProgramCourse> {
    // Check if program exists
    const program = await this.programRepository.findOne({
      where: { id: createDto.programId },
    });
    if (!program) {
      throw new NotFoundException(
        `Program with ID ${createDto.programId} not found`,
      );
    }

    // Check if course exists
    const course = await this.courseRepository.findOne({
      where: { id: createDto.courseId },
    });
    if (!course) {
      throw new NotFoundException(
        `Course with ID ${createDto.courseId} not found`,
      );
    }

    // Check if the course is already in the program
    const existingProgramCourse = await this.programCourseRepository.findOne({
      where: {
        programId: createDto.programId,
        courseId: createDto.courseId,
      },
    });
    if (existingProgramCourse) {
      throw new BadRequestException('Course is already in this program');
    }

    // Create the program course
    const programCourse = this.programCourseRepository.create(createDto);
    const savedProgramCourse =
      await this.programCourseRepository.save(programCourse);

    // Find all academic classes belonging to this program
    const academicClasses = await this.academicClassRepository.find({
      where: { programId: createDto.programId },
    });

    // Create AcademicClassCourse entries for each academic class
    const academicClassCourses = academicClasses.map((academicClass) =>
      this.academicClassCourseRepository.create({
        classId: academicClass.id,
        courseId: createDto.courseId,
      }),
    );

    // Save all academic class courses
    if (academicClassCourses.length > 0) {
      await this.academicClassCourseRepository.save(academicClassCourses);
    }

    return savedProgramCourse;
  }

  async findAll(): Promise<ProgramCourse[]> {
    return this.programCourseRepository.find({
      relations: ['program', 'course'],
    });
  }

  async findByProgram(programId: number): Promise<ProgramCourse[]> {
    return this.programCourseRepository.find({
      where: { programId },
      relations: ['course'],
    });
  }

  async findByCourse(courseId: number): Promise<ProgramCourse[]> {
    return this.programCourseRepository.find({
      where: { courseId },
      relations: ['program'],
    });
  }

  async findOne(id: number): Promise<ProgramCourse> {
    const programCourse = await this.programCourseRepository.findOne({
      where: { id },
      relations: ['program', 'course'],
    });
    if (!programCourse) {
      throw new NotFoundException(`Program course with ID ${id} not found`);
    }
    return programCourse;
  }

  async update(
    id: number,
    updateDto: UpdateProgramCourseDto,
  ): Promise<ProgramCourse> {
    const programCourse = await this.findOne(id);

    // If updating programId, check if new program exists
    if (
      updateDto.programId &&
      updateDto.programId !== programCourse.programId
    ) {
      const program = await this.programRepository.findOne({
        where: { id: updateDto.programId },
      });
      if (!program) {
        throw new NotFoundException(
          `Program with ID ${updateDto.programId} not found`,
        );
      }
    }

    // If updating courseId, check if new course exists
    if (updateDto.courseId && updateDto.courseId !== programCourse.courseId) {
      const course = await this.courseRepository.findOne({
        where: { id: updateDto.courseId },
      });
      if (!course) {
        throw new NotFoundException(
          `Course with ID ${updateDto.courseId} not found`,
        );
      }

      // Check if the new course is already in the program
      const existingProgramCourse = await this.programCourseRepository.findOne({
        where: {
          programId: programCourse.programId,
          courseId: updateDto.courseId,
        },
      });
      if (existingProgramCourse) {
        throw new BadRequestException('Course is already in this program');
      }
    }

    Object.assign(programCourse, updateDto);
    return this.programCourseRepository.save(programCourse);
  }

  async remove(id: number): Promise<void> {
    const programCourse = await this.findOne(id);

    // Find all academic classes in this program
    const academicClasses = await this.academicClassRepository.find({
      where: { programId: programCourse.programId },
      select: ['id'],
    });

    // Delete all related AcademicClassCourse entries
    if (academicClasses.length > 0) {
      await this.academicClassCourseRepository.delete({
        courseId: programCourse.courseId,
        classId: In(academicClasses.map((ac) => ac.id)),
      });
    }

    // Delete the ProgramCourse
    await this.programCourseRepository.remove(programCourse);
  }

  async removeByProgramAndCourse(
    programId: number,
    courseId: number,
  ): Promise<void> {
    const programCourse = await this.programCourseRepository.findOne({
      where: { programId, courseId },
    });
    if (!programCourse) {
      throw new NotFoundException(
        `Program course with program ID ${programId} and course ID ${courseId} not found`,
      );
    }

    // Find all academic classes in this program
    const academicClasses = await this.academicClassRepository.find({
      where: { programId },
      select: ['id'],
    });

    // Delete all related AcademicClassCourse entries
    if (academicClasses.length > 0) {
      await this.academicClassCourseRepository.delete({
        courseId,
        classId: In(academicClasses.map((ac) => ac.id)),
      });
    }

    // Delete the ProgramCourse
    await this.programCourseRepository.remove(programCourse);
  }
}
