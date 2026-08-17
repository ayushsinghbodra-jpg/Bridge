import {Injectable , BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MENTION_REGEX, MAX_MENTIONS_PER_MESSAGE } from '../mentions/mention.constants';
import { MembershipService } from '../common/membership.service';
import { skip } from 'node:test';

@Injectable()
export class MentionServices {
    constructor (
        private readonly prisma : PrismaService,
        private readonly membership : MembershipService,
    ){}

    parseMentions(content : string) : string[] {
        const matches = content.matchAll(MENTION_REGEX.USER);
        const usernames = new Set<string>();

        for (const match of matches ) {
            usernames.add(match[1]);
            if(usernames.size > MAX_MENTIONS_PER_MESSAGE) {
                throw new BadRequestException(
                    `Cannot mention more than ${MAX_MENTIONS_PER_MESSAGE} users in the single message`
                );
            }
        }

        return Array.from(usernames);
    }

    async resolveMentionedUsers(usernames : string[], channelId: string ) : Promise<string[]> {
        if(usernames.length === 0) return [];

        const users = await this.prisma.user.findMany({
            where : {username : { in : usernames}},
            select : {id : true},
        });

        const memberIds : string[]= [];

        for(const user of users) {
            try {
                const isMember =await this.membership.assertMemberForChannel(channelId,user.id);
                memberIds.push(user.id);
            } catch {

            }
        }

        return memberIds;
     }

    async createMentions(messageId : string , userIds : string[]) {
        if (userIds.length === 0) return [];

        await this.prisma.mention.createMany({
            data : userIds.map((userId)=> ({
                messageId ,
                userId
            })),
            skipDuplicates : true,
        });
        return this.prisma.mention.findMany({
            where : {messageId},
            select : { id : true , userId: true ,messageId : true , createdAt : true},
        });
    }

    async processMentions(content : string ,channelId :string, messageId : string) {
        const usernames = this.parseMentions(content);
        const userIds = await this.resolveMentionedUsers(usernames,channelId);
        return this.createMentions(messageId,userIds);
    }

    async getMentionsForUser(userId : string , take : 20 , cursor?: string) {
        return this.prisma.mention.findMany({
            where : {userId},
            take,
            ...(cursor && {skip : 1,cursor : {id : cursor}}),
            orderBy : {createdAt : 'desc'},
            include : {
                message: {
                    select : {
                        id : true, content : true ,channelId : true ,createdAt : true
                    },
                },
            },
        });
    }
}
