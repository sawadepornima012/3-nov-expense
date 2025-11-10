export interface Expense {
  id?: number;                     // Auto-generated (for backend)
  title: string;                   // Expense title
  description?: string;            // Optional details
  category: string;                // e.g. Food, Travel, Salary, etc.
  amount: number;                  // Positive value
  type: 'expense' | 'income';      // Indicates transaction type
  date: string;                    // ISO date string (YYYY-MM-DD)

  // 💳 Payment details
  paymentMode: string; 
  upiProvider?: string;            // e.g. Google Pay, PhonePe
  bank?: string;                   // e.g. HDFC, SBI, ICICI

  // 💰 Income-specific fields
  incomeSource?: string;           // e.g. Salary, Freelance, Gift
  incomeDate?: string;             // Date of income received
}
