import { app } from '../src/app'
import supertest from 'supertest'
import { afterAll, beforeAll, it, describe, beforeEach, expect } from 'vitest'
import { execSync } from 'node:child_process'

describe('Meals routes', () => {
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

  it('should be able to list all meals by user', async () => {
    await supertest(app.server)
      .post('/users')
      .send({
        name: 'Isaac Mendes',
        email: 'isaac@mail.com',
        password: 'senha@1234',
      })
      .expect(201)

    const resp = await supertest(app.server)
      .post('/users/login')
      .send({
        email: 'isaac@mail.com',
        password: 'senha@1234',
      })
      .expect(200)

    const cookies = resp.get('Set-Cookie')
    await supertest(app.server).get('/meals').set('Cookie', cookies).expect(200)
  })

  it('should be able to create a meal', async () => {
    await supertest(app.server)
      .post('/users')
      .send({
        name: 'Isaac Mendes',
        email: 'isaac@mail.com',
        password: 'senha@1234',
      })
      .expect(201)

    const resp = await supertest(app.server)
      .post('/users/login')
      .send({
        email: 'isaac@mail.com',
        password: 'senha@1234',
      })
      .expect(200)

    const cookies = resp.get('Set-Cookie')

    await supertest(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Chocolate',
        description: 'teste',
        date: '09/12/2023',
        hour: '20:00',
        diet: false,
      })
      .expect(201)
  })

  it('should be able to list a meal by id', async () => {
    await supertest(app.server)
      .post('/users')
      .send({
        name: 'Isaac Mendes',
        email: 'isaac@mail.com',
        password: 'senha@1234',
      })
      .expect(201)

    const resp = await supertest(app.server)
      .post('/users/login')
      .send({
        email: 'isaac@mail.com',
        password: 'senha@1234',
      })
      .expect(200)

    const cookies = resp.get('Set-Cookie')

    await supertest(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Chocolate',
        description: 'teste',
        date: '09/12/2023',
        hour: '20:00',
        diet: false,
      })
      .expect(201)

    const all = await supertest(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const { id } = all.body.meals[0]

    const unique = await supertest(app.server)
      .get(`/meals/${id}`)
      .set('Cookie', cookies)

    const { id: idTest } = unique.body.meal

    expect(id).toEqual(idTest)
  })

  it('should be able to update a meal', async () => {
    await supertest(app.server)
      .post('/users')
      .send({
        name: 'Isaac Mendes',
        email: 'isaac@mail.com',
        password: 'senha@1234',
      })
      .expect(201)

    const resp = await supertest(app.server)
      .post('/users/login')
      .send({
        email: 'isaac@mail.com',
        password: 'senha@1234',
      })
      .expect(200)

    const cookies = resp.get('Set-Cookie')

    await supertest(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Chocolate',
        description: 'teste',
        date: '09/12/2023',
        hour: '20:00',
        diet: false,
      })
      .expect(201)

    const all = await supertest(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const { id } = all.body.meals[0]

    await supertest(app.server)
      .put(`/meals/${id}`)
      .set('Cookie', cookies)
      .send({
        name: 'Chocolate amargo',
        description: 'teste',
        date: '09/12/2023',
        hour: '20:00',
        diet: false,
      })
      .expect(200)
  })

  it('should be able to delete a meal', async () => {
    await supertest(app.server)
      .post('/users')
      .send({
        name: 'Isaac Mendes',
        email: 'isaac@mail.com',
        password: 'senha@1234',
      })
      .expect(201)

    const resp = await supertest(app.server)
      .post('/users/login')
      .send({
        email: 'isaac@mail.com',
        password: 'senha@1234',
      })
      .expect(200)

    const cookies = resp.get('Set-Cookie')

    await supertest(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Chocolate',
        description: 'teste',
        date: '09/12/2023',
        hour: '20:00',
        diet: false,
      })
      .expect(201)

    const all = await supertest(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    const { id } = all.body.meals[0]

    await supertest(app.server)
      .delete(`/meals/${id}`)
      .set('Cookie', cookies)
      .expect(200)
  })

  it('should able to list a dashboard with info of user', async () => {
    await supertest(app.server)
      .post('/users')
      .send({
        name: 'Isaac Mendes',
        email: 'isaac@mail.com',
        password: 'senha@1234',
      })
      .expect(201)

    const resp = await supertest(app.server)
      .post('/users/login')
      .send({
        email: 'isaac@mail.com',
        password: 'senha@1234',
      })
      .expect(200)

    const cookies = resp.get('Set-Cookie')

    const data = await supertest(app.server)
      .get('/meals/dashboard')
      .set('Cookie', cookies)
      .expect(200)

    expect(data.body.dashboard.meals.total).toEqual(0)
    expect(data.body.dashboard.inDiet.total).toEqual(0)
    expect(data.body.dashboard.outDiet.total).toEqual(0)
    expect(data.body.dashboard.bestSequence.total).toEqual(0)
  })
})
