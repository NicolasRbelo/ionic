import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

interface CreateGoalCompletionsRequest {
  goalId: string
}

export async function CreateGoalCompletionsRequest({
  goalId,
}: CreateGoalCompletionsRequest) {
  const lastDayWeek = dayjs().endOf('week').toDate()
  const firstDayOfWeek = dayjs().startOf('week').toDate()

  const goalsCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('CompletionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayWeek),
          eq(goalCompletions.goalId, goalId)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const result = await db
    .with(goalsCompletionCounts)
    .select({
      desiredWeekFrequency: goals.desiredWeekFrequency,
      completionCount: sql`
        COALESCE(${goalsCompletionCounts.completionCount}, 0)
        `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalsCompletionCounts, eq(goalsCompletionCounts.goalId, goals.id))
    .where(eq(goals.id, goalId))
    .limit(1)

  const { completionCount, desiredWeekFrequency } = result[0]

  if (completionCount >= desiredWeekFrequency) {
    throw new Error('Goal already completed this week')
  }

  const innerResult = await db
    .insert(goalCompletions)
    .values({ goalId })
    .returning()
  const goalCompletion = innerResult

  return {
    goalCompletion,
  }
}
