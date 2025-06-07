import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicClass } from '../../entities/AcademicClass';
import { CreateAcademicClassDto } from './dto/create-class-academic.dto';
import { UpdateAcademicClassDto } from './dto/update-class-academic.dto';
import { UserInstructor } from '../../entities/UserInstructor';
import { AcademicClassInstructor } from '../../entities/AcademicClassInstructor';
import { UserStudentAcademic } from '../../entities/UserStudentAcademic';
import { AcademicClassCourse } from '../../entities/AcademicClassCourse';
import { Major } from '../../entities/Major';
import { Program } from '../../entities/Program';
import { ProgramCourse } from '../../entities/ProgramCourse';

@Injectable()
export class AcademicClassesService {
  constructor(
    @InjectRepository(AcademicClass)
    private readonly academicClassRepo: Repository<AcademicClass>,
    @InjectRepository(AcademicClassInstructor)
    private readonly academicClassInstructorRepo: Repository<AcademicClassInstructor>,
    @InjectRepository(UserInstructor)
    private readonly userInstructorRepo: Repository<UserInstructor>,
    @InjectRepository(UserStudentAcademic)
    private readonly userStudentAcademicRepo: Repository<UserStudentAcademic>,
    @InjectRepository(AcademicClassCourse)
    private readonly academicClassCourseRepo: Repository<AcademicClassCourse>,
    @InjectRepository(Major)
    private readonly majorRepo: Repository<Major>,
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    @InjectRepository(ProgramCourse)
    private readonly programCourseRepo: Repository<ProgramCourse>,
  ) {}

  async create(createDto: CreateAcademicClassDto, instructorId: number) {
    // Start transaction
    return this.academicClassRepo.manager.transaction(
      async (transactionalEntityManager) => {
        // Validate major exists
        const major = await this.majorRepo.findOne({
          where: { id: createDto.majorId },
        });
        if (!major) {
          throw new NotFoundException(
            `Major with ID ${createDto.majorId} not found`,
          );
        }

        // Validate program exists and belongs to the major
        const program = await this.programRepo.findOne({
          where: { id: createDto.programId, majorId: createDto.majorId },
        });
        if (!program) {
          throw new BadRequestException(
            `Program with ID ${createDto.programId} not found or does not belong to major ${createDto.majorId}`,
          );
        }

        // Create academic class
        const academicClass = this.academicClassRepo.create(createDto);
        const savedClass = await transactionalEntityManager.save(academicClass);

        // Create instructor association
        const classInstructor = this.academicClassInstructorRepo.create({
          classId: savedClass.id,
          instructorId: instructorId,
        });
        await transactionalEntityManager.save(classInstructor);

        // Get all courses from the program
        const programCourses = await this.programCourseRepo.find({
          where: { programId: createDto.programId },
        });

        // Create AcademicClassCourse entries for each program course
        if (programCourses.length > 0) {
          const academicClassCourses = programCourses.map((programCourse) =>
            this.academicClassCourseRepo.create({
              classId: savedClass.id,
              courseId: programCourse.courseId,
            }),
          );
          await transactionalEntityManager.save(academicClassCourses);
        }

        // Return class with relations
        return transactionalEntityManager.findOne(AcademicClass, {
          where: { id: savedClass.id },
          relations: [
            'studentsAcademic',
            'instructors',
            'classCourses',
            'classCourses.course',
            'major',
            'program',
          ],
        });
      },
    );
  }

  async findAll() {
    return this.academicClassRepo.find({
      relations: [
        'studentsAcademic',
        'studentsAcademic.user',
        'instructors',
        'instructors.instructor',
        'classCourses',
        'classCourses.course',
        'major',
        'program',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const academicClass = await this.academicClassRepo.findOne({
      where: { id },
      relations: [
        'studentsAcademic',
        'instructors',
        'classCourses',
        'major',
        'program',
      ],
    });

    if (!academicClass) {
      throw new NotFoundException(`Academic class with ID ${id} not found`);
    }

    return academicClass;
  }

  async getClassProgramCourses(id: number) {
    // First get the academic class to ensure it exists and get its program
    const academicClass = await this.academicClassRepo.findOne({
      where: { id },
      relations: ['program'],
    });

    if (!academicClass) {
      throw new NotFoundException(`Academic class with ID ${id} not found`);
    }

    // Get all program courses for this program
    const programCourses = await this.programCourseRepo.find({
      where: { programId: academicClass.programId },
      relations: ['course'],
    });

    return programCourses;
  }

  async update(id: number, updateDto: UpdateAcademicClassDto) {
    const academicClass = await this.findOne(id);

    console.log(updateDto);

    // If updating major or program, validate the new values
    if (updateDto.majorId || updateDto.programId) {
      const majorId = updateDto.majorId || academicClass.majorId;
      const programId = updateDto.programId || academicClass.programId;

      // Validate major exists
      const major = await this.majorRepo.findOne({
        where: { id: majorId },
      });

      if (!major) {
        throw new NotFoundException(`Major with ID ${majorId} not found`);
      }

      // Validate program exists and belongs to the major
      const program = await this.programRepo.findOne({
        where: { id: programId, majorId },
      });
      if (!program) {
        throw new BadRequestException(
          `Program with ID ${programId} not found or does not belong to major ${majorId}`,
        );
      }
    }

    Object.assign(academicClass, updateDto);
    return this.academicClassRepo.save(academicClass);
  }

  async remove(id: number) {
    // Start transaction
    return this.academicClassRepo.manager.transaction(
      async (transactionalEntityManager) => {
        // Find the class first to ensure it exists
        const academicClass = await this.findOne(id);

        // Delete class courses first (foreign key constraint)
        await transactionalEntityManager.delete(AcademicClassCourse, {
          classId: id,
        });

        // Delete instructor associations
        await transactionalEntityManager.delete(AcademicClassInstructor, {
          classId: id,
        });

        // Delete the academic class
        return transactionalEntityManager.remove(AcademicClass, academicClass);
      },
    );
  }
}
