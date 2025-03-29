import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ForumsService } from './forums.service';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { CreateForumReplyDto } from './dto/create-forum-reply.dto';
import { UpdateForumReplyDto } from './dto/update-forum-reply.dto';
import { ForumStatus } from '../../entities/Forum';

@Controller('forums')
export class ForumsController {
  constructor(private readonly forumsService: ForumsService) {}

  @Get()
  findAll(
    @Query('courseId') courseId?: number,
    @Query('status') status?: ForumStatus,
    @Request() req?,
  ) {
    const userId = req.user?.id;
    return this.forumsService.findAll(courseId, status, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req?) {
    const userId = req.user?.id;
    return this.forumsService.findOne(+id, userId);
  }

  @Post()
  create(@Body() createForumDto: CreateForumDto, @Request() req) {
    return this.forumsService.create(createForumDto, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateForumDto: UpdateForumDto,
    @Request() req,
  ) {
    return this.forumsService.update(+id, updateForumDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.forumsService.remove(+id, req.user);
  }

  // Forum Reply Endpoints
  @Get(':id/replies')
  findReplies(@Param('id') id: string, @Request() req?) {
    const userId = req.user?.id;
    return this.forumsService.findRepliesByForumId(+id, userId);
  }

  @Post('replies')
  createReply(@Body() createReplyDto: CreateForumReplyDto, @Request() req) {
    return this.forumsService.createReply(createReplyDto, req.user.id);
  }

  @Patch('replies/:id')
  updateReply(
    @Param('id') id: string,
    @Body() updateReplyDto: UpdateForumReplyDto,
    @Request() req,
  ) {
    return this.forumsService.updateReply(+id, updateReplyDto, req.user);
  }

  @Delete('replies/:id')
  removeReply(@Param('id') id: string, @Request() req) {
    return this.forumsService.removeReply(+id, req.user);
  }

  // Solution endpoints
  @Patch(':forumId/replies/:replyId/solution')
  markAsSolution(
    @Param('forumId') forumId: string,
    @Param('replyId') replyId: string,
    @Request() req,
  ) {
    return this.forumsService.markAsSolution(+replyId, +forumId, req.user);
  }

  @Delete(':forumId/replies/:replyId/solution')
  unmarkAsSolution(
    @Param('forumId') forumId: string,
    @Param('replyId') replyId: string,
    @Request() req,
  ) {
    return this.forumsService.unmarkAsSolution(+replyId, +forumId, req.user);
  }

  // Like endpoints
  @Post(':id/like')
  likeForum(@Param('id') id: string, @Request() req) {
    return this.forumsService.likeForum(+id, req.user.id);
  }

  @Delete(':id/like')
  unlikeForum(@Param('id') id: string, @Request() req) {
    return this.forumsService.unlikeForum(+id, req.user.id);
  }
}
