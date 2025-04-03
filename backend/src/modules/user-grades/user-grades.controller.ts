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
  ForbiddenException,
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
  create(@Body() createUserGradeDto: CreateUserGradeDto) {
    return this.userGradesService.create(createUserGradeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('userId') userId?: string,
    @Query('courseId') courseId?: string,
    @Query('gradeType') gradeType?: GradeType,
    @GetUser() user?,
  ) {
    // Nếu là học viên, chỉ xem được điểm của mình
    if (user?.role === UserRole.STUDENT) {
      userId = String(user.id);
    }

    return this.userGradesService.findAll(
      userId ? parseInt(userId, 10) : undefined,
      courseId ? parseInt(courseId, 10) : undefined,
      gradeType,
    );
  }

  @Get('student/performance')
  @UseGuards(JwtAuthGuard)
  async getStudentPerformance(
    @Query('userId') userId?: string,
    @GetUser() user?,
  ) {
    // Nếu là học viên, chỉ xem được số liệu thống kê của mình
    if (user?.role === UserRole.STUDENT) {
      userId = String(user.id);
    }

    if (!userId) {
      throw new ForbiddenException('Vui lòng chỉ định ID học viên');
    }

    return this.userGradesService.getStudentPerformanceStats(
      parseInt(userId, 10),
    );
  }

  @Get('user/:userId/course/:courseId')
  @UseGuards(JwtAuthGuard)
  findByUserAndCourse(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @GetUser() user,
  ) {
    // Nếu là học viên, chỉ xem được điểm của mình

    if (
      user?.role === UserRole.STUDENT &&
      Number(user?.id) !== Number(userId)
    ) {
      throw new ForbiddenException(
        'Bạn không có quyền xem điểm của người khác',
      );
    }

    return this.userGradesService.findByUserAndCourse(userId, courseId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.userGradesService.findByUser(userId);
  }

  @Get('user/:userId/course/:courseId/summary')
  @UseGuards(JwtAuthGuard)
  async calculateCourseGrade(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @GetUser() user,
  ) {
    // Nếu là học viên, chỉ xem được điểm của mình
    if (
      user?.role === UserRole.STUDENT &&
      Number(user?.id) !== Number(userId)
    ) {
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
