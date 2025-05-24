import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: true,
  namespace: '/quiz-progress',
})
export class QuizProgressGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QuizProgressGateway.name);

  async emitProgress(data: {
    totalQuestions: number;
    currentQuestions: number;
    status: 'processing' | 'completed' | 'error';
    message?: string;
  }) {
    this.logger.debug(`Emitting progress: ${JSON.stringify(data)}`);
    this.server.emit('quizProgress', data);
  }
}
