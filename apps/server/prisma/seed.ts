console.error('SEED SCRIPT STARTED');

import { PrismaClient, Role, Visibility, ChannelType } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const password = await argon2.hash('Password123');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@bridge.dev' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@bridge.dev',
      password,
      displayName: 'Admin',
    },
  });

  const ayush = await prisma.user.upsert({
    where: { email: 'ayush@bridge.dev' },
    update: {},
    create: {
      username: 'ayush',
      email: 'ayush@bridge.dev',
      password,
      displayName: 'Ayush',
    },
  });

  const friend = await prisma.user.upsert({
    where: { email: 'friend@bridge.dev' },
    update: {},
    create: {
      username: 'friend01',
      email: 'friend@bridge.dev',
      password,
      displayName: 'Friend',
    },
  });

  console.log(`Users: ${admin.username}, ${ayush.username}, ${friend.username}`);

  const existingServer = await prisma.server.findUnique({ where: { slug: 'bridge-hq' } });

  if (!existingServer) {
    const server = await prisma.server.create({
      data: {
        name: 'Bridge HQ',
        slug: 'bridge-hq',
        description: 'The main test server for Bridge.',
        visibility: Visibility.PUBLIC,
        ownerId: admin.id,
        members: {
          createMany: {
            data: [
              { userId: admin.id, role: Role.OWNER },
              { userId: ayush.id, role: Role.MEMBER },
              { userId: friend.id, role: Role.MEMBER },
            ],
          },
        },
        invites: {
          create: {
            code: 'BRIDGE01',
            creatorId: admin.id,
            maxUses: 50,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    const [general, offTopic] = await Promise.all([
      prisma.channel.create({
        data: { serverId: server.id, name: 'general', type: ChannelType.TEXT, position: 0 },
      }),
      prisma.channel.create({
        data: { serverId: server.id, name: 'off-topic', type: ChannelType.TEXT, position: 1 },
      }),
    ]);

    await prisma.message.createMany({
      data: [
        {
          channelId: general.id,
          authorId: admin.id,
          content: 'Welcome to Bridge HQ!',
          createdAt: new Date(Date.now() - 3600000 * 3),
        },
        {
          channelId: general.id,
          authorId: ayush.id,
          content: 'Hey, testing this out!',
          createdAt: new Date(Date.now() - 3600000 * 2),
        },
        {
          channelId: general.id,
          authorId: friend.id,
          content: 'Looking good so far.',
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          channelId: offTopic.id,
          authorId: ayush.id,
          content: 'Random chat happens here.',
          createdAt: new Date(Date.now() - 1800000),
        },
      ],
    });

    console.log(`Server: ${server.name} (invite code: BRIDGE01)`);
  }

  console.log('\nTest accounts (password: Password123):');
  console.log('  admin@bridge.dev / ayush@bridge.dev / friend@bridge.dev');
  console.log('\nSeed complete!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });