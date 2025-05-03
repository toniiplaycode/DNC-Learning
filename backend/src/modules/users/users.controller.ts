import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from 'src/entities/User';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateInstructorData } from './dto/create-instructor.dto';

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

  @Get('students')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async getAllRegularStudents() {
    return await this.usersService.findAllStudents();
  }

  @Get('students-academic')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async getAllAcademicStudents() {
    return await this.usersService.findAllStudentAcademics();
  }

  @Get(':id')
  findById(@Param('id') id: number): Promise<User | null> {
    return this.usersService.findById(id);
  }

  @Get('students/:id/academic-courses')
  async getStudentAcademicCourses(@Param('id') id: string) {
    return await this.usersService.findAcademicClassCoursesByStudentAcademicId(
      +id,
    );
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

  @Patch(':userId/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @Patch(':userId/instructor-profile')
  @Roles(UserRole.INSTRUCTOR)
  async updateInstructorProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Body()
    updateData: {
      user: UpdateUserDto;
      instructor: UpdateInstructorDto;
    },
  ) {
    console.log('updateData', updateData);
    return this.usersService.updateInstructorProfile(userId, updateData);
  }

  @Patch(':userId/student-profile')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.STUDENT)
  async updateStudentProfile(
    @Param('userId', ParseIntPipe) userId: number,
    @Body()
    updateData: {
      user: UpdateUserDto;
      student: UpdateStudentDto;
    },
  ) {
    return this.usersService.updateStudentProfile(userId, updateData);
  }

  @Post('instructor')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async createInstructor(@Body() data: CreateInstructorData) {
    return this.usersService.createInstructor(data);
  }

  @Delete('instructor/:userId')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async deleteInstructor(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    return this.usersService.deleteInstructor(userId);
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async deleteUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<void> {
    return this.usersService.deleteUser(userId);
  }

  @Get('instructor/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  async getUsersByInstructorId(@Param('id') instructorId: number) {
    return this.usersService.findByInstructorId(instructorId);
  }
}
