import { PrismaClient } from '@prisma/client';

const testDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://bridge:password@localhost:5432/bridge_test',
    },
  },
});

async function createTestDb() {
  await testDb.$connect();
}

async function dropTestDb() {
  await testDb.$disconnect();
}

async function clearTestDb() {
  const tables = [
    'audit_logs',
    'custom_emojis',
    'pinned_messages',
    'Mention',
    'Reaction',
    'DirectMessage',
    'ConversationParticipant',
    'Conversation',
    'Friendship',
    'messages',
    'invites',
    'members',
    'channels',
    'servers',
    'sessions',
    'password_reset_tokens',
    'users',
    'analytics_events',
  ];
  for (const table of tables) {
    try {
      await testDb.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    } catch {
      // Continue
    }
  }
}

export { testDb, createTestDb, dropTestDb, clearTestDb };
