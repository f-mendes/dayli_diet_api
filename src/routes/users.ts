import { randomUUID } from 'crypto'
import { FastifyInstance } from 'fastify'

export async function users(app: FastifyInstance) {
  app.get('/', async () => {
    const users = {
      id: randomUUID(),
      name: 'John Doe',
      email: 'john@doe.com',
    }

    return { users }
  })
}
