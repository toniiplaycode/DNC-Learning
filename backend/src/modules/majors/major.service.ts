import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Major } from '../../entities/Major';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { Program } from '../../entities/Program';
import { AcademicClass } from '../../entities/AcademicClass';

@Injectable()
export class MajorService {
  constructor(
    @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
    @InjectRepository(Program)
    private readonly programRepository: Repository<Program>,
    @InjectRepository(AcademicClass)
    private readonly academicClassRepository: Repository<AcademicClass>,
  ) {}

  async create(createDto: CreateMajorDto): Promise<Major> {
    const major = this.majorRepository.create(createDto);
    return this.majorRepository.save(major);
  }

  async findAll(): Promise<Major[]> {
    return this.majorRepository.find({
      relations: {
        faculty: true,
        programs: {
          programCourses: {
            course: true,
          },
        },
        academicClasses: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Major> {
    const major = await this.majorRepository.findOne({
      where: { id },
      relations: {
        faculty: true,
        programs: {
          programCourses: {
            course: true,
          },
        },
        academicClasses: true,
      },
    });

    if (!major) {
      throw new NotFoundException(`Major with ID ${id} not found`);
    }

    return major;
  }

  async findByCode(majorCode: string): Promise<Major> {
    const major = await this.majorRepository.findOne({
      where: { majorCode },
      relations: {
        faculty: true,
        programs: {
          programCourses: {
            course: true,
          },
        },
        academicClasses: true,
      },
    });

    if (!major) {
      throw new NotFoundException(`Major with code ${majorCode} not found`);
    }

    return major;
  }

  async findByFaculty(facultyId: number): Promise<Major[]> {
    return this.majorRepository.find({
      where: { facultyId },
      relations: {
        programs: {
          programCourses: {
            course: true,
          },
        },
        academicClasses: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, updateDto: UpdateMajorDto): Promise<Major> {
    const major = await this.findOne(id);
    Object.assign(major, updateDto);
    return this.majorRepository.save(major);
  }

  async remove(id: number): Promise<void> {
    // Start transaction
    return this.majorRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Find the major first to ensure it exists
        const major = await this.findOne(id);

        // Delete related academic classes first
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(AcademicClass)
          .where('majorId = :majorId', { majorId: id })
          .execute();

        // Delete related programs
        await transactionalEntityManager
          .createQueryBuilder()
          .delete()
          .from(Program)
          .where('majorId = :majorId', { majorId: id })
          .execute();

        // Delete the major
        await transactionalEntityManager.remove(Major, major);
      },
    );
  }
}
