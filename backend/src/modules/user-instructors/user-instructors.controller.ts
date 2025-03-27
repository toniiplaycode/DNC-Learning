import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserInstructorsService } from './user-instructors.service';
import { CreateUserInstructorDto } from './dto/create-user-instructor.dto';
import { UpdateUserInstructorDto } from './dto/update-user-instructor.dto';
import { UserRole } from '../../entities/User';

@Controller('user-instructors')
export class UserInstructorsController {
  constructor(
    private readonly userInstructorsService: UserInstructorsService,
  ) {}

  @Get()
  findAll() {
    return this.userInstructorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userInstructorsService.findOne(+id);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.userInstructorsService.findByUserId(+userId);
  }

  @Post()
  create(@Body() createUserInstructorDto: CreateUserInstructorDto) {
    return this.userInstructorsService.create(createUserInstructorDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserInstructorDto: UpdateUserInstructorDto,
    @Request() req,
  ) {
    // Kiểm tra quyền - chỉ user sở hữu hoặc admin mới được cập nhật
    const instructor = this.userInstructorsService.findOne(+id);
    if (
      req.user.role !== UserRole.ADMIN &&
      req.user.id !== instructor['userId']
    ) {
      throw new ForbiddenException('Bạn không có quyền cập nhật thông tin này');
    }

    return this.userInstructorsService.update(+id, updateUserInstructorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // Chỉ admin mới có quyền xóa
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền xóa giảng viên');
    }

    return this.userInstructorsService.remove(+id);
  }

  @Patch(':id/verify')
  verifyInstructor(@Param('id') id: string, @Request() req) {
    // Chỉ admin mới có quyền xác minh
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền xác minh giảng viên');
    }

    return this.userInstructorsService.verifyInstructor(+id);
  }

  @Patch(':id/reject')
  rejectInstructor(@Param('id') id: string, @Request() req) {
    // Chỉ admin mới có quyền từ chối
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền từ chối giảng viên');
    }

    return this.userInstructorsService.rejectInstructor(+id);
  }
}
