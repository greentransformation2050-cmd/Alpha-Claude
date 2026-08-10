import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ResponseFormat, Task, TaskPriority, TaskStatus } from "../types.js";
import { createTask, deleteTask, listTasks, updateTask } from "../services/store.js";
import { errorResult, formatResult } from "../services/format.js";

const responseFormatField = z
  .nativeEnum(ResponseFormat)
  .default(ResponseFormat.MARKDOWN)
  .describe("Output format: 'markdown' for human-readable or 'json' for machine-readable");

const dueDateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format")
  .describe("Due date in YYYY-MM-DD format, e.g. '2026-09-15'");

function taskToMarkdown(task: Task): string {
  const lines = [
    `## ${task.title} (${task.id})`,
    `- **Status**: ${task.status} | **Priority**: ${task.priority}`,
  ];
  if (task.due_date) lines.push(`- **Due**: ${task.due_date}`);
  if (task.tags.length) lines.push(`- **Tags**: ${task.tags.join(", ")}`);
  if (task.description) lines.push(`- ${task.description}`);
  return lines.join("\n");
}

export function registerTaskTools(server: McpServer): void {
  server.registerTool(
    "climatetask_create_task",
    {
      title: "Create Task",
      description: `Create a new task in the local ClimateTask tracker (stored in a JSON file on this machine).

Use for tracking proposal deadlines, review milestones, and project to-dos. New tasks start with status 'todo'.

Args:
  - title (string, required): Short task title, e.g. "Submit SARITEM-2 response matrix"
  - description (string, optional): Longer details
  - priority ('low' | 'medium' | 'high' | 'critical', default 'medium')
  - due_date (string, optional): YYYY-MM-DD
  - tags (string[], optional): Labels such as fund or project names, e.g. ["FRLD", "SARITEM-2"]
  - response_format ('markdown' | 'json', default 'markdown')

Returns: The created task including its generated 'id' (needed for updates/deletion).`,
      inputSchema: {
        title: z.string().min(1).max(200).describe("Short task title"),
        description: z.string().max(5000).optional().describe("Longer task details"),
        priority: z
          .nativeEnum(TaskPriority)
          .default(TaskPriority.MEDIUM)
          .describe("Task priority"),
        due_date: dueDateField.optional(),
        tags: z
          .array(z.string().min(1).max(50))
          .max(20)
          .default([])
          .describe("Labels such as fund or project names"),
        response_format: responseFormatField,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const task = await createTask({
          title: params.title,
          description: params.description,
          priority: params.priority,
          due_date: params.due_date,
          tags: params.tags,
        });
        const structured = { task: task as unknown as Record<string, unknown> };
        return formatResult(
          params.response_format,
          `# Task created\n\n${taskToMarkdown(task)}`,
          structured
        );
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "climatetask_list_tasks",
    {
      title: "List Tasks",
      description: `List tasks from the local ClimateTask tracker, sorted by due date (soonest first; undated tasks last).

Args:
  - status ('todo' | 'in_progress' | 'blocked' | 'done', optional): Filter by status
  - tag (string, optional): Filter to tasks carrying this tag (case-insensitive exact match)
  - search (string, optional): Case-insensitive substring match on title/description
  - limit (number, 1-100, default 20), offset (number, default 0): Pagination
  - response_format ('markdown' | 'json', default 'markdown')

Returns: { total, count, offset, tasks[], has_more, next_offset? }`,
      inputSchema: {
        status: z.nativeEnum(TaskStatus).optional().describe("Filter by status"),
        tag: z.string().optional().describe("Filter by tag (case-insensitive)"),
        search: z.string().optional().describe("Substring match on title/description"),
        limit: z.number().int().min(1).max(100).default(20).describe("Maximum results"),
        offset: z.number().int().min(0).default(0).describe("Results to skip"),
        response_format: responseFormatField,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await listTasks({
          status: params.status,
          tag: params.tag,
          search: params.search,
          limit: params.limit,
          offset: params.offset,
        });
        const structured = result as unknown as Record<string, unknown>;
        const lines = [
          `# Tasks (${result.count} of ${result.total})`,
          "",
          ...(result.tasks.length
            ? result.tasks.flatMap((t) => [taskToMarkdown(t), ""])
            : ["No tasks match the given filters."]),
        ];
        if (result.has_more) {
          lines.push(`More available: pass offset=${result.next_offset}.`);
        }
        return formatResult(params.response_format, lines.join("\n"), structured);
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "climatetask_update_task",
    {
      title: "Update Task",
      description: `Update fields of an existing task (status changes, reprioritisation, deadline moves, retagging).

Args:
  - id (string, required): Task id from climatetask_create_task or climatetask_list_tasks
  - title, description, status, priority, due_date, tags: Any subset of fields to change.
    Pass clear_due_date=true to remove an existing due date.
  - response_format ('markdown' | 'json', default 'markdown')

Returns: The full updated task. Errors with a clear message if the id does not exist.`,
      inputSchema: {
        id: z.string().min(1).describe("Task id"),
        title: z.string().min(1).max(200).optional().describe("New title"),
        description: z.string().max(5000).optional().describe("New description"),
        status: z.nativeEnum(TaskStatus).optional().describe("New status"),
        priority: z.nativeEnum(TaskPriority).optional().describe("New priority"),
        due_date: dueDateField.optional(),
        clear_due_date: z
          .boolean()
          .default(false)
          .describe("Set true to remove the existing due date"),
        tags: z
          .array(z.string().min(1).max(50))
          .max(20)
          .optional()
          .describe("Replacement tag list"),
        response_format: responseFormatField,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const task = await updateTask({
          id: params.id,
          title: params.title,
          description: params.description,
          status: params.status,
          priority: params.priority,
          due_date: params.clear_due_date ? null : params.due_date,
          tags: params.tags,
        });
        const structured = { task: task as unknown as Record<string, unknown> };
        return formatResult(
          params.response_format,
          `# Task updated\n\n${taskToMarkdown(task)}`,
          structured
        );
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.registerTool(
    "climatetask_delete_task",
    {
      title: "Delete Task",
      description: `Permanently delete a task from the local ClimateTask tracker. This cannot be undone — prefer setting status='done' via climatetask_update_task for completed work.

Args:
  - id (string, required): Task id to delete
  - response_format ('markdown' | 'json', default 'markdown')

Returns: The deleted task, as a final record.`,
      inputSchema: {
        id: z.string().min(1).describe("Task id"),
        response_format: responseFormatField,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const task = await deleteTask(params.id);
        const structured = { deleted: task as unknown as Record<string, unknown> };
        return formatResult(
          params.response_format,
          `# Task deleted\n\n${taskToMarkdown(task)}`,
          structured
        );
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
