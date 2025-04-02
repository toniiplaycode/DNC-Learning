import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Document } from '../../entities/Document';
import { CourseSection } from '../../entities/CourseSection';
import { UserInstructor } from '../../entities/UserInstructor';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Course } from '../../entities/Course';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    @InjectRepository(CourseSection)
    private sectionsRepository: Repository<CourseSection>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(UserInstructor)
    private instructorsRepository: Repository<UserInstructor>,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    userId: number,
  ): Promise<Document> {
    // Kiểm tra section tồn tại
    const section = await this.sectionsRepository.findOne({
      where: { id: createDocumentDto.courseSectionId },
      relations: ['course'],
    });

    if (!section) {
      throw new NotFoundException(
        `Section với ID ${createDocumentDto.courseSectionId} không tồn tại`,
      );
    }

    // Tìm kiếm instructor ID từ user ID
    const instructor = await this.instructorsRepository.findOne({
      where: { userId },
    });

    // Tạo tài liệu mới
    const instructorId = createDocumentDto.instructorId || instructor?.id;

    if (!instructorId) {
      throw new BadRequestException('Người dùng không phải là giảng viên');
    }

    const document = this.documentsRepository.create({
      ...createDocumentDto,
      instructorId,
    });

    return this.documentsRepository.save(document);
  }

  async findAll(sectionId?: number): Promise<Document[]> {
    const queryBuilder = this.documentsRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.section', 'section')
      .leftJoinAndSelect('document.instructor', 'instructor')
      .leftJoinAndSelect('instructor.user', 'user');

    if (sectionId) {
      queryBuilder.where('document.courseSectionId = :sectionId', {
        sectionId,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['section', 'instructor', 'instructor.user'],
    });

    if (!document) {
      throw new NotFoundException(`Tài liệu với ID ${id} không tồn tại`);
    }

    return document;
  }

  async findBySection(sectionId: number): Promise<Document[]> {
    const section = await this.sectionsRepository.findOne({
      where: { id: sectionId },
    });

    if (!section) {
      throw new NotFoundException(`Section với ID ${sectionId} không tồn tại`);
    }

    return this.documentsRepository.find({
      where: { courseSectionId: sectionId },
      relations: ['instructor', 'instructor.user'],
    });
  }

  async findByCourse(courseId: number): Promise<Document[]> {
    // Kiểm tra khóa học tồn tại
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Khóa học với ID ${courseId} không tồn tại`);
    }

    // Lấy tất cả các section của khóa học
    const sections = await this.sectionsRepository.find({
      where: { courseId: courseId },
    });

    if (!sections.length) {
      return []; // Trả về mảng rỗng nếu khóa học không có section nào
    }

    // Lấy tất cả tài liệu thuộc các section của khóa học này
    const sectionIds = sections.map((section) => section.id);

    const documents = await this.documentsRepository.find({
      where: { courseSectionId: In(sectionIds) },
      relations: ['courseSection'],
    });

    return documents;
  }

  async update(
    id: number,
    updateDocumentDto: UpdateDocumentDto,
    userId: number,
    isAdmin = false,
    isInstructor = false,
  ): Promise<Document> {
    const document = await this.findOne(id);

    // Lấy instructor ID từ user ID
    const instructor = await this.instructorsRepository.findOne({
      where: { userId },
    });

    // Chỉ admin, người tạo, hoặc giảng viên của khóa học mới có quyền cập nhật
    if (document.instructorId !== instructor?.id && !isAdmin && !isInstructor) {
      throw new ForbiddenException('Bạn không có quyền cập nhật tài liệu này');
    }

    // Cập nhật tài liệu
    Object.assign(document, updateDocumentDto);

    return this.documentsRepository.save(document);
  }

  async remove(
    id: number,
    userId: number,
    isAdmin = false,
    isInstructor = false,
  ): Promise<void> {
    const document = await this.findOne(id);

    // Lấy instructor ID từ user ID
    const instructor = await this.instructorsRepository.findOne({
      where: { userId },
    });

    // Chỉ admin, người tạo, hoặc giảng viên của khóa học mới có quyền xóa
    if (document.instructorId !== instructor?.id && !isAdmin && !isInstructor) {
      throw new ForbiddenException('Bạn không có quyền xóa tài liệu này');
    }

    await this.documentsRepository.remove(document);
  }

  // Helper method to validate course instructor
  async isInstructorOfCourse(
    userId: number,
    sectionId: number,
  ): Promise<boolean> {
    // Lấy instructor ID từ user ID
    const instructor = await this.instructorsRepository.findOne({
      where: { userId },
    });

    if (!instructor) {
      return false;
    }

    const section = await this.sectionsRepository.findOne({
      where: { id: sectionId },
      relations: ['course'],
    });

    if (!section) {
      return false;
    }

    const courseId = section.course.id;
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
      relations: ['instructor'],
    });

    return course?.instructor?.id === instructor.id;
  }
}
