import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CourseLessonDiscussionsService } from './course-lesson-discussions.service';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { UpdateDiscussionDto } from './dto/update-discussion.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { UserRole } from '../../entities/User';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('course-lesson-discussions')
export class CourseLessonDiscussionsController {
  constructor(
    private readonly discussionsService: CourseLessonDiscussionsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDiscussionDto: CreateDiscussionDto, @GetUser() user) {
    return this.discussionsService.create(createDiscussionDto, user.id);
  }

  @Get()
  findAll(@Query('lessonId') lessonId?: string) {
    return this.discussionsService.findAll(
      lessonId ? parseInt(lessonId, 10) : undefined,
    );
  }

  @Get('lesson/:lessonId')
  findByLesson(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.discussionsService.findByLesson(lessonId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.discussionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDiscussionDto: UpdateDiscussionDto,
    @GetUser() user,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    return this.discussionsService.update(
      id,
      updateDiscussionDto,
      user.id,
      isAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    const isAdmin = user.role === UserRole.ADMIN;
    return this.discussionsService.remove(id, user.id, isAdmin);
  }

  @Patch(':id/hide')
  @UseGuards(JwtAuthGuard)
  hideDiscussion(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    const isAdminInstructor =
      user.role === UserRole.ADMIN || user.role === UserRole.INSTRUCTOR;
    return this.discussionsService.hideDiscussion(
      id,
      user.id,
      isAdminInstructor,
    );
  }
}
