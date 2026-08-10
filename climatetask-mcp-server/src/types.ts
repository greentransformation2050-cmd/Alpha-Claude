export enum ResponseFormat {
  MARKDOWN = "markdown",
  JSON = "json",
}

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  BLOCKED = "blocked",
  DONE = "done",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** ISO date (YYYY-MM-DD) the task is due, if any. */
  due_date?: string;
  /** Free-form tags, e.g. project or fund names ("FRLD", "GCF", "SARITEM-2"). */
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
  population?: number;
  elevation?: number;
}

export interface IndicatorPoint {
  year: string;
  value: number | null;
}
