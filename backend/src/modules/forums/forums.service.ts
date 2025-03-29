import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Forum, ForumStatus } from '../../entities/Forum';
import { ForumReply } from '../../entities/ForumReply';
import { ForumLike } from '../../entities/ForumLike';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { CreateForumReplyDto } from './dto/create-forum-reply.dto';
import { UpdateForumReplyDto } from './dto/update-forum-reply.dto';
import { User, UserRole } from '../../entities/User';

@Injectable()
export class ForumsService {
  constructor(
    @InjectRepository(Forum)
    private forumRepository: Repository<Forum>,
    @InjectRepository(ForumReply)
    private forumReplyRepository: Repository<ForumReply>,
    @InjectRepository(ForumLike)
    private forumLikeRepository: Repository<ForumLike>,
  ) {}

  // ===== FORUM METHODS =====

  async findAll(
    courseId?: number,
    status?: ForumStatus,
    userId?: number,
  ): Promise<Forum[]> {
    const query = this.forumRepository
      .createQueryBuilder('forum')
      .leftJoinAndSelect('forum.user', 'user')
      .leftJoinAndSelect('forum.course', 'course')
      .select([
        'forum',
        'user.id',
        'user.username',
        'user.avatarUrl',
        'course.id',
        'course.title',
      ]);

    if (courseId) {
      query.andWhere('forum.courseId = :courseId', { courseId });
    }

    if (status) {
      query.andWhere('forum.status = :status', { status });
    }

    const forums = await query.getMany();

    // Fetch additional counts
    const forumIds = forums.map((forum) => forum.id);

    if (forumIds.length > 0) {
      // Get reply counts for all forums
      const replyCounts = await this.forumReplyRepository
        .createQueryBuilder('reply')
        .select('reply.forumId', 'forumId')
        .addSelect('COUNT(reply.id)', 'count')
        .where('reply.forumId IN (:...forumIds)', { forumIds })
        .groupBy('reply.forumId')
        .getRawMany();

      // Get solved status for all forums
      const solvedStatuses = await this.forumReplyRepository
        .createQueryBuilder('reply')
        .select('reply.forumId', 'forumId')
        .where('reply.forumId IN (:...forumIds)', { forumIds })
        .andWhere('reply.isSolution = true')
        .getRawMany();

      // Get like counts for all forums
      const likeCounts = await this.forumLikeRepository
        .createQueryBuilder('like')
        .select('like.forumId', 'forumId')
        .addSelect('COUNT(like.id)', 'count')
        .where('like.forumId IN (:...forumIds)', { forumIds })
        .groupBy('like.forumId')
        .getRawMany();

      // Get user likes for all forums if userId is provided
      let userLikes: ForumLike[] = [];
      if (userId) {
        userLikes = (await this.forumLikeRepository.find({
          where: { userId },
        })) as ForumLike[];
      }

      // Assign counts and flags to forums
      forums.forEach((forum) => {
        const replyCount = replyCounts.find((r) => r.forumId == forum.id);
        forum.replyCount = replyCount ? parseInt(replyCount.count) : 0;

        const likeCount = likeCounts.find((l) => l.forumId == forum.id);
        forum.likeCount = likeCount ? parseInt(likeCount.count) : 0;

        forum.isLiked = userLikes.some((l) => l.forumId == forum.id);
      });
    }

    return forums;
  }

  async findOne(id: number, userId?: number): Promise<Forum> {
    const forum = await this.forumRepository
      .createQueryBuilder('forum')
      .leftJoinAndSelect('forum.user', 'user')
      .leftJoinAndSelect('forum.course', 'course')
      .where('forum.id = :id', { id })
      .select([
        'forum',
        'user.id',
        'user.username',
        'user.avatarUrl',
        'course.id',
        'course.title',
      ])
      .getOne();

    if (!forum) {
      throw new NotFoundException(`Forum với ID ${id} không tồn tại`);
    }

    // Get reply count
    const replyCount = await this.forumReplyRepository.count({
      where: { forumId: id },
    });
    forum.replyCount = replyCount;

    // Get like count
    const likeCount = await this.forumLikeRepository.count({
      where: { forumId: id },
    });
    forum.likeCount = likeCount;

    // Check if user liked
    if (userId) {
      const userLike = await this.forumLikeRepository.findOne({
        where: { forumId: id, userId },
      });
      forum.isLiked = !!userLike;
    }

    return forum;
  }

  async create(createForumDto: CreateForumDto, userId: number): Promise<Forum> {
    const newForum = this.forumRepository.create({
      ...createForumDto,
      userId,
    });

    return this.forumRepository.save(newForum);
  }

  async update(
    id: number,
    updateForumDto: UpdateForumDto,
    user: User,
  ): Promise<Forum> {
    const forum = await this.findOne(id);

    // Check permissions (owner or admin/instructor)
    if (
      user.id !== forum.userId &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.INSTRUCTOR
    ) {
      throw new ForbiddenException('Bạn không có quyền cập nhật diễn đàn này');
    }

    // Update forum
    await this.forumRepository.update(id, updateForumDto);
    return this.findOne(id);
  }

  async remove(id: number, user: User): Promise<void> {
    const forum = await this.findOne(id);

    // Check permissions (owner or admin/instructor)
    if (
      user.id !== forum.userId &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.INSTRUCTOR
    ) {
      throw new ForbiddenException('Bạn không có quyền xóa diễn đàn này');
    }

    await this.forumRepository.delete(id);
  }

  // ===== FORUM REPLY METHODS =====

  async findRepliesByForumId(
    forumId: number,
    userId?: number,
  ): Promise<ForumReply[]> {
    const forum = await this.findOne(forumId);

    const replies = await this.forumReplyRepository
      .createQueryBuilder('reply')
      .leftJoinAndSelect('reply.user', 'user')
      .where('reply.forumId = :forumId', { forumId })
      .select([
        'reply',
        'user.id',
        'user.username',
        'user.avatarUrl',
        'user.role',
      ])
      .orderBy('reply.createdAt', 'ASC')
      .getMany();

    // Calculate likes for each reply
    for (const reply of replies) {
      reply.likeCount = 0;

      if (userId) {
        reply.isLiked = false;
      }
    }

    return replies;
  }

  async findOneReply(id: number, userId?: number): Promise<ForumReply> {
    const reply = await this.forumReplyRepository.findOne({
      where: { id },
      relations: ['user', 'forum'],
    });

    if (!reply) {
      throw new NotFoundException('Không tìm thấy bình luận');
    }

    reply.likeCount = 0;
    reply.isLiked = false;

    return reply;
  }

  async createReply(
    createReplyDto: CreateForumReplyDto,
    userId: number,
  ): Promise<ForumReply> {
    const forum = await this.findOne(createReplyDto.forumId);

    if (forum.status !== ForumStatus.ACTIVE) {
      throw new BadRequestException(
        'Không thể trả lời trong diễn đàn đã đóng hoặc lưu trữ',
      );
    }

    const newReply = this.forumReplyRepository.create({
      ...createReplyDto,
      userId,
    });

    return this.forumReplyRepository.save(newReply);
  }

  async updateReply(
    id: number,
    updateReplyDto: UpdateForumReplyDto,
    user: User,
  ): Promise<ForumReply> {
    const reply = await this.findOneReply(id);

    // Check permissions (owner or admin/instructor)
    if (
      user.id !== reply.userId &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.INSTRUCTOR
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền cập nhật câu trả lời này',
      );
    }

    await this.forumReplyRepository.update(id, updateReplyDto);
    return this.findOneReply(id);
  }

  async removeReply(id: number, user: User): Promise<void> {
    const reply = await this.findOneReply(id);

    // Check permissions (owner or admin/instructor)
    if (
      user.id !== reply.userId &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.INSTRUCTOR
    ) {
      throw new ForbiddenException('Bạn không có quyền xóa câu trả lời này');
    }

    await this.forumReplyRepository.delete(id);
  }

  async markAsSolution(
    replyId: number,
    forumId: number,
    user: User,
  ): Promise<ForumReply> {
    const forum = await this.findOne(forumId);
    const reply = await this.findOneReply(replyId);

    // Check if reply belongs to forum
    if (reply.forumId !== forumId) {
      throw new BadRequestException(
        'Câu trả lời này không thuộc về diễn đàn đã chọn',
      );
    }

    // Check permissions (forum owner or admin/instructor)
    if (
      user.id !== forum.userId &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.INSTRUCTOR
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền đánh dấu câu trả lời này là giải pháp',
      );
    }

    // Clear any existing solution
    await this.forumReplyRepository.update(
      { forumId, isSolution: true },
      { isSolution: false },
    );

    // Mark as solution
    await this.forumReplyRepository.update(replyId, { isSolution: true });

    return this.findOneReply(replyId);
  }

  async unmarkAsSolution(
    replyId: number,
    forumId: number,
    user: User,
  ): Promise<ForumReply> {
    const forum = await this.findOne(forumId);
    const reply = await this.findOneReply(replyId);

    // Check if reply belongs to forum
    if (reply.forumId !== forumId) {
      throw new BadRequestException(
        'Câu trả lời này không thuộc về diễn đàn đã chọn',
      );
    }

    // Check permissions (forum owner or admin/instructor)
    if (
      user.id !== forum.userId &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.INSTRUCTOR
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền bỏ đánh dấu câu trả lời này là giải pháp',
      );
    }

    // Unmark as solution
    await this.forumReplyRepository.update(replyId, { isSolution: false });

    return this.findOneReply(replyId);
  }

  // ===== FORUM LIKE METHODS =====

  async likeForum(forumId: number, userId: number): Promise<Forum> {
    const forum = await this.findOne(forumId);

    // Check if already liked
    const existingLike = await this.forumLikeRepository.findOne({
      where: { forumId, userId },
    });

    if (existingLike) {
      throw new BadRequestException('Bạn đã thích diễn đàn này rồi');
    }

    // Create like
    const newLike = this.forumLikeRepository.create({
      forumId,
      userId,
    });

    await this.forumLikeRepository.save(newLike);
    return this.findOne(forumId, userId);
  }

  async unlikeForum(forumId: number, userId: number): Promise<Forum> {
    const forum = await this.findOne(forumId);

    // Check if liked
    const existingLike = await this.forumLikeRepository.findOne({
      where: { forumId, userId },
    });

    if (!existingLike) {
      throw new BadRequestException('Bạn chưa thích diễn đàn này');
    }

    // Remove like
    await this.forumLikeRepository.delete({
      forumId,
      userId,
    });

    return this.findOne(forumId, userId);
  }
}
