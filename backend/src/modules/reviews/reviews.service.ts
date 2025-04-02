import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus, ReviewType } from '../../entities/Review';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Course } from '../../entities/Course';
import { UserStudent } from '../../entities/UserStudent';
import { ReviewStatsDto } from './dto/review-stats.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(UserStudent)
    private studentsRepository: Repository<UserStudent>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    // Kiểm tra course tồn tại
    const course = await this.coursesRepository.findOne({
      where: { id: createReviewDto.courseId },
    });

    if (!course) {
      throw new NotFoundException(
        `Không tìm thấy khóa học với ID ${createReviewDto.courseId}`,
      );
    }

    // Kiểm tra student tồn tại
    const student = await this.studentsRepository.findOne({
      where: { id: createReviewDto.userStudentId },
    });

    if (!student) {
      throw new NotFoundException(
        `Không tìm thấy học viên với ID ${createReviewDto.userStudentId}`,
      );
    }

    // Kiểm tra học viên đã đánh giá khóa học này chưa (với cùng loại đánh giá)
    const existingReview = await this.reviewsRepository.findOne({
      where: {
        userStudentId: createReviewDto.userStudentId,
        courseId: createReviewDto.courseId,
        reviewType: createReviewDto.reviewType,
      },
    });

    if (existingReview) {
      throw new ConflictException(
        `Học viên đã đánh giá khóa học này với loại ${createReviewDto.reviewType}`,
      );
    }

    // Tạo review mới
    const newReview = this.reviewsRepository.create({
      ...createReviewDto,
      status: createReviewDto.status || ReviewStatus.PENDING, // Mặc định là PENDING
    });

    return this.reviewsRepository.save(newReview);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewsRepository.find({
      relations: ['student', 'student.user', 'course'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['student', 'student.user', 'course'],
    });

    if (!review) {
      throw new NotFoundException(`Không tìm thấy đánh giá với ID ${id}`);
    }

    return review;
  }

  async findByCourse(courseId: number): Promise<Review[]> {
    // Kiểm tra course tồn tại
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học với ID ${courseId}`);
    }

    return this.reviewsRepository.find({
      where: { courseId },
      relations: ['student', 'student.user'],
      select: {
        student: {
          id: true,
          fullName: true,
          user: {
            id: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStudent(studentId: number): Promise<Review[]> {
    // Kiểm tra student tồn tại
    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(
        `Không tìm thấy học viên với ID ${studentId}`,
      );
    }

    return this.reviewsRepository.find({
      where: { userStudentId: studentId },
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCourseStats(courseId: number): Promise<ReviewStatsDto> {
    // Kiểm tra course tồn tại
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học với ID ${courseId}`);
    }

    // Lấy tất cả đánh giá đã được phê duyệt của khóa học
    const reviews = await this.reviewsRepository.find({
      where: {
        courseId,
        status: ReviewStatus.APPROVED,
        reviewType: ReviewType.COURSE,
      },
    });

    const stats = {
      averageRating: 0,
      totalReviews: reviews.length,
      ratings: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };

    if (reviews.length > 0) {
      // Tính tổng rating và phân bố theo số sao
      let totalRating = 0;

      reviews.forEach((review) => {
        totalRating += review.rating;

        if (review.rating >= 1 && review.rating <= 5) {
          stats.ratings[review.rating as 1 | 2 | 3 | 4 | 5]++;
        }
      });

      // Tính trung bình rating, làm tròn đến 1 chữ số thập phân
      stats.averageRating =
        Math.round((totalRating / reviews.length) * 10) / 10;
    }

    return plainToClass(ReviewStatsDto, stats);
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);

    // Cập nhật thông tin đánh giá
    Object.assign(review, updateReviewDto);

    return this.reviewsRepository.save(review);
  }

  async approve(id: number): Promise<Review> {
    const review = await this.findOne(id);

    if (review.status === ReviewStatus.APPROVED) {
      throw new BadRequestException('Đánh giá này đã được phê duyệt');
    }

    review.status = ReviewStatus.APPROVED;
    return this.reviewsRepository.save(review);
  }

  async reject(id: number): Promise<Review> {
    const review = await this.findOne(id);

    if (review.status === ReviewStatus.REJECTED) {
      throw new BadRequestException('Đánh giá này đã bị từ chối');
    }

    review.status = ReviewStatus.REJECTED;
    return this.reviewsRepository.save(review);
  }

  async remove(id: number, isAdmin: boolean = false): Promise<void> {
    const review = await this.findOne(id);

    // Chỉ cho phép Admin xóa các đánh giá đã được phê duyệt
    if (review.status === ReviewStatus.APPROVED && !isAdmin) {
      throw new ForbiddenException('Không thể xóa đánh giá đã được phê duyệt');
    }

    await this.reviewsRepository.remove(review);
  }
}
