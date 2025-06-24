import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicClassInstructor } from '../../entities/AcademicClassInstructor';
import { AcademicClass } from '../../entities/AcademicClass';
import { UserInstructor } from '../../entities/UserInstructor';
import { CreateClassInstructorDto } from './dto/create-class-instructor.dto';
import { UpdateClassInstructorDto } from './dto/update-class-instructor.dto';
import { plainToInstance } from 'class-transformer';
import { ClassInstructorResponseDto } from './dto/class-instructor-response.dto';
import { In } from 'typeorm';
import { TeachingSchedule } from '../../entities/TeachingSchedule';

@Injectable()
export class AcademicClassInstructorsService {
  constructor(
    @InjectRepository(AcademicClassInstructor)
    private readonly academicClassInstructorRepository: Repository<AcademicClassInstructor>,
    @InjectRepository(AcademicClass)
    private readonly academicClassRepository: Repository<AcademicClass>,
    @InjectRepository(UserInstructor)
    private readonly userInstructorRepository: Repository<UserInstructor>,
    @InjectRepository(TeachingSchedule)
    private readonly teachingSchedulesRepository: Repository<TeachingSchedule>,
  ) {}

  async create(
    createDto: CreateClassInstructorDto,
  ): Promise<ClassInstructorResponseDto[]> {
    // Check if class exists
    const classExists = await this.academicClassRepository.findOne({
      where: { id: createDto.classId },
    });

    if (!classExists) {
      throw new NotFoundException(
        `Academic class with ID ${createDto.classId} not found`,
      );
    }

    // Convert single instructorId to array if provided
    const instructorIds = createDto.instructorId
      ? [createDto.instructorId]
      : createDto.instructorIds || [];

    if (instructorIds.length === 0) {
      throw new BadRequestException(
        'Either instructorId or instructorIds must be provided',
      );
    }

    // Get current assignments for this class
    const currentAssignments =
      await this.academicClassInstructorRepository.find({
        where: { classId: createDto.classId },
      });

    console.log('currentAssignments', currentAssignments);
    console.log('instructorIds', instructorIds);

    // Check if all instructors exist
    const instructors = await this.userInstructorRepository.find({
      where: { id: In(instructorIds) },
    });

    if (instructors.length !== instructorIds.length) {
      const foundIds = instructors.map((i) => i.id);
      const missingIds = instructorIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Instructors with IDs ${missingIds.join(', ')} not found`,
      );
    }

    // Remove instructors that are not in the new list
    const instructorsToRemove = currentAssignments.filter(
      (assignment) =>
        !instructorIds.map(String).includes(String(assignment.instructorId)),
    );

    console.log('instructorsToRemove', instructorsToRemove);

    if (instructorsToRemove.length > 0) {
      // Kiểm tra xem có teaching schedule liên quan không
      const teachingSchedules = await this.teachingSchedulesRepository.find({
        where: {
          academicClassInstructorId: In(instructorsToRemove.map((a) => a.id)),
        },
      });
      if (teachingSchedules.length > 0) {
        throw new ConflictException(
          'Không thể xóa phân công giảng viên vì có lịch giảng dạy liên quan. Vui lòng xóa các lịch dạy trước.',
        );
      }
      await this.academicClassInstructorRepository.remove(instructorsToRemove);
    }

    // Add new instructors
    const existingInstructorIds = currentAssignments.map((a) =>
      Number(a.instructorId),
    );
    const newInstructorIds = instructorIds.filter(
      (id) => !existingInstructorIds.includes(Number(id)),
    );

    const newAssignments = newInstructorIds.map((instructorId) =>
      this.academicClassInstructorRepository.create({
        classId: createDto.classId,
        instructorId,
      }),
    );

    if (newAssignments.length > 0) {
      await this.academicClassInstructorRepository.save(newAssignments);
    }

    // Get and return updated assignments
    const updatedAssignments =
      await this.academicClassInstructorRepository.find({
        where: { classId: createDto.classId },
        relations: ['instructor'],
      });

    return plainToInstance(ClassInstructorResponseDto, updatedAssignments);
  }

  async findAll(): Promise<ClassInstructorResponseDto[]> {
    const assignments = await this.academicClassInstructorRepository.find({
      relations: [
        'academicClass',
        'instructor',
        'academicClass.major',
        'academicClass.program',
      ],
    });

    return assignments.map((assignment) =>
      plainToInstance(ClassInstructorResponseDto, assignment),
    );
  }

  async findByClassId(classId: number): Promise<ClassInstructorResponseDto[]> {
    const assignments = await this.academicClassInstructorRepository.find({
      where: { classId },
      relations: [
        'academicClass',
        'instructor',
        'academicClass.major',
        'academicClass.program',
      ],
    });

    return assignments.map((assignment) =>
      plainToInstance(ClassInstructorResponseDto, assignment),
    );
  }

  async findByInstructorId(
    instructorId: number,
  ): Promise<ClassInstructorResponseDto[]> {
    const assignments = await this.academicClassInstructorRepository.find({
      where: { instructorId },
      relations: [
        'academicClass',
        'instructor',
        'academicClass.studentsAcademic',
        'academicClass.studentsAcademic.user',
        'academicClass.major',
        'academicClass.program',
      ],
    });

    return assignments.map((assignment) =>
      plainToInstance(ClassInstructorResponseDto, assignment),
    );
  }

  async findOne(id: number): Promise<ClassInstructorResponseDto> {
    const assignment = await this.academicClassInstructorRepository.findOne({
      where: { id },
      relations: [
        'academicClass',
        'instructor',
        'academicClass.major',
        'academicClass.program',
      ],
    });

    if (!assignment) {
      throw new NotFoundException(
        `Class instructor assignment with ID ${id} not found`,
      );
    }

    return plainToInstance(ClassInstructorResponseDto, assignment);
  }

  async update(
    id: number,
    updateDto: UpdateClassInstructorDto,
  ): Promise<ClassInstructorResponseDto> {
    const assignment = await this.academicClassInstructorRepository.findOne({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Class instructor assignment with ID ${id} not found`,
      );
    }

    // If updating classId, check if class exists
    if (updateDto.classId && updateDto.classId !== assignment.classId) {
      const classExists = await this.academicClassRepository.findOne({
        where: { id: updateDto.classId },
      });

      if (!classExists) {
        throw new NotFoundException(
          `Academic class with ID ${updateDto.classId} not found`,
        );
      }
    }

    // If updating instructorId, check if instructor exists
    if (
      updateDto.instructorId &&
      updateDto.instructorId !== assignment.instructorId
    ) {
      const instructorExists = await this.userInstructorRepository.findOne({
        where: { id: updateDto.instructorId },
      });

      if (!instructorExists) {
        throw new NotFoundException(
          `Instructor with ID ${updateDto.instructorId} not found`,
        );
      }

      // Check for duplicate assignment
      const existingAssignment =
        await this.academicClassInstructorRepository.findOne({
          where: {
            classId: updateDto.classId || assignment.classId,
            instructorId: updateDto.instructorId,
          },
        });

      if (existingAssignment && existingAssignment.id !== id) {
        throw new ConflictException(
          'This instructor is already assigned to this class',
        );
      }
    }

    // Update and save
    await this.academicClassInstructorRepository.update(id, updateDto);

    const updatedAssignment =
      await this.academicClassInstructorRepository.findOne({
        where: { id },
        relations: ['academicClass', 'instructor'],
      });

    return plainToInstance(ClassInstructorResponseDto, updatedAssignment);
  }

  async remove(id: number): Promise<void> {
    const assignment = await this.academicClassInstructorRepository.findOne({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Class instructor assignment with ID ${id} not found`,
      );
    }

    await this.academicClassInstructorRepository.remove(assignment);
  }
}
