"use client";

import { useState, useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical } from "lucide-react";
import { setTaskStatus, reassignTask } from "@/lib/actions/goals";
import type { TaskStatus } from "@prisma/client";

export interface TaskRowData {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
}

interface TaskRowProps {
  task: TaskRowData;
  scale: "deep" | "light";
  path: string;
  assignable?: { id: string; name: string | null }[];
  onCelebrate?: () => void;
}

export default function TaskRow({ task, scale, path, assignable, onCelebrate }: TaskRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const [pending, startTransition] = useTransition();
  const [justCompleted, setJustCompleted] = useState(false);
  const done = task.status === "done";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function toggle() {
    const nextStatus: TaskStatus = done ? "todo" : "done";
    if (!done) {
      setJustCompleted(true);
      onCelebrate?.();
      window.setTimeout(() => setJustCompleted(false), 700);
    }
    startTransition(() => {
      setTaskStatus({ taskId: task.id, status: nextStatus, path });
    });
  }

  const checkboxBg = done
    ? scale === "deep"
      ? "bg-deep-500 border-deep-500"
      : "bg-light-500 border-light-500"
    : "border-neutral-border bg-white";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 rounded-lg px-2 py-2 ${isDragging ? "bg-neutral-card" : "hover:bg-neutral-card/60"}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-neutral-border opacity-0 group-hover:opacity-100"
        aria-label="Reorder task"
      >
        <GripVertical size={14} />
      </button>

      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`relative flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${checkboxBg} ${
          justCompleted ? "scale-125" : "scale-100"
        }`}
        aria-label={done ? "Mark as not done" : "Mark as done"}
      >
        {done && <Check size={12} strokeWidth={3} className="text-white" />}
        {justCompleted && (
          <span
            className={`absolute inset-0 -z-10 animate-ping rounded-full ${scale === "deep" ? "bg-deep-300" : "bg-light-300"}`}
          />
        )}
      </button>

      <span className={`flex-1 text-sm ${done ? "text-neutral-muted line-through" : "text-neutral-text"}`}>{task.title}</span>

      {task.dueDate && <span className="text-xs text-neutral-muted">{task.dueDate}</span>}

      {assignable && assignable.length > 0 ? (
        <select
          value={task.assigneeId ?? ""}
          onChange={(e) => startTransition(() => reassignTask({ taskId: task.id, assigneeId: e.target.value || null, path }))}
          className="rounded-md border border-neutral-border bg-white px-1.5 py-1 text-xs text-neutral-muted"
        >
          <option value="">Unassigned</option>
          {assignable.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name ?? u.id}
            </option>
          ))}
        </select>
      ) : task.assigneeName ? (
        <span className="text-xs text-neutral-muted">{task.assigneeName}</span>
      ) : null}
    </div>
  );
}
