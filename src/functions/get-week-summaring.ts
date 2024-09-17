import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

export async function getWeekSummering() {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayWeek = dayjs().endOf('week').toDate()

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeekFrequency: goals.desiredWeekFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayWeek))
  )

  const goalsCompletionInWeek = db.$with('goal_completion_in_week').as(
    db
      .select({
        Id: goals.id,
        title: goals.title,
        completedAt: goalCompletions.createdAt,
        completedAtDate: sql`
            DATE(${goalCompletions.createdAt})
        `.as('completeAtDate'),
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayWeek)
        )
      )
      .orderBy(desc(goalCompletions.createdAt))
  )

  const goalscompletedbyWeekDay = db.$with('goals_completed_by_week_day').as(
    db
      .select({
        completedAtDate: goalsCompletionInWeek.completedAtDate,
        completions: sql`
                JSON_AGG(
                JSON_BUILD_OBJECT(
                'id', ${goalsCompletionInWeek.Id},
                'title', ${goalsCompletionInWeek.title},
                'completedAt', ${goalsCompletionInWeek.completedAt}
                )
            )
            `.as('completions'),
      })
      .from(goalsCompletionInWeek)
      .groupBy(goalsCompletionInWeek.completedAtDate)
      .orderBy(desc(goalsCompletionInWeek.completedAtDate))
  )

  type GoalsPerDay = Record<
    string,
    {
      id: string
      title: string
      completedAt: string
    }[]
  >

  const result = await db
    .with(goalsCreatedUpToWeek, goalsCompletionInWeek, goalscompletedbyWeekDay)
    .select({
      completed: sql`(SELECT COUNT(*) FROM ${goalsCompletionInWeek})`.mapWith(
        Number
      ),
      total:
        sql`(SELECT SUM(${goalsCreatedUpToWeek.desiredWeekFrequency}) FROM ${goalsCreatedUpToWeek})`.mapWith(
          Number
        ),
      goalsPerDay: sql<GoalsPerDay>`
            JSON_OBJECT_AGG(
            ${goalscompletedbyWeekDay.completedAtDate},
            ${goalscompletedbyWeekDay.completions}
            )
        `,
    })
    .from(goalscompletedbyWeekDay)

  return {
    summary: result[0],
  }
}
