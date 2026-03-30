import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { parseCorsOrigins } from '../config/cors-origins';

@WebSocketGateway({
  namespace: '/realtime',
  cors: {
    origin: parseCorsOrigins(),
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.debug(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Cliente desconectado: ${client.id}`);
  }

  /** Cliente solicita entrada em uma sala (ex.: "mesa:demo", "admin"). */
  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() payload: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room } = payload ?? {};
    if (!room) return { event: 'error', data: 'room é obrigatório' };
    client.join(room);
    this.logger.debug(`${client.id} entrou na sala: ${room}`);
    return { event: 'joined', data: { room } };
  }

  /** Cliente solicita saída de uma sala. */
  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @MessageBody() payload: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { room } = payload ?? {};
    if (room) client.leave(room);
    return { event: 'left', data: { room } };
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: unknown, @ConnectedSocket() client: Socket) {
    return {
      event: 'pong',
      data: { at: Date.now(), echo: data, clientId: client.id },
    };
  }

  /** Emite um evento para todos os clientes de uma sala. */
  emitToRoom(room: string, event: string, data: unknown) {
    this.server.to(room).emit(event, data);
  }

  /** Emite um evento para todos os clientes conectados. */
  broadcast(event: string, data: unknown) {
    this.server.emit(event, data);
  }
}
