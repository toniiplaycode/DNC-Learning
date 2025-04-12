import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from 'src/entities/User';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
