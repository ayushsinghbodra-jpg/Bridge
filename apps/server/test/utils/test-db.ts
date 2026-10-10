import {PrismaClient} from '@prisma/client';
const testDb = new PrismaClient();
async function createTestDb() {
    await testDb.$connect();
};
async function dropTestDb() {
    await testDb.$disconnect();
}
