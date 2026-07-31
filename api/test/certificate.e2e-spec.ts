import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

// Integration e2e test — exercises the real Fabric network (infra/fabric)
// and a real IPFS daemon, not mocks. Requires both to be running locally
// (see README "Setup and Installation") and api/.env configured with the
// ISSUER_USERNAME/ISSUER_PASSWORD_HASH this test logs in with.
describe('CertificateController (e2e)', () => {
  let app: INestApplication<App>;
  let server: App;
  const studentAddress = `0xE2EAddr${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects issue without a token', async () => {
    await request(server).post('/certificate/issue').send({}).expect(401);
  });

  it('reports an unissued certificate as invalid', async () => {
    const res = await request(server).get(`/certificate/verify/${studentAddress}`).expect(200);
    expect(res.body).toEqual({ isValid: false });
  });

  it('logs in and runs the full issue -> view -> verify -> update -> revoke -> verify lifecycle', async () => {
    const login = await request(server)
      .post('/auth/login')
      .send({ username: 'admin', password: 'changeme' })
      .expect(200);
    const token = login.body.accessToken as string;
    expect(token).toBeTruthy();
    const auth = `Bearer ${token}`;

    const issue = await request(server)
      .post('/certificate/issue')
      .set('Authorization', auth)
      .send({
        studentName: 'E2E Student',
        roll: 'E2E-1',
        degreeName: 'BSc',
        subject: 'CS',
        expiry: 1999999999,
        studentAddress,
      })
      .expect(201);
    expect(issue.body.cid).toBeTruthy();

    const view = await request(server).get(`/certificate/view/${studentAddress}`).expect(200);
    expect(view.body).toMatchObject({ studentName: 'E2E Student', roll: 'E2E-1' });

    const verify = await request(server).get(`/certificate/verify/${studentAddress}`).expect(200);
    expect(verify.body).toEqual({ isValid: true });

    await request(server)
      .patch(`/certificate/update/${studentAddress}`)
      .set('Authorization', auth)
      .send({ studentName: 'E2E Student Updated', roll: 'E2E-1', degreeName: 'BSc Hons', subject: 'CS', expiry: 1999999999 })
      .expect(200);

    const viewAfterUpdate = await request(server).get(`/certificate/view/${studentAddress}`).expect(200);
    expect(viewAfterUpdate.body).toMatchObject({ studentName: 'E2E Student Updated', degreeName: 'BSc Hons' });

    await request(server)
      .delete(`/certificate/revoke/${studentAddress}`)
      .set('Authorization', auth)
      .expect(200)
      .expect({ success: true });

    const verifyAfterRevoke = await request(server).get(`/certificate/verify/${studentAddress}`).expect(200);
    expect(verifyAfterRevoke.body).toEqual({ isValid: false });

    await request(server).get(`/certificate/view/${studentAddress}`).expect(404);
  });

  it('rejects update/revoke without a token', async () => {
    await request(server).patch('/certificate/update/0xNoSuchAddr').send({}).expect(401);
    await request(server).delete('/certificate/revoke/0xNoSuchAddr').expect(401);
  });
});
