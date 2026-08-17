import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';
import { MentionServices } from './mention.service';

@Module({
    imports : [PrismaModule,CommonModule],
    providers : [MentionServices],
    exports : [MentionServices],
})

export class MentionModule {}