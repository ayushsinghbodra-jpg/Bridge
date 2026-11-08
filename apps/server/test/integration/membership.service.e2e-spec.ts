import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { INestApplication, ForbiddenException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { createTestApp } from '../utils/test-app';
import { testDb, clearTestDb } from '../utils/test-db';
import { MemberService } from '../../src/server/member.service';
import { ServerService } from '../../src/server/server.service';

describe('Membership Service Integration', () => {
  let app: INestApplication;
  let memberService: MemberService;
  let serverService: ServerService;

  beforeAll(async () => {
    app = await createTestApp();
    memberService = app.get(MemberService);
    serverService = app.get(ServerService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  it('should add a member to a server with default role', async () => {
    const owner = await testDb.user.create({
      data: {
        username: 'server_owner',
        email: 'owner@example.com',
        password: await argon2.hash('Secret123!'),
      },
    });

    const server = await serverService.create(
      { name: 'Community Hub', visibility: 'private' },
      owner.id
    );

    const joiner = await testDb.user.create({
      data: {
        username: 'new_member',
        email: 'joiner@example.com',
        password: await argon2.hash('Secret123!'),
      },
    });

    const memberRes = await memberService.join(server.id, joiner.id);
    expect(memberRes.role).toBe('MEMBER');

    // Verify DB persisted state
    const memberInDb = await testDb.member.findUnique({
      where: { userId_serverId: { userId: joiner.id, serverId: server.id } },
    });
    expect(memberInDb).not.toBeNull();
    expect(memberInDb?.role).toBe('MEMBER');
  });

  it('should remove a member from a server', async () => {
    const owner = await testDb.user.create({
      data: {
        username: 'guild_master',
        email: 'master@example.com',
        password: await argon2.hash('Secret123!'),
      },
    });

    const server = await serverService.create(
      { name: 'Raid Guild', visibility: 'private' },
      owner.id
    );

    const memberUser = await testDb.user.create({
      data: {
        username: 'raider',
        email: 'raider@example.com',
        password: await argon2.hash('Secret123!'),
      },
    });

    await memberService.join(server.id, memberUser.id);

    // Leave server
    await memberService.leave(server.id, memberUser.id);

    // Verify member no longer exists in DB
    const memberInDb = await testDb.member.findUnique({
      where: { userId_serverId: { userId: memberUser.id, serverId: server.id } },
    });
    expect(memberInDb).toBeNull();
  });

  it('should prevent unauthorized role changes', async () => {
    const owner = await testDb.user.create({
      data: {
        username: 'owner_user',
        email: 'owner_role@example.com',
        password: await argon2.hash('Secret123!'),
      },
    });

    const server = await serverService.create(
      { name: 'Secret Society', visibility: 'private' },
      owner.id
    );

    const member1 = await testDb.user.create({
      data: {
        username: 'member_one',
        email: 'mem1@example.com',
        password: await argon2.hash('Secret123!'),
      },
    });

    const member2 = await testDb.user.create({
      data: {
        username: 'member_two',
        email: 'mem2@example.com',
        password: await argon2.hash('Secret123!'),
      },
    });

    await memberService.join(server.id, member1.id);
    await memberService.join(server.id, member2.id);

    // member1 (role MEMBER) tries to kick member2
    await expect(
      memberService.kick(server.id, member2.id, member1.id)
    ).rejects.toThrow(ForbiddenException);
  });
});
