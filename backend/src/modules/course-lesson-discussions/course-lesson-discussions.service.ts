import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CourseLessonDiscussion,
  DiscussionStatus,
} from '../../entities/CourseLessonDiscussion';
import { CourseLesson } from '../../entities/CourseLesson';
import { User } from '../../entities/User';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';

@Injectable()
export class CourseLessonDiscussionsService {
  constructor(
    @InjectRepository(CourseLessonDiscussion)
    private discussionsRepository: Repository<CourseLessonDiscussion>,
    @InjectRepository(CourseLesson)
    private lessonsRepository: Repository<CourseLesson>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    createDiscussionDto: CreateDiscussionDto,
    userId: number,
  ): Promise<CourseLessonDiscussion> {
    // Kiểm tra lesson tồn tại
    const lesson = await this.lessonsRepository.findOne({
      where: { id: createDiscussionDto.lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(
        `Bài học với ID ${createDiscussionDto.lessonId} không tồn tại`,
      );
    }

    // Kiểm tra parentId hợp lệ (nếu có)
    if (createDiscussionDto.parentId) {
      const parentDiscussion = await this.discussionsRepository.findOne({
        where: {
          id: createDiscussionDto.parentId,
          lessonId: createDiscussionDto.lessonId,
        },
      });

      if (!parentDiscussion) {
        throw new BadRequestException(
          `Thảo luận cha với ID ${createDiscussionDto.parentId} không tồn tại`,
        );
      }

      // Chỉ cho phép phản hồi thảo luận gốc (không cho phép phản hồi của phản hồi)
      if (parentDiscussion.parentId !== null) {
        throw new BadRequestException(
          'Không thể trả lời một phản hồi. Chỉ có thể trả lời thảo luận gốc.',
        );
      }
    }

    // Tạo thảo luận mới
    const discussion = this.discussionsRepository.create({
      ...createDiscussionDto,
      userId,
      status: createDiscussionDto.status || DiscussionStatus.ACTIVE,
    });

    return this.discussionsRepository.save(discussion);
  }

  async findAll(lessonId?: number): Promise<CourseLessonDiscussion[]> {
    const queryBuilder = this.discussionsRepository
      .createQueryBuilder('discussion')
      // Clear any previous selections and explicitly select what we need
      .select([
        'discussion.id',
        'discussion.content',
        'discussion.createdAt',
        'discussion.updatedAt',
        'discussion.status',
        'discussion.lessonId',
        'user.id',
        'user.username',
        'user.email',
        'user.role',
        'user.avatarUrl',
      ])
      .leftJoin('discussion.user', 'user')
      .leftJoin('discussion.replies', 'replies', 'replies.status = :status', {
        status: DiscussionStatus.ACTIVE,
      })
      // Select specific fields from replies
      .addSelect([
        'replies.id',
        'replies.content',
        'replies.createdAt',
        'replies.updatedAt',
        'replies.status',
        'replyUser.id',
        'replyUser.username',
        'replyUser.email',
        'replyUser.role',
        'replyUser.avatarUrl',
      ])
      .leftJoin('replies.user', 'replyUser')
      .where('discussion.parentId IS NULL'); // Chỉ lấy thảo luận gốc

    if (lessonId) {
      queryBuilder.andWhere('discussion.lessonId = :lessonId', { lessonId });
    }

    return queryBuilder.orderBy('discussion.createdAt', 'DESC').getMany();
  }

  async findOne(id: number): Promise<CourseLessonDiscussion> {
    const discussion = await this.discussionsRepository.findOne({
      where: { id },
      relations: ['user', 'replies', 'replies.user'],
    });

    if (!discussion) {
      throw new NotFoundException(`Thảo luận với ID ${id} không tồn tại`);
    }

    return discussion;
  }

  async findByLesson(lessonId: number): Promise<CourseLessonDiscussion[]> {
    return this.findAll(lessonId);
  }

  async update(
    id: number,
    updateDiscussionDto: UpdateDiscussionDto,
    userId: number,
    isAdmin: boolean = false,
  ): Promise<CourseLessonDiscussion> {
    const discussion = await this.findOne(id);

    // Người dùng chỉ có thể sửa thảo luận của chính họ, trừ khi là admin
    if (discussion.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền sửa thảo luận này');
    }

    // Cập nhật thảo luận
    Object.assign(discussion, updateDiscussionDto);

    return this.discussionsRepository.save(discussion);
  }

  async remove(
    id: number,
    userId: number,
    isAdmin: boolean = false,
  ): Promise<void> {
    const discussion = await this.findOne(id);

    // Người dùng chỉ có thể xóa thảo luận của chính họ, trừ khi là admin
    if (discussion.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền xóa thảo luận này');
    }

    // Nếu là thảo luận gốc, cũng xóa tất cả phản hồi
    if (discussion.parentId === null && discussion.replies?.length > 0) {
      await this.discussionsRepository.remove(discussion.replies);
    }

    await this.discussionsRepository.remove(discussion);
  }

  /**
   * Ẩn thảo luận (thay vì xóa hoàn toàn)
   */
  async hideDiscussion(
    id: number,
    userId: number,
    isAdmin: boolean = false,
  ): Promise<CourseLessonDiscussion> {
    const discussion = await this.findOne(id);

    // Người dùng chỉ có thể ẩn thảo luận của chính họ, trừ khi là admin
    if (discussion.userId !== userId && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền ẩn thảo luận này');
    }

    discussion.status = DiscussionStatus.HIDDEN;
    return this.discussionsRepository.save(discussion);
  }
}
