import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

import { getWeekSummering } from '../../functions/get-week-summaring'

export const getWeekSummeringRoute: FastifyPluginAsyncZod = async app => {
  app.get('/summaring', async () => {
    const { summary } = await getWeekSummering()

    return { summary }
  })
}
