import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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

  async update(
    id: number,
    updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<Assignment> {
    const assignment = await this.findOne(id);

    // Cập nhật các trường
    Object.assign(assignment, updateAssignmentDto);

    return this.assignmentsRepository.save(assignment);
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
}
