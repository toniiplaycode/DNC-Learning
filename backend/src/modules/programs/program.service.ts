import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from '../../entities/Program';
import { ProgramCourse } from '../../entities/ProgramCourse';
import { Course } from '../../entities/Course';
import { AcademicClass } from '../../entities/AcademicClass';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    @InjectRepository(ProgramCourse)
    private readonly programCourseRepository: Repository<ProgramCourse>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(AcademicClass)
    private readonly academicClassRepository: Repository<AcademicClass>,
  ) {}

  async create(createProgramDto: CreateProgramDto): Promise<Program> {
    // Check if program code already exists
    const existingProgram = await this.programRepository.findOne({
      where: { programCode: createProgramDto.programCode },
    });

    if (existingProgram) {
      throw new BadRequestException('Program code already exists');
    }

    const program = this.programRepository.create(createProgramDto);
    return this.programRepository.save(program);
  }

  async findAll(majorId?: number): Promise<Program[]> {
    const queryBuilder = this.programRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.major', 'major')
      .leftJoinAndSelect('program.programCourses', 'programCourses')
      .leftJoinAndSelect('programCourses.course', 'course')
      .orderBy('program.createdAt', 'DESC');

    if (majorId) {
      queryBuilder.where('program.majorId = :majorId', { majorId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Program> {
    const program = await this.programRepository.findOne({
      where: { id },
      relations: {
        major: true,
        programCourses: {
          course: true,
        },
        academicClasses: true,
      },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return program;
  }

  async findByCode(programCode: string): Promise<Program> {
    const program = await this.programRepository.findOne({
      where: { programCode },
      relations: {
        major: true,
        programCourses: {
          course: true,
        },
        academicClasses: true,
      },
    });

    if (!program) {
      throw new NotFoundException(`Program with code ${programCode} not found`);
    }

    return program;
  }

  async update(
    id: number,
    updateProgramDto: UpdateProgramDto,
  ): Promise<Program> {
    const program = await this.findOne(id);

    // If updating program code, check if it already exists
    if (
      updateProgramDto.programCode &&
      updateProgramDto.programCode !== program.programCode
    ) {
      const existingProgram = await this.programRepository.findOne({
        where: { programCode: updateProgramDto.programCode },
      });

      if (existingProgram) {
        throw new BadRequestException('Program code already exists');
      }
    }

    Object.assign(program, updateProgramDto);
    return this.programRepository.save(program);
  }

  async remove(id: number): Promise<void> {
    // Start transaction
    return this.programRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Find the program first to ensure it exists
        const program = await this.findOne(id);

        // Delete related academic classes first
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(AcademicClass)
          .where('programId = :programId', { programId: id })
          .execute();

        // Delete related program courses
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(ProgramCourse)
          .where('programId = :programId', { programId: id })
          .execute();

        // Delete the program
        await transactionalEntityManager.remove(Program, program);
      },
    );
  }

  // Additional methods for managing program courses
  async addCourseToProgram(
    programId: number,
    courseId: number,
    credits: number,
    isMandatory: boolean = true,
  ): Promise<ProgramCourse> {
    const program = await this.findOne(programId);
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    // Check if course already exists in program
    const existingProgramCourse = await this.programCourseRepository.findOne({
      where: { programId, courseId },
    });

    if (existingProgramCourse) {
      throw new BadRequestException('Course already exists in program');
    }

    const programCourse = this.programCourseRepository.create({
      programId,
      courseId,
      credits,
      isMandatory,
    });

    return this.programCourseRepository.save(programCourse);
  }

  async removeCourseFromProgram(
    programId: number,
    courseId: number,
  ): Promise<void> {
    const programCourse = await this.programCourseRepository.findOne({
      where: { programId, courseId },
    });

    if (!programCourse) {
      throw new NotFoundException(
        `Course with ID ${courseId} not found in program ${programId}`,
      );
    }

    await this.programCourseRepository.remove(programCourse);
  }

  async updateProgramCourse(
    programId: number,
    courseId: number,
    credits: number,
    isMandatory: boolean,
  ): Promise<ProgramCourse> {
    const programCourse = await this.programCourseRepository.findOne({
      where: { programId, courseId },
    });

    if (!programCourse) {
      throw new NotFoundException(
        `Course with ID ${courseId} not found in program ${programId}`,
      );
    }

    programCourse.credits = credits;
    programCourse.isMandatory = isMandatory;

    return this.programCourseRepository.save(programCourse);
  }
}
