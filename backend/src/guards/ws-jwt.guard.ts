import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();
      const authToken = client.handshake.auth?.authorization?.split(' ')[1];

      if (!authToken) {
        throw new WsException('Missing auth token');
      }

      const payload = await this.jwtService.verifyAsync(authToken);
      client.handshake.auth.userId = payload.sub;
      return true;
    } catch (err) {
      throw new WsException('Invalid token');
    }
  }
}
