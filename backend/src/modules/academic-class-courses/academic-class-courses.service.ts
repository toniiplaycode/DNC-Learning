import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AcademicClassCourse } from '../../entities/AcademicClassCourse';

interface CreateClassCoursesDto {
  classId: number;
  courseIds: number[];
}

@Injectable()
export class AcademicClassCoursesService {
  constructor(
    @InjectRepository(AcademicClassCourse)
    private readonly academicClassCourseRepo: Repository<AcademicClassCourse>,
  ) {}

  async findAll() {
    return this.academicClassCourseRepo.find({
      relations: ['academicClass', 'course'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const classCourse = await this.academicClassCourseRepo.findOne({
      where: { id },
      relations: [
        'academicClass',
        'course',
        'course.category',
        'course.instructor',
        'course.instructor.user',
      ],
    });

    if (!classCourse) {
      throw new NotFoundException('Academic class course not found');
    }

    return {
      id: classCourse.id,
      classId: classCourse.classId,
      courseId: classCourse.courseId,
      academicClass: classCourse.academicClass,
      course: {
        ...classCourse.course,
        instructor: {
          id: classCourse.course.instructor.id,
          fullName: classCourse.course.instructor.fullName,
          professionalTitle: classCourse.course.instructor.professionalTitle,
          avatarUrl: classCourse.course.instructor.user?.avatarUrl,
        },
      },
    };
  }

  async create(data: CreateClassCoursesDto) {
    // Validate all courses exist
    const courses = await this.academicClassCourseRepo.manager
      .getRepository('courses')
      .find({
        where: {
          id: In(data.courseIds),
        },
        relations: ['instructor'],
      });

    if (courses.length !== data.courseIds.length) {
      const foundIds = courses.map((c) => c.id);
      const missingIds = data.courseIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Courses with IDs ${missingIds.join(', ')} not found`,
      );
    }

    // Create class courses
    const classCourses = data.courseIds.map((courseId) =>
      this.academicClassCourseRepo.create({
        classId: data.classId,
        courseId: courseId,
      }),
    );

    // Save all class courses
    const savedCourses = await this.academicClassCourseRepo.save(classCourses);

    // Return with relations
    return this.academicClassCourseRepo.find({
      where: { id: In(savedCourses.map((c) => c.id)) },
      relations: [
        'course',
        'course.category',
        'course.instructor',
        'course.instructor.user',
      ],
    });
  }

  async update(id: number, data: Partial<AcademicClassCourse>) {
    const existing = await this.findOne(id);

    // Only allow updating classId or courseId
    const updateData = {
      ...(data.classId && { classId: data.classId }),
      ...(data.courseId && { courseId: data.courseId }),
    };

    await this.academicClassCourseRepo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    const classCourse = await this.academicClassCourseRepo.findOneOrFail({
      where: { id },
    });
    return this.academicClassCourseRepo.remove(classCourse);
  }

  async findCoursesByClassId(classId: number) {
    const classCourses = await this.academicClassCourseRepo.find({
      where: { classId },
      relations: [
        'course',
        'course.category',
        'course.instructor',
        'course.instructor.user',
      ],
      order: {
        createdAt: 'DESC',
      },
    });

    if (!classCourses.length) {
      throw new NotFoundException(`No courses found for class ID ${classId}`);
    }

    return classCourses.map((classCourse) => ({
      id: classCourse.course.id,
      title: classCourse.course.title,
      description: classCourse.course.description,
      thumbnailUrl: classCourse.course.thumbnailUrl,
      category: classCourse.course.category,
      instructor: {
        id: classCourse.course.instructor.id,
        fullName: classCourse.course.instructor.fullName,
        professionalTitle: classCourse.course.instructor.professionalTitle,
        avatarUrl: classCourse.course.instructor.user?.avatarUrl,
      },
    }));
  }
}
