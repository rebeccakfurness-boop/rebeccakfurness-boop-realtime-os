"use client";

import { useState, useTransition } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Plus, Trash2 } from "lucide-react";
import TaskRow, { type TaskRowData } from "./TaskRow";
import { createTask, reorderTasks, deleteGoal } from "@/lib/actions/goals";
import type { GoalCategory } from "@prisma/client";

export interface GoalCardData {
  id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  targetDate: string | null;
  tasks: TaskRowData[];
}

const CATEGORY_LABEL: Record<GoalCategory, string> = {
  corporate: "Corporate",
  schools: "Schools",
  marketing: "Marketing",
  finance: "Finance",
  ops: "Ops",
  personal: "Personal",
};

interface GoalCardProps {
  goal: GoalCardData;
  scale: "deep" | "light";
  path: string;
  assignable?: { id: string; name: string | null }[];
  onCelebrate?: () => void;
}

export default function GoalCard({ goal, scale, path, assignable, onCelebrate }: GoalCardProps) {
  const [tasks, setTasks] = useState(goal.tasks);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [, startTransition] = useTransition();

  const done = tasks.filter((t) => t.status === "done").length;
  const percent = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);
  const barColor = scale === "deep" ? "bg-deep-500" : "bg-light-500";
  const badgeColor = scale === "deep" ? "bg-deep-50 text-deep-700" : "bg-light-100 text-light-700";

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    setTasks(reordered);
    startTransition(() => {
      reorderTasks({ taskIds: reordered.map((t) => t.id), path });
    });
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const title = newTitle.trim();
    setNewTitle("");
    setAdding(false);
    await createTask({ goalId: goal.id, title, path });
  }

  return (
    <div className="rounded-2xl border border-neutral-border bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeColor}`}>
              {CATEGORY_LABEL[goal.category]}
            </span>
            {goal.targetDate && <span className="text-xs text-neutral-muted">Target {goal.targetDate}</span>}
          </div>
          <h3 className="mt-2 font-display text-lg text-neutral-text">{goal.title}</h3>
          {goal.description && <p className="mt-1 text-sm text-neutral-muted">{goal.description}</p>}
        </div>
        <button
          type="button"
          onClick={() => startTransition(() => deleteGoal({ goalId: goal.id, path }))}
          className="text-neutral-border hover:text-red-500"
          aria-label="Delete goal"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-card">
          <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${percent}%` }} />
        </div>
        <span className="text-xs font-medium text-neutral-muted">
          {done}/{tasks.length} done
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-0.5">
        <DndContext id={`goal-${goal.id}`} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} scale={scale} path={path} assignable={assignable} onCelebrate={onCelebrate} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {adding ? (
        <form onSubmit={handleAddTask} className="mt-2 flex gap-2 px-2">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={() => !newTitle && setAdding(false)}
            placeholder="Task title"
            className="flex-1 rounded-md border border-neutral-border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-deep-200"
          />
          <button type="submit" className="text-sm font-medium text-neutral-muted hover:text-neutral-text">
            Add
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-2 flex items-center gap-1.5 px-2 py-1 text-sm font-medium text-neutral-muted hover:text-neutral-text"
        >
          <Plus size={15} /> Add task
        </button>
      )}
    </div>
  );
}
