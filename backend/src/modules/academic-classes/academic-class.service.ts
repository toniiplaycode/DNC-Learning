import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicClass } from '../../entities/AcademicClass';
import { CreateAcademicClassDto } from './dto/create-class-academic.dto';
import { UpdateAcademicClassDto } from './dto/update-class-academic.dto';
import { UserInstructor } from '../../entities/UserInstructor';
import { AcademicClassInstructor } from 'src/entities/AcademicClassInstructor';
import { UserStudentAcademic } from 'src/entities/UserStudentAcademic';
import { AcademicClassCourse } from 'src/entities/AcademicClassCourse';

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
  ) {}

  async create(createDto: CreateAcademicClassDto, instructorId: number) {
    // Start transaction
    return this.academicClassRepo.manager.transaction(
      async (transactionalEntityManager) => {
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
          relations: ['studentsAcademic', 'instructors', 'classCourses'],
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
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const academicClass = await this.academicClassRepo.findOne({
      where: { id },
      relations: ['studentsAcademic', 'instructors', 'classCourses'],
    });

    if (!academicClass) {
      throw new NotFoundException(`Academic class with ID ${id} not found`);
    }

    return academicClass;
  }

  async update(id: number, updateDto: UpdateAcademicClassDto) {
    const academicClass = await this.findOne(id);
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
