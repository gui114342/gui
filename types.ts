export interface LogEntry {
  id: string;
  date: string;
  value: number; // e.g., Weight kg, or Progress %
  note: string;
  imageData: string | null; // Base64 image string
}

export interface Tracker {
  id: string;
  title: string;
  targetDescription: string; // "Exercise 30 mins daily"
  unit: string; // "kg", "pages", "%"
  logs: LogEntry[];
  createdAt: string;
}