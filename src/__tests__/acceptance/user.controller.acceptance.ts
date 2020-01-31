import { Client, expect } from '@loopback/testlab';
import pick from 'lodash/pick';

import { IfgServerApplication } from '../..';
import { setupApplication } from '../helpers/test.helper';
import { givenEmptyDatabase, givenUser } from "../helpers/database.helpers";

describe('UserController', () => {
  let app: IfgServerApplication;
  let client: Client;

  const user = givenUser();

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });
  before(migrateSchema);

  beforeEach(givenEmptyDatabase);

  after(async () => {
    await givenEmptyDatabase();
    await app.stop();
  });

  it('throws error for POST /users with an invalid email', async function () {
    await client.post('/users').send({
      email: '1123123',
      password: '12312312312',
      username: 'tuan.tran',
    }).expect(422);
  });

  it('throws error for POST /users with a missing email', async function () {
    await client.post('/users').send({
      password: '12312312312',
      username: 'tuan.tran',
    }).expect(422);
  });

  it('throws error for POST /users with a missing password', async function () {
    await client.post('/users').send({
      email: '1@1.com',
      username: 'tuan.tran',
    }).expect(422);
  });

  it('registers new user when invoke POST /users', async function () {
    const response = await client.post('/users').send(user);
    expect(response.status).to.equal(200);
    expect(response.body.email).to.equal(user.email);
    expect(response.body.username).to.equal(user.username);
    expect(response.body).to.not.have.property('password');
  });

  it('shouldn\'t register an user with existed email in our db',
    async function () {
      await client.post('/users').send(user).expect(200);
      const response = await client.post('/users').send(user);
      expect(response.status).to.equal(409);
    });

  describe('authentication', () => {
    it('login with existed user', async function () {
      await client.post('/users').send(user).expect(200);
      const credential = pick(user, ['email', 'password']);
      const response = await client.post('/users/login').send(credential);
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('token');
    });

    it('login returns an error when invalid email is used', async () => {
      await client.post('/users').send(user).expect(200);

      const res = await client
        .post('/users/login')
        .send({ email: 'idontexist@example.com', password: user.password })
        .expect(404);

      expect(res.body.error.message)
        .to.equal(`User with email idontexist@example.com not found.`);
    });

    it('login returns an error when invalid password is used', async () => {
      await client.post('/users').send(user).expect(200);

      const res = await client
        .post('/users/login')
        .send({ email: user.email, password: 'wrongpassword' })
        .expect(401);

      expect(res.body.error.message).to.equal('The credentials are not correct.');
    });
  });

  async function migrateSchema() {
    await app.migrateSchema();
  }
});
