import z from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createGoal } from '../../functions/create-goal'
import { getWeekPendingGoal } from '../../functions/get-week-peding-goal'

export const GetPendingGoalsRoute: FastifyPluginAsyncZod = async app => {
  app.get('/pending-goals', async () => {
    const { pendingGoal } = await getWeekPendingGoal()

    return { pendingGoal }
  })
}
