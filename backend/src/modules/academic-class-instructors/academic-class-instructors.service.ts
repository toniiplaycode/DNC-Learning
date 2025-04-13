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

@Injectable()
export class AcademicClassInstructorsService {
  constructor(
    @InjectRepository(AcademicClassInstructor)
    private readonly academicClassInstructorRepository: Repository<AcademicClassInstructor>,
    @InjectRepository(AcademicClass)
    private readonly academicClassRepository: Repository<AcademicClass>,
    @InjectRepository(UserInstructor)
    private readonly userInstructorRepository: Repository<UserInstructor>,
  ) {}

  async create(
    createDto: CreateClassInstructorDto,
  ): Promise<ClassInstructorResponseDto> {
    // Check if class exists
    const classExists = await this.academicClassRepository.findOne({
      where: { id: createDto.classId },
    });

    if (!classExists) {
      throw new NotFoundException(
        `Academic class with ID ${createDto.classId} not found`,
      );
    }

    // Check if instructor exists
    const instructorExists = await this.userInstructorRepository.findOne({
      where: { id: createDto.instructorId },
    });

    if (!instructorExists) {
      throw new NotFoundException(
        `Instructor with ID ${createDto.instructorId} not found`,
      );
    }

    // Check if assignment already exists
    const existingAssignment =
      await this.academicClassInstructorRepository.findOne({
        where: {
          classId: createDto.classId,
          instructorId: createDto.instructorId,
        },
      });

    if (existingAssignment) {
      throw new ConflictException(
        'This instructor is already assigned to this class',
      );
    }

    // Create new assignment
    const newAssignment =
      this.academicClassInstructorRepository.create(createDto);
    const savedAssignment =
      await this.academicClassInstructorRepository.save(newAssignment);

    // Return formatted response
    return plainToInstance(ClassInstructorResponseDto, savedAssignment);
  }

  async findAll(): Promise<ClassInstructorResponseDto[]> {
    const assignments = await this.academicClassInstructorRepository.find({
      relations: ['academicClass', 'instructor'],
    });

    return assignments.map((assignment) =>
      plainToInstance(ClassInstructorResponseDto, assignment),
    );
  }

  async findByClassId(classId: number): Promise<ClassInstructorResponseDto[]> {
    const assignments = await this.academicClassInstructorRepository.find({
      where: { classId },
      relations: ['academicClass', 'instructor'],
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
      ],
    });

    return assignments.map((assignment) =>
      plainToInstance(ClassInstructorResponseDto, assignment),
    );
  }

  async findOne(id: number): Promise<ClassInstructorResponseDto> {
    const assignment = await this.academicClassInstructorRepository.findOne({
      where: { id },
      relations: ['academicClass', 'instructor'],
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
