import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { checkMealUserExists } from '../middlewares/check-meal-user'
import { validateDate, validateTime } from '../utils/handleDate'
import { findBestSequence } from '../utils/handleSequence'

export async function meals(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const validateBody = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        hour: z.string(),
        diet: z.boolean(),
      })

      const { name, description, date, hour, diet } = validateBody.parse(
        request.body,
      )

      const dateParse = validateDate(date)
      const dateTime = validateTime(hour)
      const userId = request.cookies.sessionId

      await knex('meals').insert({
        id: randomUUID(),
        user_id: userId,
        name,
        description,
        date: dateParse,
        hour: dateTime,
        diet,
      })

      return reply.status(201).send
    },
  )

  app.put(
    '/:id',
    { preHandler: [checkSessionIdExists, checkMealUserExists] },
    async (request, reply) => {
      const validateParams = z.object({
        id: z.string().uuid(),
      })

      const validateBody = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        hour: z.string(),
        diet: z.boolean(),
      })

      const { id } = validateParams.parse(request.params)
      const { name, description, date, hour, diet } = validateBody.parse(
        request.body,
      )

      const dateParse = validateDate(date)
      const dateTime = validateTime(hour)
      const userId = request.cookies.sessionId

      await knex('meals')
        .where({
          id,
          user_id: userId,
        })
        .update({
          name,
          description,
          date: dateParse,
          hour: dateTime,
          diet,
        })

      return reply.status(200).send
    },
  )

  app.delete(
    '/:id',
    { preHandler: [checkSessionIdExists, checkMealUserExists] },
    async (request, reply) => {
      const validateParams = z.object({
        id: z.string().uuid(),
      })

      const { id } = validateParams.parse(request.params)
      const userId = request.cookies.sessionId

      await knex('meals')
        .where({
          id,
          user_id: userId,
        })
        .delete()

      return reply.status(200).send
    },
  )

  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const userId = request.cookies.sessionId

    const meals = await knex('meals').where('user_id', userId).select()

    return { meals }
  })

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const validateParams = z.object({
      id: z.string().uuid(),
    })
    const { id } = validateParams.parse(request.params)
    const userId = request.cookies.sessionId

    const meal = await knex('meals')
      .where({
        id,
        user_id: userId,
      })
      .first()

    return { meal }
  })

  app.get(
    '/dashboard',
    { preHandler: [checkSessionIdExists] },
    async (request) => {
      const userId = request.cookies.sessionId

      const meals = await knex('meals')
        .count('*', { as: 'total' })
        .where('user_id', userId)
        .first()

      const inDiet = await knex('meals')
        .count('*', { as: 'total' })
        .where({ user_id: userId, diet: 1 })
        .first()

      const outDiet = await knex('meals')
        .count('*', { as: 'total' })
        .where({ user_id: userId, diet: 0 })
        .first()

      const all = await knex('meals').where('user_id', userId).select()
      const bestSequence = await findBestSequence(all)

      const dashboard = { meals, inDiet, outDiet, bestSequence }
      return { dashboard }
    },
  )
}
