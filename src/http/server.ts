import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createGoal } from '../functions/create-goal'
import z from 'zod'
import { getWeekPendingGoal } from '../functions/get-week-peding-goal'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.get('/pending-goals', async () => {
  const { pendingGoal } = await getWeekPendingGoal()

  return { pendingGoal }
})

app.post(
  '/goal',
  {
    schema: {
      body: z.object({
        title: z.string(),
        desiredWeekFrequency: z.number().int().min(1).max(7),
      }),
    },
  },
  async request => {
    const { title, desiredWeekFrequency } = request.body
    await createGoal({
      title,
      desiredWeekFrequency,
    })
  }
)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('http server running')
  })
