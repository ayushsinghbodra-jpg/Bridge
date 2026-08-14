import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Server, Socket } from "socket.io";
import { DmService } from "./dm.service";
import { PrismaService } from "../../prisma/prisma.service";
import { sendDmSchema, editDmSchema } from "@bridge/types";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? "http://localhost:3001",
    credentials: true,
  },
  namespace: "/dm",
})
export class DmGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(DmGateway.name);
  private socketToUser = new Map<string, string>();
  private userToSocket = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly dmService: DmService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        (client.handshake.auth as Record<string, string> | undefined)?.token ||
        client.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true },
      });
      if (!user) {
        client.disconnect();
        return;
      }

      this.socketToUser.set(client.id, user.id);
      this.userToSocket.set(user.id, client.id);
      this.logger.log(`DM socket connected: ${user.id}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);
    if (userId) {
      this.userToSocket.delete(userId);
      this.socketToUser.delete(client.id);
    }
  }

  private getUserId(client: Socket): string | null {
    return this.socketToUser.get(client.id) ?? null;
  }

  @SubscribeMessage("conversation:join")
  async handleConversationJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.getUserId(client);
    if (!userId) return;

    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: data.conversationId, userId } },
    });
    if (!participant) return;

    await client.join(`conversation:${data.conversationId}`);
  }

  @SubscribeMessage("conversation:leave")
  async handleConversationLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    await client.leave(`conversation:${data.conversationId}`);
  }

  @SubscribeMessage("dm:send")
  async handleSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string; replyToId?: string },
  ) {
    const userId = this.getUserId(client);
    if (!userId) return;

    const parsed = sendDmSchema.safeParse(data);
    if (!parsed.success) {
      client.emit("error", { message: "Validation failed", errors: parsed.error.issues });
      return;
    }

    try {
      const message = await this.dmService.sendMessage(
        data.conversationId,
        userId,
        parsed.data.content,
        parsed.data.replyToId,
      );
      this.server.to(`conversation:${data.conversationId}`).emit("dm:new", message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send message";
      client.emit("error", { message: msg });
    }
  }

  @SubscribeMessage("dm:edit")
  async handleEdit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; messageId: string; content: string },
  ) {
    const userId = this.getUserId(client);
    if (!userId) return;

    const parsed = editDmSchema.safeParse(data);
    if (!parsed.success) {
      client.emit("error", { message: "Validation failed", errors: parsed.error.issues });
      return;
    }

    try {
      const message = await this.dmService.editMessage(
        data.conversationId,
        data.messageId,
        userId,
        parsed.data.content,
      );
      this.server.to(`conversation:${data.conversationId}`).emit("dm:update", message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to edit message";
      client.emit("error", { message: msg });
    }
  }

  @SubscribeMessage("dm:delete")
  async handleDelete(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; messageId: string },
  ) {
    const userId = this.getUserId(client);
    if (!userId) return;

    try {
      await this.dmService.deleteMessage(data.conversationId, data.messageId, userId);
      this.server.to(`conversation:${data.conversationId}`).emit("dm:delete", {
        conversationId: data.conversationId,
        messageId: data.messageId,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete message";
      client.emit("error", { message: msg });
    }
  }

  @SubscribeMessage("dm:typing:start")
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.getUserId(client);
    if (!userId) return;
    client.to(`conversation:${data.conversationId}`).emit("dm:typing:start", {
      conversationId: data.conversationId,
      userId,
    });
  }

  @SubscribeMessage("dm:typing:stop")
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.getUserId(client);
    if (!userId) return;
    client.to(`conversation:${data.conversationId}`).emit("dm:typing:stop", {
      conversationId: data.conversationId,
      userId,
    });
  }

  @SubscribeMessage("dm:read")
  async handleRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.getUserId(client);
    if (!userId) return;

    try {
      const read = await this.dmService.markRead(data.conversationId, userId);
      this.server.to(`conversation:${data.conversationId}`).emit("dm:read", read);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to mark as read";
      client.emit("error", { message: msg });
    }
  }
}
