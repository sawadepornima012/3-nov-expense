import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Expense } from '../../models/expense.model';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent implements OnInit {

  constructor(private expenseService: ExpenseService) {}

  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  isLoading = false;
  showAddForm = false;
  showDeleteModal = false;
  editingExpense: Expense | null = null;
  expenseToDelete: Expense | null = null;
  isDeleting = false;
  isExporting = false;

  // Form fields
  formTitle = '';
  formDescription = '';
  formCategory = '';
  formAmount: number | null = null;
  formType = 'expense';
  formDate = '';
  formPaymentMode = '';
  formUpiProvider = '';
  formBank = '';

  // Filter fields
  selectedCategory = '';
  selectedType = '';
  selectedPaymentMode = '';

  // Sorting
  sortField = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  categories: string[] = [
    'Food', 'Transport', 'Entertainment', 'Shopping',
    'Bills', 'Healthcare', 'Education', 'Income', 'Other'
  ];

  expenseTypes = [
    { value: 'expense', label: 'Expense' },
    { value: 'income', label: 'Income' }
  ];

  paymentModes = [
    { value: 'Cash', label: '💵 Cash' },
    { value: 'UPI', label: '📱 UPI' },
    { value: 'Credit', label: '💳 Credit' }
  ];

  upiProviders: string[] = [
    'PhonePe', 'Paytm', 'GPay', 'BHIM', 'Amazon Pay'
  ];

  banks: string[] = [
    'ICICI Bank', 'HDFC Bank', 'SBI', 'Axis Bank', 'Kotak Bank',
    'AU Bank', 'Yes Bank', 'Punjab National Bank', 'Bank of Baroda'
  ];

  ngOnInit() {
    this.loadExpenses();
  }

  loadExpenses() {
    this.isLoading = true;
    this.expenseService.getAll().subscribe({
      next: (data) => {
        console.log('Expenses loaded:', data);
        this.expenses = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load expenses from backend', err);
        this.isLoading = false;
      }
    });
  }

  showAddExpenseForm(): void {
    this.editingExpense = null;
    this.resetForm();
    this.showAddForm = true;
  }

  editExpense(expense: Expense): void {
    this.editingExpense = { ...expense };
    this.formTitle = expense.title;
    this.formDescription = expense.description || '';
    this.formCategory = expense.category;
    this.formAmount = expense.amount;
    this.formType = expense.type;
    this.formDate = expense.date;
    this.formPaymentMode = expense.paymentMode || '';
    this.formUpiProvider = expense.upiProvider || '';
    this.formBank = expense.bank || '';
    this.showAddForm = true;
  }

  saveExpense(): void {
    if (!this.isFormValid()) {
      alert('Please fill all required fields');
      return;
    }

    const expenseData: Expense = {
      title: this.formTitle,
      description: this.formDescription,
      category: this.formCategory,
      amount: Number(this.formAmount || 0),
      type: this.formType as 'expense' | 'income',
      date: this.formDate || this.getTodayDate(),
      paymentMode: this.formPaymentMode,
      upiProvider: this.formPaymentMode === 'UPI' ? this.formUpiProvider : undefined,
      bank: (this.formPaymentMode === 'UPI' || this.formPaymentMode === 'Credit') ? this.formBank : undefined
    };

    // ✅ convert id to number if needed
    if (this.editingExpense && this.editingExpense.id !== undefined) {
      this.expenseService.update(Number(this.editingExpense.id), expenseData).subscribe({
        next: (updated) => {
          const idx = this.expenses.findIndex(e => e.id === this.editingExpense?.id);
          if (idx !== -1) {
            this.expenses[idx] = { ...updated } as Expense;
          }
          this.applyFilters();
          this.closeModal();
          alert('Expense updated successfully!');
        },
        error: (err) => {
          console.error(err);
          alert('Update failed');
        }
      });
    } else {
      this.expenseService.create(expenseData).subscribe({
        next: (created) => {
          this.expenses.unshift(created as Expense);
          this.applyFilters();
          this.closeModal();
          alert('Expense created successfully!');
        },
        error: (err) => {
          console.error(err);
          alert('Create failed');
        }
      });
    }
  }

  onPaymentModeChange(): void {
    // Reset conditional fields when payment mode changes
    if (this.formPaymentMode !== 'UPI') {
      this.formUpiProvider = '';
    }
    if (this.formPaymentMode !== 'UPI' && this.formPaymentMode !== 'Credit') {
      this.formBank = '';
    }
  }

  confirmDeleteExpense(expense: Expense): void {
    this.expenseToDelete = expense;
    this.showDeleteModal = true;
  }

  executeDelete(): void {
    if (!this.expenseToDelete?.id) return;
    this.isDeleting = true;

    // ✅ convert id to number before calling delete
    this.expenseService.delete(Number(this.expenseToDelete.id)).subscribe({
      next: () => {
        this.expenses = this.expenses.filter(e => e.id !== this.expenseToDelete?.id);
        this.applyFilters();
        this.cancelDelete();
        this.isDeleting = false;
        alert('Expense deleted successfully!');
      },
      error: (err) => {
        console.error(err);
        this.isDeleting = false;
        alert('Delete failed');
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.expenseToDelete = null;
    this.isDeleting = false;
  }

  closeModal(): void {
    this.showAddForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.formTitle = '';
    this.formDescription = '';
    this.formCategory = '';
    this.formAmount = null;
    this.formType = 'expense';
    this.formDate = '';
    this.formPaymentMode = '';
    this.formUpiProvider = '';
    this.formBank = '';
    this.editingExpense = null;
  }

  isFormValid(): boolean {
    let isValid = !!this.formTitle &&
           !!this.formCategory &&
           this.formAmount !== null &&
           this.formAmount > 0 &&
           !!this.formType &&
           !!this.formPaymentMode;

    // Additional validation for UPI payments
    if (this.formPaymentMode === 'UPI') {
      isValid = isValid && !!this.formUpiProvider && !!this.formBank;
    }

    // Additional validation for Credit payments
    if (this.formPaymentMode === 'Credit') {
      isValid = isValid && !!this.formBank;
    }

    return isValid;
  }

  applyFilters(): void {
    this.filteredExpenses = this.expenses.filter(expense => {
      const categoryMatch = !this.selectedCategory || expense.category === this.selectedCategory;
      const typeMatch = !this.selectedType || expense.type === this.selectedType;
      const paymentModeMatch = !this.selectedPaymentMode || expense.paymentMode === this.selectedPaymentMode;
      return categoryMatch && typeMatch && paymentModeMatch;
    });

    this.sortExpenses();
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedType = '';
    this.selectedPaymentMode = '';
    this.applyFilters();
  }

  onSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortExpenses();
  }

  sortExpenses(): void {
    this.filteredExpenses.sort((a, b) => {
      let aValue: any = a[this.sortField as keyof Expense];
      let bValue: any = b[this.sortField as keyof Expense];

      if (this.sortField === 'amount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (this.sortField === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getSortClass(field: string): string {
    return this.sortField === field ? `sort-${this.sortDirection}` : '';
  }

  getSortIndicator(field: string): string {
    if (this.sortField !== field) return '↕️';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  exportToExcel(): void {
    this.isExporting = true;
    const headers = ['Title', 'Description', 'Category', 'Amount', 'Type', 'Payment Mode', 'UPI Provider', 'Bank', 'Date'];
    const csvData = this.expenses.map(expense => [
      expense.title,
      expense.description || '',
      expense.category,
      expense.amount,
      expense.type,
      expense.paymentMode || '',
      expense.upiProvider || '',
      expense.bank || '',
      this.formatDisplayDate(expense.date)
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    setTimeout(() => (this.isExporting = false), 1000);
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getTotalExpenses(): number {
    return this.expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
  }

  getTotalIncome(): number {
    return this.expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpenses();
  }

  formatNumber(value: number): string {
    return '₹' + value.toLocaleString('en-IN');
  }

  getExpenseAmountFormatted(amount: number | undefined): string {
    return (amount || 0).toLocaleString('en-IN');
  }

  formatDisplayDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN');
  }

  getPaymentModeDisplay(paymentMode: string | undefined): string {
    if (!paymentMode) return '';
    const mode = this.paymentModes.find(m => m.value === paymentMode);
    return mode ? mode.label : paymentMode;
  }
}