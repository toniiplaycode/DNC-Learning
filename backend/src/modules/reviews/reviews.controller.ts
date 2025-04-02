import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/User';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createReviewDto: CreateReviewDto, @GetUser() user) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('course/:id')
  findByCourse(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findByCourse(id);
  }

  @Get('student/:id')
  @UseGuards(JwtAuthGuard)
  findByStudent(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    // Người dùng chỉ có thể xem đánh giá của chính họ trừ khi là admin
    const isAdmin = user.role === UserRole.ADMIN;
    const canAccess = isAdmin || (user.studentId && user.studentId === id);

    if (!canAccess) {
      throw new ForbiddenException('Bạn không có quyền xem đánh giá này');
    }

    return this.reviewsService.findByStudent(id);
  }

  @Get('course/:id/stats')
  getCourseStats(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getCourseStats(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @GetUser() user,
  ) {
    // Chỉ cho phép admin cập nhật trạng thái, người dùng chỉ có thể cập nhật nội dung
    if (updateReviewDto.status && user.role !== UserRole.ADMIN) {
      delete updateReviewDto.status;
    }

    return this.reviewsService.update(id, updateReviewDto);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.reject(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    const isAdmin = user.role === UserRole.ADMIN;
    return this.reviewsService.remove(id, isAdmin);
  }
}
