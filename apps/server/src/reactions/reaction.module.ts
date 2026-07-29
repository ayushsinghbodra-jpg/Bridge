import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { ReactionResponse, GroupedReactionResponse } from "@bridge/types";
import { PrismaService } from "../prisma/prisma.service";
import { AnalyticsService } from "../analytics/analytics.service";
import { MembershipService } from "../common/membership.service";

const MAX_DISTINCT_REACTION_PER_MESSAGE = 20;

const REACTOIN_USER_SELECT = {
    id : true,
    username : true,
    displaynale : true,
    avatarUrl : true,
}as const ;

@Injectable()
export class ReactService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly analytics: AnalyticsService,
        private readonly membership: MembershipService,
    ) {}

    async addReaction(messageId : string , userId : string , emoji : string) : Promise<void> {
        const message = await this.prisma.message.findUnique({
            where : { id : messageId},
            select : {id : true, channelId : true},
        });

        if(!message) throw new NotFoundException("Message not found");

        await this.membership.assertMemberForChannel(message.channelId, userId);
        

    }
}