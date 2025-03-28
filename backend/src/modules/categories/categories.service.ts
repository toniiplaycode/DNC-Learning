import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/Category';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(status?: string): Promise<Category[]> {
    const options: any = {};

    if (status && (status === 'active' || status === 'inactive')) {
      options.where = { status };
    }

    // Đếm số lượng khóa học trong mỗi danh mục
    const categories = await this.categoryRepository.find({
      ...options,
      order: { id: 'ASC' },
    });

    // Tính toán số lượng khóa học cho mỗi danh mục
    const courseCounts = await this.categoryRepository.query(`
      SELECT 
        c.category_id,
        COUNT(c.id) as course_count
      FROM categories cat
      LEFT JOIN courses c ON c.category_id = cat.id
      GROUP BY c.category_id
    `);

    // Map số lượng khóa học vào từng danh mục
    return categories.map((category) => {
      const countObj = courseCounts.find(
        (item) => item.category_id === category.id,
      );
      return {
        ...category,
        courseCount: countObj ? parseInt(countObj.course_count) : 0,
      };
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID ${id}`);
    }

    // Đếm số lượng khóa học trong danh mục
    const courseCounts = await this.categoryRepository.query(`
      SELECT COUNT(id) as course_count
      FROM courses
      WHERE category_id = ${id}
    `);

    return {
      ...category,
      courseCount: parseInt(courseCounts[0]?.course_count || '0'),
    };
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const newCategory = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(newCategory);
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    // Cập nhật thông tin
    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    // Kiểm tra xem có khóa học nào thuộc danh mục này không
    if (category.courseCount && category.courseCount > 0) {
      throw new Error(
        `Không thể xóa danh mục này vì có ${category.courseCount} khóa học đang sử dụng`,
      );
    }

    await this.categoryRepository.remove(category);
  }
}
