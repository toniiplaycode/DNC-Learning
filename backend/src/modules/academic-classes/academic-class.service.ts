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

        // Return class with relations
        return transactionalEntityManager.findOne(AcademicClass, {
          where: { id: savedClass.id },
          relations: [
            'studentsAcademic',
            'instructors',
            'classCourses',
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

        // Delete instructor associations first (foreign key constraint)
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(AcademicClassInstructor)
          .where('classId = :classId', { classId: id })
          .execute();

        // Delete the academic class
        return transactionalEntityManager.remove(AcademicClass, academicClass);
      },
    );
  }
}
