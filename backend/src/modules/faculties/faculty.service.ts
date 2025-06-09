import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from '../../entities/Faculty';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { UserInstructor } from '../../entities/UserInstructor';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
    @InjectRepository(UserInstructor)
    private readonly instructorRepository: Repository<UserInstructor>,
  ) {}

  async create(createDto: CreateFacultyDto): Promise<Faculty> {
    const faculty = this.facultyRepository.create(createDto);
    return this.facultyRepository.save(faculty);
  }

  async findAll(): Promise<Faculty[]> {
    return this.facultyRepository.find({
      relations: {
        majors: {
          programs: {
            programCourses: {
              course: true,
            },
          },
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOne({
      where: { id },
      relations: {
        majors: {
          programs: {
            programCourses: {
              course: true,
            },
          },
        },
      },
    });

    if (!faculty) {
      throw new NotFoundException(`Faculty with ID ${id} not found`);
    }

    return faculty;
  }

  async update(id: number, updateDto: UpdateFacultyDto): Promise<Faculty> {
    const faculty = await this.findOne(id);
    Object.assign(faculty, updateDto);
    return this.facultyRepository.save(faculty);
  }

  async remove(id: number): Promise<void> {
    const faculty = await this.findOne(id);
    await this.facultyRepository.remove(faculty);
  }

  async findByCode(facultyCode: string): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOne({
      where: { facultyCode },
      relations: {
        majors: {
          programs: {
            programCourses: {
              course: true,
            },
          },
        },
      },
    });

    if (!faculty) {
      throw new NotFoundException(`Faculty with code ${facultyCode} not found`);
    }

    return faculty;
  }

  async findByInstructorId(instructorId: number): Promise<Faculty | null> {
    const instructor = await this.instructorRepository.findOne({
      where: { id: instructorId },
      relations: {
        faculty: {
          majors: {
            programs: {
              programCourses: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!instructor) {
      throw new NotFoundException(
        `Instructor with ID ${instructorId} not found`,
      );
    }

    return instructor.faculty;
  }
}
