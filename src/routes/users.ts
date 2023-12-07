import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { createHash, comparePassword } from '../utils/handlePassword'

export async function users(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const validateBody = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    const { name, email, password } = validateBody.parse(request.body)
    const hashPassword = await createHash(password)

    const user = await knex('users').where('email', email).first()

    if (user) {
      return reply.status(401).send({
        message: 'This email has already been registered',
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password: hashPassword,
    })

    return reply.status(201).send()
  })

  app.get('/', async () => {
    const users = await knex('users').select()

    return { users }
  })

  app.get('/:id', async (request) => {
    const { id } = z
      .object({
        id: z.string().uuid(),
      })
      .parse(request.params)

    const user = await knex('users').where('id', id).first()

    return { user }
  })

  app.post('/login', async (request, reply) => {
    const validateBody = z.object({
      email: z.string(),
      password: z.string(),
    })

    const { email, password } = validateBody.parse(request.body)

    const user = await knex('users').where('email', email).first()

    if (!user) {
      return reply.status(401).send({
        message: 'E-mail or password Invalid',
      })
    }

    await comparePassword(password, user.password).then((validated) => {
      if (validated) {
        return reply
          .setCookie('sessionId', user.id, {
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
          })
          .status(200)
          .send({
            message: 'Login success!',
          })
      } else {
        return reply.status(401).send({
          message: 'E-mail or password Invalid',
        })
      }
    })
  })
}
