"use client";

import { useMemo, useState } from "react";
import { Plus, Flame } from "lucide-react";
import GoalCard, { type GoalCardData } from "./GoalCard";
import ProgressRing from "./ProgressRing";
import { createGoal } from "@/lib/actions/goals";
import type { GoalCategory } from "@prisma/client";

const CATEGORIES: GoalCategory[] = ["corporate", "schools", "marketing", "finance", "ops", "personal"];

interface GoalsBoardProps {
  scale: "deep" | "light";
  path: string;
  goals: GoalCardData[];
  initialStreak: number;
  heading: string;
  subheading: string;
  newGoalLabel: string;
  categoryOptions?: GoalCategory[];
  assignable?: { id: string; name: string | null }[];
}

export default function GoalsBoard({
  scale,
  path,
  goals,
  initialStreak,
  heading,
  subheading,
  newGoalLabel,
  categoryOptions = CATEGORIES,
  assignable,
}: GoalsBoardProps) {
  const [streak, setStreak] = useState(initialStreak);
  const [categoryFilter, setCategoryFilter] = useState<GoalCategory | "all">("all");
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<GoalCategory>(categoryOptions[0]);
  const [targetDate, setTargetDate] = useState("");

  const totalTasks = goals.reduce((acc, g) => acc + g.tasks.length, 0);
  const doneTasks = goals.reduce((acc, g) => acc + g.tasks.filter((t) => t.status === "done").length, 0);
  const overallPercent = totalTasks === 0 ? 0 : (doneTasks / totalTasks) * 100;

  const filtered = useMemo(
    () => (categoryFilter === "all" ? goals : goals.filter((g) => g.category === categoryFilter)),
    [goals, categoryFilter],
  );

  const accentText = scale === "deep" ? "text-deep-600" : "text-light-700";

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createGoal({ title: title.trim(), description, category, targetDate, path });
    setTitle("");
    setDescription("");
    setTargetDate("");
    setShowNewGoal(false);
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl text-neutral-text">{heading}</h1>
          <p className="mt-1 text-neutral-muted">{subheading}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1.5 text-sm font-semibold text-teal-700">
            <Flame size={16} />
            {streak} done today
          </div>
          <ProgressRing percent={overallPercent} scale={scale} label="this quarter" />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-medium ${categoryFilter === "all" ? `bg-neutral-text text-white` : "bg-neutral-card text-neutral-muted"}`}
          >
            All
          </button>
          {categoryOptions.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryFilter(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${categoryFilter === c ? "bg-neutral-text text-white" : "bg-neutral-card text-neutral-muted"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowNewGoal((v) => !v)}
          className={`flex items-center gap-1.5 text-sm font-semibold ${accentText}`}
        >
          <Plus size={16} /> {newGoalLabel}
        </button>
      </div>

      {showNewGoal && (
        <form onSubmit={handleCreateGoal} className="mt-4 flex flex-col gap-3 rounded-2xl border border-neutral-border bg-white p-6">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal title"
            className="rounded-lg border border-neutral-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-deep-200"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why does this matter? (optional)"
            rows={2}
            className="rounded-lg border border-neutral-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-deep-200"
          />
          <div className="flex flex-wrap gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as GoalCategory)}
              className="rounded-lg border border-neutral-border px-3 py-2 text-sm capitalize"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="rounded-lg border border-neutral-border px-3 py-2 text-sm"
            />
            <button type="submit" className={`ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-white ${scale === "deep" ? "bg-deep-500" : "bg-light-500"}`}>
              Create goal
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 flex flex-col gap-5">
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-dashed border-neutral-border p-8 text-center text-sm text-neutral-muted">
            No goals here yet. Start with one thing that would make the next 90 days count.
          </p>
        )}
        {filtered.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            scale={scale}
            path={path}
            assignable={assignable}
            onCelebrate={() => setStreak((s) => s + 1)}
          />
        ))}
      </div>
    </div>
  );
}
