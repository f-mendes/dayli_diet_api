import fastify from 'fastify'
import cookies from '@fastify/cookie'
import { users } from './routes/users'

export const app = fastify()

app.register(cookies)
app.register(users, {
  prefix: 'users',
})
