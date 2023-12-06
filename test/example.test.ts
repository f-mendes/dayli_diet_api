import { app } from '../src/app'
import supertest from 'supertest'
import { afterAll, beforeAll, it, describe, expect, beforeEach } from 'vitest'
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
})
