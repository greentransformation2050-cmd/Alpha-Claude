import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { Task, TaskPriority, TaskStatus } from "../types.js";

/**
 * JSON-file-backed task store. The file location can be overridden with the
 * CLIMATETASK_DATA_FILE environment variable; by default tasks live in
 * ~/.climatetask/tasks.json so they persist across sessions and projects.
 */
const DATA_FILE =
  process.env.CLIMATETASK_DATA_FILE ?? join(homedir(), ".climatetask", "tasks.json");

async function load(): Promise<Task[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Task[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw new Error(
      `Task data file ${DATA_FILE} is unreadable or corrupt: ${error instanceof Error ? error.message : String(error)}. Fix or delete the file, or point CLIMATETASK_DATA_FILE elsewhere.`
    );
  }
}

async function save(tasks: Task[]): Promise<void> {
  await mkdir(dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), "utf-8");
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  due_date?: string;
  tags: string[];
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID().slice(0, 8),
    title: input.title,
    description: input.description,
    status: TaskStatus.TODO,
    priority: input.priority,
    due_date: input.due_date,
    tags: input.tags,
    created_at: now,
    updated_at: now,
  };
  const tasks = await load();
  tasks.push(task);
  await save(tasks);
  return task;
}

export interface ListTasksFilter {
  status?: TaskStatus;
  tag?: string;
  search?: string;
  limit: number;
  offset: number;
}

export interface ListTasksResult {
  total: number;
  count: number;
  offset: number;
  tasks: Task[];
  has_more: boolean;
  next_offset?: number;
}

export async function listTasks(filter: ListTasksFilter): Promise<ListTasksResult> {
  let tasks = await load();

  if (filter.status) {
    tasks = tasks.filter((t) => t.status === filter.status);
  }
  if (filter.tag) {
    const tag = filter.tag.toLowerCase();
    tasks = tasks.filter((t) => t.tags.some((x) => x.toLowerCase() === tag));
  }
  if (filter.search) {
    const q = filter.search.toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q)
    );
  }

  // Due-soonest first; tasks without a due date sort last, then by creation time.
  tasks.sort((a, b) => {
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
    if (a.due_date) return -1;
    if (b.due_date) return 1;
    return a.created_at.localeCompare(b.created_at);
  });

  const total = tasks.length;
  const page = tasks.slice(filter.offset, filter.offset + filter.limit);
  const hasMore = total > filter.offset + page.length;
  return {
    total,
    count: page.length,
    offset: filter.offset,
    tasks: page,
    has_more: hasMore,
    ...(hasMore ? { next_offset: filter.offset + page.length } : {}),
  };
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  tags?: string[];
}

export async function updateTask(input: UpdateTaskInput): Promise<Task> {
  const tasks = await load();
  const task = tasks.find((t) => t.id === input.id);
  if (!task) {
    throw new Error(
      `No task with id '${input.id}'. Use climatetask_list_tasks to see valid task ids.`
    );
  }
  if (input.title !== undefined) task.title = input.title;
  if (input.description !== undefined) task.description = input.description;
  if (input.status !== undefined) task.status = input.status;
  if (input.priority !== undefined) task.priority = input.priority;
  if (input.due_date !== undefined) task.due_date = input.due_date ?? undefined;
  if (input.tags !== undefined) task.tags = input.tags;
  task.updated_at = new Date().toISOString();
  await save(tasks);
  return task;
}

export async function deleteTask(id: string): Promise<Task> {
  const tasks = await load();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    throw new Error(
      `No task with id '${id}'. Use climatetask_list_tasks to see valid task ids.`
    );
  }
  const [removed] = tasks.splice(index, 1);
  await save(tasks);
  return removed;
}
