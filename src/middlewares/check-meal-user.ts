import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

export async function checkMealUserExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const validateParams = z.object({
    id: z.string().uuid(),
  })

  const userId = request.cookies.sessionId
  const { id } = validateParams.parse(request.params)

  const meal = await knex('meals')
    .where({
      id,
      user_id: userId,
    })
    .first()

  if (!meal) {
    return reply.status(401).send({
      error: 'Unauthorized.',
    })
  }
}
