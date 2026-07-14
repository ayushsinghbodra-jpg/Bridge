import { Injectable, ForbiddenException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MembershipService {
  constructor(private readonly prisma: PrismaService) {}

  async assertMember(serverId: string, userId: string): Promise<void> {
    const member = await this.prisma.member.findUnique({
      where: { userId_serverId: { userId, serverId } },
    });
    if (!member) {
      throw new ForbiddenException("You must be a member to access this resource");
    }
  }

  async assertMemberForChannel(channelId: string, userId: string): Promise<string> {
    const channel = await this.prisma.channel.findUnique({
      where: { id: channelId },
      select: { serverId: true },
    });
    if (!channel) throw new NotFoundException("Channel not found");

    await this.assertMember(channel.serverId, userId);
    return channel.serverId;
  }
}
