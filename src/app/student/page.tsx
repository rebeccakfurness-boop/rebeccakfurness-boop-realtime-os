import { format, startOfDay } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import GoalsBoard from "@/components/goals/GoalsBoard";
import type { GoalCardData } from "@/components/goals/GoalCard";

export default async function StudentOverviewPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [goals, streakCount] = await Promise.all([
    prisma.goal.findMany({
      where: { ownerType: "student", ownerUserId: userId },
      include: { tasks: { orderBy: { orderIndex: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.count({
      where: {
        status: "done",
        completedAt: { gte: startOfDay(new Date()) },
        goal: { ownerUserId: userId },
      },
    }),
  ]);

  const goalCards: GoalCardData[] = goals.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    category: g.category,
    targetDate: g.targetDate ? format(g.targetDate, "d MMM yyyy") : null,
    tasks: g.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      dueDate: t.dueDate ? format(t.dueDate, "d MMM") : null,
      assigneeId: t.assigneeId,
      assigneeName: null,
    })),
  }));

  return (
    <GoalsBoard
      scale="light"
      path="/student"
      goals={goalCards}
      initialStreak={streakCount}
      heading="Your goals"
      subheading="Write down what matters to you and break it into steps you can actually tick off."
      newGoalLabel="Add a goal"
      categoryOptions={["personal"]}
    />
  );
}
