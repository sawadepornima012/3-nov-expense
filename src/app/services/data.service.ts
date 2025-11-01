// data.service.ts
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private expenses: any[] = [];
  private payments: any[] = [];
  private dataUpdated = new Subject<void>();
  dataUpdated$ = this.dataUpdated.asObservable();

  constructor() {
    this.loadFromLocalStorage();
  }

  // Expenses methods
  getExpenses(): any[] {
    return this.expenses;
  }

  addExpense(expense: any): void {
    const newExpense = {
      ...expense,
      id: this.generateId(),
      date: expense.date || new Date().toISOString().split('T')[0],
      status: 'paid'
    };
    this.expenses.push(newExpense);
    this.saveToLocalStorage();
    this.dataUpdated.next();
  }

  updateExpense(id: string, expense: any): void {
    const index = this.expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      this.expenses[index] = { ...this.expenses[index], ...expense };
      this.saveToLocalStorage();
      this.dataUpdated.next();
    }
  }

  deleteExpense(id: string): void {
    this.expenses = this.expenses.filter(e => e.id !== id);
    this.saveToLocalStorage();
    this.dataUpdated.next();
  }

  // Payments methods
  getPayments(): any[] {
    return this.payments;
  }

  addPayment(payment: any): void {
    const newPayment = {
      ...payment,
      id: this.generateId(),
      date: payment.date || new Date().toISOString()
    };
    this.payments.push(newPayment);
    this.saveToLocalStorage();
    this.dataUpdated.next();
  }

  updatePayment(id: string, payment: any): void {
    const index = this.payments.findIndex(p => p.id === id);
    if (index !== -1) {
      this.payments[index] = { ...this.payments[index], ...payment };
      this.saveToLocalStorage();
      this.dataUpdated.next();
    }
  }

  deletePayment(id: string): void {
    this.payments = this.payments.filter(p => p.id !== id);
    this.saveToLocalStorage();
    this.dataUpdated.next();
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('expenses', JSON.stringify(this.expenses));
    localStorage.setItem('payments', JSON.stringify(this.payments));
  }

  private loadFromLocalStorage(): void {
    const savedExpenses = localStorage.getItem('expenses');
    const savedPayments = localStorage.getItem('payments');
    
    this.expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
    this.payments = savedPayments ? JSON.parse(savedPayments) : [];
  }

  // Clear all data
  clearAllData(): void {
    this.expenses = [];
    this.payments = [];
    localStorage.removeItem('expenses');
    localStorage.removeItem('payments');
    this.dataUpdated.next();
  }
}