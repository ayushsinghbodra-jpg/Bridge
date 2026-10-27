import {beforeAll, afterAll} from '@jest/globals';
import {createTestDb,dropTestDb} from './utils/test-db';
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://bridge:password@localhost:5432/bridge_test';
beforeAll(async ()=> {
    await createTestDb();    
});
afterAll(async ()=>{
    await dropTestDb();
});