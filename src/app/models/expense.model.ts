export interface Expense {
  id?: number;
  title: string;
  description?: string;
  category: string;
  amount: number;
  type: 'expense' | 'income';
  date: string; // keep as ISO string for simplicity
  paymentMode?: string;
  upiProvider?: string;
  bank?: string;
}
