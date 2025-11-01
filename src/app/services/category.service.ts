import { Injectable } from '@angular/core';

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories: Category[] = [
    { id: '1', name: 'Food & Dining', type: 'expense', color: '#007bff' },
    { id: '2', name: 'Transportation', type: 'expense', color: '#28a745' },
    { id: '3', name: 'Utilities', type: 'expense', color: '#dc3545' },
    { id: '4', name: 'Entertainment', type: 'expense', color: '#ffc107' },
    { id: '5', name: 'Shopping', type: 'expense', color: '#17a2b8' },
    { id: '6', name: 'Healthcare', type: 'expense', color: '#6f42c1' },
    { id: '7', name: 'Salary', type: 'income', color: '#20c997' }
  ];

  getCategories(): Category[] {
    return this.categories;
  }

  getExpenseCategories(): Category[] {
    return this.categories.filter(category => category.type === 'expense');
  }

  getIncomeCategories(): Category[] {
    return this.categories.filter(category => category.type === 'income');
  }

  addCategory(category: Omit<Category, 'id'>): void {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString()
    };
    this.categories.push(newCategory);
  }

  getCategoryByName(name: string): Category | undefined {
    return this.categories.find(category => category.name === name);
  }
}