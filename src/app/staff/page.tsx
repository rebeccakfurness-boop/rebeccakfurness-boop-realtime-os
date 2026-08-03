import { format, startOfDay } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import GoalsBoard from "@/components/goals/GoalsBoard";
import type { GoalCardData } from "@/components/goals/GoalCard";

export default async function StaffOverviewPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [goals, staffUsers, streakCount] = await Promise.all([
    prisma.goal.findMany({
      where: { ownerType: "staff" },
      include: { tasks: { include: { assignee: true }, orderBy: { orderIndex: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ where: { role: "staff" }, select: { id: true, name: true } }),
    prisma.task.count({
      where: {
        status: "done",
        completedAt: { gte: startOfDay(new Date()) },
        assigneeId: userId,
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
      assigneeName: t.assignee?.name ?? null,
    })),
  }));

  return (
    <GoalsBoard
      scale="deep"
      path="/staff"
      goals={goalCards}
      initialStreak={streakCount}
      heading="This quarter"
      subheading="Every goal on the board, one place, the way it actually gets done."
      newGoalLabel="New goal"
      categoryOptions={["corporate", "schools", "marketing", "finance", "ops"]}
      assignable={staffUsers}
    />
  );
}
