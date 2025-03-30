import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../entities/User';

@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector dùng để lấy metadata từ decorators
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Lấy roles từ decorator @Roles() ở cả method và class level
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles', // key để lấy metadata
      [
        context.getHandler(), // lấy từ method decorator
        context.getClass(), // lấy từ class decorator
      ],
    );

    // Nếu không có role nào được yêu cầu -> cho phép truy cập
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Lấy thông tin user từ request (đã được JWT strategy gắn vào)
    const { user } = context.switchToHttp().getRequest();

    // Nếu không có user -> từ chối truy cập
    if (!user) {
      return false;
    }

    // Kiểm tra xem user có role phù hợp không
    // Chỉ cần match 1 role là được phép truy cập
    return requiredRoles.some((role) => user.role === role);
  }
}

// @Roles() là decorator để đánh dấu metadata
// RolesGuard là guard để đọc và kiểm tra metadata đó
//-> 2 này phải đi cùng nhau
