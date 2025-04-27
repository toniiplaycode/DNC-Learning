import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ForumsService } from './forums.service';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { CreateForumReplyDto } from './dto/create-forum-reply.dto';
import { UpdateForumReplyDto } from './dto/update-forum-reply.dto';
import { Forum, ForumStatus } from '../../entities/Forum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('forums')
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('courseId') courseId?: number,
    @Query('status') status?: ForumStatus,
    @GetUser() user?,
  ) {
    const userId = user?.id;
    return this.forumsService.findAll(courseId, status, userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @GetUser() user?) {
    const userId = user?.id;
    return this.forumsService.findOne(+id, userId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getForumsByUser(@Param('userId') userId: number): Promise<Forum[]> {
    return this.forumsService.findForumsByUserId(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createForumDto: CreateForumDto, @GetUser() user) {
    return this.forumsService.create(createForumDto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateForumDto: UpdateForumDto,
    @GetUser() user,
  ) {
    return this.forumsService.update(+id, updateForumDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @GetUser() user) {
    return this.forumsService.remove(+id, user);
  }

  // Forum Reply Endpoints
  @Get(':id/replies')
  @UseGuards(JwtAuthGuard)
  findReplies(@Param('id') id: string, @GetUser() user?) {
    const userId = user?.id;
    return this.forumsService.findRepliesByForumId(+id, userId);
  }

  @Post('replies')
  @UseGuards(JwtAuthGuard)
  createReply(@Body() createReplyDto: CreateForumReplyDto, @GetUser() user) {
    return this.forumsService.createReply(createReplyDto, user.id);
  }

  @Patch('replies/:id')
  @UseGuards(JwtAuthGuard)
  updateReply(
    @Param('id') id: string,
    @Body() updateReplyDto: UpdateForumReplyDto,
    @GetUser() user,
  ) {
    return this.forumsService.updateReply(+id, updateReplyDto, user);
  }

  @Delete('replies/:id')
  @UseGuards(JwtAuthGuard)
  removeReply(@Param('id') id: string, @GetUser() user) {
    return this.forumsService.removeReply(+id, user);
  }

  // Solution endpoints
  @Patch(':forumId/replies/:replyId/solution')
  @UseGuards(JwtAuthGuard)
  markAsSolution(
    @Param('forumId') forumId: string,
    @Param('replyId') replyId: string,
    @GetUser() user,
  ) {
    return this.forumsService.markAsSolution(+replyId, +forumId, user);
  }

  @Delete(':forumId/replies/:replyId/solution')
  @UseGuards(JwtAuthGuard)
  unmarkAsSolution(
    @Param('forumId') forumId: string,
    @Param('replyId') replyId: string,
    @GetUser() user,
  ) {
    return this.forumsService.unmarkAsSolution(+replyId, +forumId, user);
  }

  // Like endpoints
  @Get(':id/like')
  getUserLikeForum(@Param('id') id: string) {
    return this.forumsService.getUserLikeForum(+id);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  toggleLikeForum(@Param('id') id: string, @GetUser() user) {
    return this.forumsService.toggleLikeForum(+id, user.id);
  }
}
