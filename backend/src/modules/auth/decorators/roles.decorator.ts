import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../../entities/User';

// Tạo decorator @Roles() nhận vào các UserRole
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// @Roles() là decorator để đánh dấu metadata
// RolesGuard là guard để đọc và kiểm tra metadata đó
//-> 2 này phải đi cùng nhau
