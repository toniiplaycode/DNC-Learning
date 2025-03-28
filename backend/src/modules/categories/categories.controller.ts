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
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UserRole } from '../../entities/User';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.categoriesService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto, @Request() req) {
    // Chỉ admin mới có quyền tạo category
    if (req.user && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền tạo danh mục');
    }
    return this.categoriesService.create(createCategoryDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req,
  ) {
    // Chỉ admin mới có quyền cập nhật category
    if (req.user && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền cập nhật danh mục');
    }
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    // Chỉ admin mới có quyền xóa category
    if (req.user && req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền xóa danh mục');
    }
    return this.categoriesService.remove(+id);
  }
}
