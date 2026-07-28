import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AnalyticsService } from "../analytics/analytics.service";
import { MembershipService } from "../common/membership.service";

@Injectable()
export class ReactionService {
    constructor (
        private readonly prisma : PrismaService,
        private readonly analytics : AnalyticsService,
        private readonly membership : MembershipService,
    ){}
    async addReadtion (messageId: string, userId: string,emoji: string){
        const message = await this.prisma.message.findUnique({
            where : {id : messageId},
            select : {id : true, channelId : true}
        });
        if(!message) throw new NotFoundException("message not Found");
        await this.membership.assertMemberForChannel(message.channelId,userId);
        
        try {
            const reaction = await this.prisma.reaction.create({
                data : {messageId , userId , emoji},
            });
            this.analytics.track("raction_added",{
                userId,
                payload : {messageId,emoji},
            });
            return reaction;
        } catch (err) {
            throw new ConflictException("reaction already exists");
        }
    }
    async removeReaction(messageId : string , userId : string , emoji : string){
        const reaction = await this.prisma.reaction.findUnique({
            where : {messageId_userId_emoji : {messageId , userId , emoji}}
        });
        if(!reaction) throw new NotFoundException("reaction not found");
        await this.prisma.reaction.delete({
            where : { id : reaction.id}
        })
        return {messageId, userId , emoji};
    }

    async getReactionForMessage(messageId : string) {
        return this.prisma.reaction.findMany({
            where : {messageId},
            include : {
                user : { select : { id : true , username : true , displayName : true , avatarUrl : true}}
            },
        });
    }
}