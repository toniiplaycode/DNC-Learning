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
import { AssignmentSubmissionsService } from './assignment-submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/User';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('assignment-submissions')
export class AssignmentSubmissionsController {
  constructor(
    private readonly submissionsService: AssignmentSubmissionsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createSubmissionDto: CreateSubmissionDto, @GetUser() user) {
    return this.submissionsService.create(createSubmissionDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findAll() {
    return this.submissionsService.findAll();
  }

  @Get('assignment/:id')
  @UseGuards(JwtAuthGuard)
  findByAssignment(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.submissionsService.findByAssignment(id, user.id);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  findByUser(@GetUser() user) {
    return this.submissionsService.findByUser(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.submissionsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @GetUser() user,
  ) {
    return this.submissionsService.update(id, updateSubmissionDto, user.id);
  }

  @Patch(':id/grade')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  grade(
    @Param('id', ParseIntPipe) id: number,
    @Body() gradeSubmissionDto: GradeSubmissionDto,
    @GetUser() user,
  ) {
    const instructorId = user.instructorId || user.id;
    return this.submissionsService.grade(id, gradeSubmissionDto, instructorId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    const isAdmin = user.role === UserRole.ADMIN;
    return this.submissionsService.remove(id, user.id, isAdmin);
  }
}
