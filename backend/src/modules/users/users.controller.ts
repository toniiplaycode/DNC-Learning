import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from 'src/entities/User';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('student-academic')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.INSTRUCTOR)
  createManyStudentAcademic(@Body() studentsData: any[]): Promise<any[]> {
    return this.usersService.createManyStudentAcademic(studentsData);
  }

  @Patch('student-academic')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.INSTRUCTOR)
  async updateStudentAcademic(@Body() updateData: any): Promise<any> {
    return this.usersService.updateStudentAcademic(updateData);
  }

  @Delete('student-academic/:userId')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.INSTRUCTOR)
  async deleteStudentAcademic(@Param('userId') userId: number): Promise<void> {
    return this.usersService.deleteStudentAcademic(userId);
  }

  @Get()
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: number): Promise<User | null> {
    return this.usersService.findById(id);
  }

  @Get('instructor/:instructorId/students')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.INSTRUCTOR)
  findStudentsByInstructorId(
    @Param('instructorId') instructorId: number,
  ): Promise<User[]> {
    return this.usersService.findStudentsByInstructorId(instructorId);
  }

  @Get('instructor/:instructorId/studentsAcademic')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.INSTRUCTOR)
  findStudentAcademicByInstructorId(
    @Param('instructorId') instructorId: number,
  ): Promise<User[]> {
    return this.usersService.findStudentAcademicByInstructorId(instructorId);
  }

  @Get('students/:id/academic-courses')
  async getStudentAcademicCourses(@Param('id') id: string) {
    return await this.usersService.findAcademicClassCoursesByStudentAcademicId(
      +id,
    );
  }
}
