import { app } from '../src/app'
import supertest from 'supertest'
import { afterAll, beforeAll, it, describe, beforeEach, expect } from 'vitest'
import { execSync } from 'node:child_process'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to list all users', async () => {
    await supertest(app.server).get('/users').expect(200)
  })

  it('should be able to create a user', async () => {
    await supertest(app.server)
      .post('/users')
      .send({
        name: 'Felipe Mendes',
        email: 'felipe@mail.com',
        password: 'senha@1234',
      })
      .expect(201)
  })

  it('should be able to list a user by id', async () => {
    await supertest(app.server)
      .post('/users')
      .send({
        name: 'Felipe Mendes',
        email: 'felipe@mail.com',
        password: 'senha@1234',
      })
      .expect(201)

    const all = await supertest(app.server).get('/users')
    const { id } = all.body.users[0]

    const unique = await supertest(app.server).get(`/users/${id}`)
    const { id: idTest } = unique.body.user

    expect(id).toEqual(idTest)
  })

  it('should be able to login a user', async () => {
    await supertest(app.server)
      .post('/users')
      .send({
        name: 'Felipe Mendes',
        email: 'felipe@mail.com',
        password: 'senha@1234',
      })
      .expect(201)

    await supertest(app.server)
      .post('/users/login')
      .send({
        email: 'felipe@mail.com',
        password: 'senha@1234',
      })
      .expect(200)
  })
})
