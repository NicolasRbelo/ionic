import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { CreateGoalRoute } from './routes/create-goals'
import { GetPendingGoalsRoute } from './routes/get-pending-goals'
import { CreateGoalCompletionsRoute } from './routes/create-goals-completions'
import { getWeekSummeringRoute } from './routes/get-week-summaring'
import fastifyCors from '@fastify/cors'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.register(fastifyCors, {
  origin: '*',
})

app.register(CreateGoalRoute)
app.register(CreateGoalCompletionsRoute)
app.register(GetPendingGoalsRoute)
app.register(getWeekSummeringRoute)

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('http server running')
  })
