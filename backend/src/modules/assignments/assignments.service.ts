import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Assignment, AssignmentType } from '../../entities/Assignment';
import { CourseLesson } from '../../entities/CourseLesson';
import { AcademicClass } from '../../entities/AcademicClass';
import { UserGrade } from '../../entities/UserGrade';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { UserStudentAcademic } from '../../entities/UserStudentAcademic';
import { AcademicClassInstructor } from 'src/entities/AcademicClassInstructor';
import { UpdateEnrollmentDto } from '../enrollments/dto/update-enrollment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentsRepository: Repository<Assignment>,
    @InjectRepository(CourseLesson)
    private lessonsRepository: Repository<CourseLesson>,
    @InjectRepository(AcademicClass)
    private academicClassesRepository: Repository<AcademicClass>,
    @InjectRepository(UserGrade)
    private userGradesRepository: Repository<UserGrade>,
    @InjectRepository(UserStudentAcademic)
    private userStudentsAcademicRepository: Repository<UserStudentAcademic>,
    @InjectRepository(AcademicClassInstructor)
    private academicClassInstructorsRepository: Repository<AcademicClassInstructor>,
  ) {}

  // Các methods CRUD cơ bản
  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const assignment = this.assignmentsRepository.create(createAssignmentDto);
    return this.assignmentsRepository.save(assignment);
  }

  async findAll(
    lessonId?: number,
    academicClassId?: number,
    type?: AssignmentType,
  ): Promise<Assignment[]> {
    const where: any = {};

    if (lessonId) {
      where.lessonId = lessonId;
    }

    if (academicClassId) {
      where.academicClassId = academicClassId;
    }

    if (type) {
      where.assignmentType = type;
    }

    return this.assignmentsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Assignment> {
    const assignment = await this.assignmentsRepository.findOne({
      where: { id },
      relations: ['lesson', 'academicClass'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    return assignment;
  }

  async findByLesson(id: number): Promise<Assignment> {
    const assignment = await this.assignmentsRepository.findOne({
      where: { lessonId: id },
      relations: ['lesson', 'academicClass'],
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    return assignment;
  }

  async update(
    id: number,
    updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<Assignment> {
    try {
      // First, check if new academic class exists if academicClassId is provided
      if (updateAssignmentDto.academicClassId) {
        const newAcademicClass = await this.academicClassesRepository.findOne({
          where: { id: updateAssignmentDto.academicClassId },
        });

        if (!newAcademicClass) {
          throw new NotFoundException(
            `Không tìm thấy lớp học với ID ${updateAssignmentDto.academicClassId}`,
          );
        }
      }

      // Find existing assignment
      const existingAssignment = await this.assignmentsRepository.findOne({
        where: { id },
        relations: ['academicClass'],
      });

      if (!existingAssignment) {
        throw new NotFoundException(`Không tìm thấy bài tập với ID ${id}`);
      }

      // Create updated assignment data
      const updatedAssignment = {
        ...existingAssignment,
        ...updateAssignmentDto,
      };

      // Save the updated assignment
      await this.assignmentsRepository.save(updatedAssignment);

      // Fetch and return the updated assignment with relations
      return await this.findOne(id);
    } catch (error) {
      console.error('Error updating assignment:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể cập nhật bài tập');
    }
  }

  async remove(id: number): Promise<void> {
    const assignment = await this.findOne(id);
    await this.assignmentsRepository.remove(assignment);
  }

  // Method để tìm tất cả assignments cho sinh viên học thuật trong lớp học
  async findAllByStudentAcademicInAcademicClass(
    studentAcademicId: number,
  ): Promise<Assignment[]> {
    try {
      // Tìm thông tin sinh viên học thuật
      const studentAcademic = await this.userStudentsAcademicRepository.findOne(
        {
          where: { id: studentAcademicId },
        },
      );

      if (!studentAcademic) {
        throw new NotFoundException(
          `Không tìm thấy sinh viên học thuật với ID ${studentAcademicId}`,
        );
      }

      // Lấy academic_class_id
      const academicClassId = studentAcademic.academicClassId;

      // Tìm tất cả assignment thuộc lớp học đó
      return this.assignmentsRepository.find({
        where: { academicClassId },
        relations: ['academicClass'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('Error finding assignments:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể lấy danh sách bài tập');
    }
  }

  // Tìm tất cả assignments thông qua course
  async findAllByCourse(courseId: number): Promise<Assignment[]> {
    try {
      // Find all lessons belonging to the course using subquery
      const lessons = await this.lessonsRepository
        .createQueryBuilder('lesson')
        .where((qb) => {
          const subQuery = qb
            .subQuery()
            .select('section.id')
            .from('course_sections', 'section')
            .where('section.courseId = :courseId', { courseId })
            .getQuery();
          return 'lesson.sectionId IN ' + subQuery;
        })
        .getMany();

      if (!lessons || lessons.length === 0) {
        return [];
      }

      // Get all assignments for these lessons
      const assignments = await this.assignmentsRepository.find({
        where: {
          lessonId: In(lessons.map((lesson) => lesson.id)),
        },
        relations: ['assignmentSubmissions'],
      });

      return assignments;
    } catch (error) {
      console.error('Error finding assignments by course:', error);
      throw new BadRequestException(
        'Không thể lấy danh sách bài tập cho khóa học này',
      );
    }
  }

  // Add this method to AssignmentsService class
  async findAllByAcademicClass(academicClassId: number): Promise<Assignment[]> {
    try {
      // Verify academic class exists
      const academicClass = await this.academicClassesRepository.findOne({
        where: { id: academicClassId },
      });

      if (!academicClass) {
        throw new NotFoundException(
          `Không tìm thấy lớp học với ID ${academicClassId}`,
        );
      }

      // Get all assignments for this academic class
      const assignments = await this.assignmentsRepository.find({
        where: { academicClassId },
        relations: [
          'academicClass',
          'assignmentSubmissions',
          'assignmentSubmissions.user',
          'assignmentSubmissions.user.userStudentAcademic',
        ],
      });

      return assignments;
    } catch (error) {
      console.error('Error finding assignments by academic class:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        'Không thể lấy danh sách bài tập cho lớp học này',
      );
    }
  }

  async findAllByInstructorAcademicClasses(
    instructorId: number,
  ): Promise<Assignment[]> {
    try {
      // Get all academic classes where instructor is assigned
      const academicClassInstructors =
        await this.academicClassInstructorsRepository
          .createQueryBuilder('aci')
          .leftJoinAndSelect('aci.academicClass', 'academicClass')
          .where('aci.instructorId = :instructorId', { instructorId })
          .getMany();

      if (!academicClassInstructors.length) {
        return [];
      }

      // Get academic class IDs
      const academicClassIds = academicClassInstructors.map(
        (aci) => aci.academicClass.id,
      );

      // Get all assignments for these academic classes
      const assignments = await this.assignmentsRepository.find({
        where: {
          academicClassId: In(academicClassIds),
        },
        relations: [
          'academicClass',
          'assignmentSubmissions',
          'assignmentSubmissions.user',
          'assignmentSubmissions.user.userStudentAcademic',
          'assignmentSubmissions.user.userStudent',
        ],
        order: {
          createdAt: 'DESC',
        },
      });

      return assignments;
    } catch (error) {
      console.error(
        'Error finding instructor academic class assignments:',
        error,
      );
      throw new BadRequestException(
        'Không thể lấy danh sách bài tập của các lớp',
      );
    }
  }
}
