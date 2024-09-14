import z from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createGoal } from '../../functions/create-goal'

export const CreateGoalRoute: FastifyPluginAsyncZod = async app => {
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
}
