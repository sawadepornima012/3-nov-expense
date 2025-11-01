export interface Payment {
  id?: number;
  name: string;
  category: string;
  description?: string;
  amount: number;
  date: string;        // Store as ISO string for easier formatting
  mode: string;        // e.g., "UPI", "Credit", "Cash"
  status?: string;     // Optional (e.g., "Completed", "Pending")
}
