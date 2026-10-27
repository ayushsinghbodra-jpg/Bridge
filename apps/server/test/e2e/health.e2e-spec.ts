import {describe, it, expect,beforeAll,afterAll} from '@jest/globals';
import {INestApplication} from '@nestjs/common';
import {createTestApp} from './../utils/test-app';
import request from 'supertest';
describe ('Health E2E', () => {
    let app : INestApplication;
    beforeAll(async () => {
        app = await createTestApp();
    });
    afterAll(async () => {
        app.close();
    })
    it('should return 200 OK', async () => {
        const response = await request(app.getHttpServer())
            .get('/api/health')
            .expect(200);
        console.log(response.body);
        expect(response.body.status).toBe('healthy');
    })
})