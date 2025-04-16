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
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../entities/User';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }

  @Get()
  findAll(@Query('sectionId') sectionId?: string) {
    return this.documentsService.findAll(
      sectionId ? parseInt(sectionId, 10) : undefined,
    );
  }

  @Get('section/:sectionId')
  findBySection(@Param('sectionId', ParseIntPipe) sectionId: number) {
    return this.documentsService.findBySection(sectionId);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.documentsService.findByCourse(courseId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @GetUser() user,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    const isInstructor = user.role === UserRole.INSTRUCTOR;

    let isDocumentOwner = false;
    if (isInstructor) {
      isDocumentOwner = await this.documentsService.isInstructorOfCourse(
        user.id,
        (await this.documentsService.findOne(id)).courseSectionId,
      );
    }

    return this.documentsService.update(
      id,
      updateDocumentDto,
      user.id,
      isAdmin,
      isInstructor && isDocumentOwner,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number) {
    return await this.documentsService.remove(id);
  }
}
