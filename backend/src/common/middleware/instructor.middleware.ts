import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../../entities/User';
import { CoursesService } from '../../modules/courses/courses.service';

interface RequestWithUser extends Request {
  user: User;
}

@Injectable()
export class InstructorMiddleware implements NestMiddleware {
  constructor(private readonly coursesService: CoursesService) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('Không tìm thấy thông tin người dùng');
    }

    // Admin có tất cả quyền
    if (user.role === UserRole.ADMIN) {
      return next();
    }

    // Kiểm tra role instructor
    if (user.role !== UserRole.INSTRUCTOR) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện hành động này',
      );
    }

    // Với PATCH và DELETE, kiểm tra quyền sở hữu khóa học
    if (req.method !== 'POST') {
      const courseId = parseInt(req.params.id);
      const course = await this.coursesService.findOne(courseId);

      if (!course) {
        throw new ForbiddenException('Không tìm thấy khóa học');
      }

      if (course.instructorId !== user.id) {
        throw new ForbiddenException('Bạn không có quyền quản lý khóa học này');
      }
    }

    next();
  }
}
