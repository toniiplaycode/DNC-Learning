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
  ParseIntPipe,
} from '@nestjs/common';
import { UserGradesService } from './user-grades.service';
import { CreateUserGradeDto } from './dto/create-user-grade.dto';
import { UpdateUserGradeDto } from './dto/update-user-grade.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/User';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { GradeType } from '../../entities/UserGrade';

@Controller('user-grades')
export class UserGradesController {
  constructor(private readonly userGradesService: UserGradesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  create(@Body() createUserGradeDto: CreateUserGradeDto, @GetUser() user) {
    return this.userGradesService.create(createUserGradeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findAll(
    @Query('userId') userId?: string,
    @Query('courseId') courseId?: string,
    @Query('gradeType') gradeType?: GradeType,
    @GetUser() user?,
  ) {
    const filters: any = {};

    if (userId) filters.userId = parseInt(userId, 10);
    if (courseId) filters.courseId = parseInt(courseId, 10);
    if (gradeType) filters.gradeType = gradeType;

    // Nếu là INSTRUCTOR và không phải admin, chỉ xem được điểm do mình chấm
    if (user?.role === UserRole.INSTRUCTOR && user?.instructorId) {
      filters.gradedBy = user.instructorId;
    }

    return this.userGradesService.findAll(filters);
  }

  @Get('course/:courseId')
  @UseGuards(JwtAuthGuard)
  findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('userId') userId?: string,
    @GetUser() user?,
  ) {
    // Nếu là học viên, chỉ xem được điểm của mình
    if (user?.role === UserRole.STUDENT) {
      return this.userGradesService.findByCourse(courseId, user.id);
    }

    // Ngược lại có thể xem điểm của người khác
    return this.userGradesService.findByCourse(
      courseId,
      userId ? parseInt(userId, 10) : undefined,
    );
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByUser(@Param('userId', ParseIntPipe) userId: number, @GetUser() user) {
    // Nếu là học viên, chỉ xem được điểm của mình
    if (user?.role === UserRole.STUDENT && user?.id !== userId) {
      userId = user.id;
    }

    return this.userGradesService.findByUser(userId);
  }

  @Get('calculate/:userId/:courseId')
  @UseGuards(JwtAuthGuard)
  calculateCourseGrade(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @GetUser() user,
  ) {
    // Nếu là học viên, chỉ xem được điểm của mình
    if (user?.role === UserRole.STUDENT && user?.id !== userId) {
      userId = user.id;
    }

    return this.userGradesService.calculateCourseGrade(userId, courseId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.userGradesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserGradeDto: UpdateUserGradeDto,
    @GetUser() user,
  ) {
    // Nếu là giảng viên, truyền instructorId để kiểm tra quyền sửa điểm
    const instructorId =
      user.role === UserRole.INSTRUCTOR ? user.instructorId : undefined;
    return this.userGradesService.update(id, updateUserGradeDto, instructorId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    // Nếu là giảng viên, truyền instructorId để kiểm tra quyền xóa điểm
    const instructorId =
      user.role === UserRole.INSTRUCTOR ? user.instructorId : undefined;
    return this.userGradesService.remove(id, instructorId);
  }
}
