import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  // data: tham số truyền vào decorator, có thể undefined
  // ctx: context của request
  (data: string | undefined, ctx: ExecutionContext) => {
    // Lấy request object từ context
    const request = ctx.switchToHttp().getRequest();
    // Lấy user đã được gắn vào request bởi JWT strategy
    const user = request.user;

    if (!user) {
      return null;
    }

    // Nếu có data -> trả về trường cụ thể của user
    // Nếu không có data -> trả về toàn bộ user object
    return data ? user[data] : user;
  },
);
