import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { ExpenseService } from '../../services/expense.service';

// Register Chart.js components
Chart.register(...registerables);

interface Expense {
  id?: number;
  amount: number;
  description: string;
  category: string;
  date: Date;
  isPending?: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
  budget?: number;
}

interface CategorySpending {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface GrowthCategory {
  name: string;
  growth: number;
}

interface LargestExpense {
  amount: number;
  category: string;
  description: string;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  selectedCategory: string = 'all';

  availableYears: number[] = [2023, 2024, 2025];
  availableMonths: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  totalExpenses: number = 0;
  currentMonthExpenses: number = 0;
  expenseChange: number = 0;
  monthlyChange: number = 0;
  pendingPaymentsCount: number = 0;

  categories: Category[] = [];
  topExpenses: Expense[] = [];
  categorySpending: CategorySpending[] = [];

  largestExpense: LargestExpense = { amount: 0, category: '', description: '' };
  fastestGrowingCategory: GrowthCategory = { name: 'None', growth: 0 };
  potentialSavings: number = 0;
  budgetStatus: string = 'On Track';
  isOverBudget: boolean = false;
  budgetRemaining: number = 0;

  @ViewChild('expenseBarChart', { static: false }) barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('expensePieChart', { static: false }) pieChartRef!: ElementRef<HTMLCanvasElement>;
  
  private barChart: Chart | null = null;
  private pieChart: Chart | null = null;
  private allExpenses: Expense[] = [];
  private expenseSub!: Subscription;

  private allCategories: Category[] = [
    { id: 'food', name: 'Food & Dining', color: '#FF6B6B' },
    { id: 'utilities', name: 'Utilities', color: '#4ECDC4' },
    { id: 'entertainment', name: 'Entertainment', color: '#45B7D1' },
    { id: 'transport', name: 'Transportation', color: '#FFA07A' },
    { id: 'shopping', name: 'Shopping', color: '#98D8C8' },
    { id: 'healthcare', name: 'Healthcare', color: '#F7DC6F' },
    { id: 'education', name: 'Education', color: '#BB8FCE' }
  ];

  constructor(private expenseService: ExpenseService) {}

  ngOnInit(): void {
    this.loadExpensesFromBackend();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.barChart?.destroy();
    this.pieChart?.destroy();
    this.expenseSub?.unsubscribe();
  }

  /** Load all expenses from backend **/
  private loadExpensesFromBackend(): void {
    this.expenseSub = this.expenseService.getAll().subscribe({
      next: (data) => {
        this.allExpenses = data.map(exp => ({
          ...exp,
          description: exp.description ?? '',
          date: new Date(exp.date)
        }));
        this.categories = this.allCategories;
        this.calculateStatistics();
        setTimeout(() => this.initializeCharts(), 300);
      },
      error: (err) => console.error('Failed to load expenses:', err)
    });
  }

  /** Filters **/
  onFilterChange(): void {
    this.calculateStatistics();
    this.updateCharts();
  }

  resetFilters(): void {
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
    this.selectedCategory = 'all';
    this.calculateStatistics();
    this.updateCharts();
  }

  getCurrentFilterDisplay(): string {
    const monthName = this.availableMonths[this.selectedMonth - 1];
    const categoryName = this.selectedCategory === 'all'
      ? 'All Categories'
      : this.getCategoryName(this.selectedCategory);
    return `${monthName} ${this.selectedYear} • ${categoryName}`;
  }

  /** ---- STATS CALCULATIONS ---- **/
  private calculateStatistics(): void {
    const filteredExpenses = this.getFilteredExpenses();
    this.calculateSummaryStats(filteredExpenses);
    this.calculateTopExpenses(filteredExpenses);
    this.calculateCategorySpending(filteredExpenses);
    this.calculateInsights(filteredExpenses);
  }

  private getFilteredExpenses(): Expense[] {
    return this.allExpenses.filter(exp => {
      const expDate = new Date(exp.date);
      return (
        expDate.getFullYear() === this.selectedYear &&
        expDate.getMonth() + 1 === this.selectedMonth &&
        (this.selectedCategory === 'all' || exp.category === this.selectedCategory)
      );
    });
  }

  private calculateSummaryStats(expenses: Expense[]): void {
    this.totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    this.currentMonthExpenses = this.totalExpenses;
    this.expenseChange = (Math.random() * 20 - 10);
    this.monthlyChange = (Math.random() * 30 - 15);
    this.pendingPaymentsCount = expenses.filter(e => e.isPending).length;
  }

  private calculateTopExpenses(expenses: Expense[]): void {
    this.topExpenses = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);
  }

  private calculateCategorySpending(expenses: Expense[]): void {
    const catMap = new Map<string, number>();
    this.categories.forEach(c => catMap.set(c.id, 0));
    expenses.forEach(exp => {
      const current = catMap.get(exp.category) || 0;
      catMap.set(exp.category, current + exp.amount);
    });
    const total = Array.from(catMap.values()).reduce((a, b) => a + b, 0);
    this.categorySpending = Array.from(catMap.entries())
      .map(([id, amount]) => {
        const cat = this.categories.find(c => c.id === id);
        const percent = total ? (amount / total) * 100 : 0;
        return { name: cat?.name || 'Unknown', amount, percentage: percent, color: cat?.color || '#CCC' };
      })
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }

  private calculateInsights(expenses: Expense[]): void {
    this.largestExpense = expenses.reduce(
      (max, e) => (e.amount > max.amount ? e : max),
      { amount: 0, category: '', description: '' } as LargestExpense
    );
    const randomCats = ['Food & Dining', 'Entertainment', 'Shopping', 'Transportation'];
    this.fastestGrowingCategory = {
      name: randomCats[Math.floor(Math.random() * randomCats.length)],
      growth: (Math.random() * 50 - 10)
    };
    this.potentialSavings = this.totalExpenses * 0.1;
    const monthlyBudget = 50000;
    this.budgetRemaining = monthlyBudget - this.totalExpenses;
    this.isOverBudget = this.budgetRemaining < 0;
    this.budgetStatus = this.isOverBudget ? 'Over Budget' : 'On Track';
  }

  /** ---- CHARTS ---- **/
  private initializeCharts(): void {
    this.createBarChart();
    this.createPieChart();
  }

  private createBarChart(): void {
    const ctx = this.barChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;
    this.barChart?.destroy();

    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const income = [65000, 72000, 68000, 75000];
    const expense = [this.currentMonthExpenses * 0.2, this.currentMonthExpenses * 0.3, this.currentMonthExpenses * 0.25, this.currentMonthExpenses * 0.25];

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: weeks,
        datasets: [
          { label: 'Income', data: income, backgroundColor: '#4ECDC4', borderRadius: 6 },
          { label: 'Expenses', data: expense, backgroundColor: '#FF6B6B', borderRadius: 6 }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  private createPieChart(): void {
    const ctx = this.pieChartRef?.nativeElement.getContext('2d');
    if (!ctx) return;
    this.pieChart?.destroy();

    const labels = this.categorySpending.map(c => c.name);
    const data = this.categorySpending.map(c => c.amount);
    const colors = this.categorySpending.map(c => c.color);

    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2 }] },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        cutout: '60%'
      }
    });
  }

  private updateCharts(): void {
    if (this.barChart) {
      const newExpenses = [this.currentMonthExpenses * 0.2, this.currentMonthExpenses * 0.3, this.currentMonthExpenses * 0.25, this.currentMonthExpenses * 0.25];
      this.barChart.data.datasets[1].data = newExpenses;
      this.barChart.update();
    }
    if (this.pieChart) {
      this.pieChart.data.labels = this.categorySpending.map(c => c.name);
      this.pieChart.data.datasets[0].data = this.categorySpending.map(c => c.amount);
      this.pieChart.data.datasets[0].backgroundColor = this.categorySpending.map(c => c.color);
      this.pieChart.update();
    }
  }

  /** UTILITIES **/
  getCategoryName(id: string): string {
    return this.categories.find(c => c.id === id)?.name || 'Unknown';
  }

  formatNumber(value: number): string {
    if (value >= 100000) return (value / 100000).toFixed(1) + 'L';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toLocaleString('en-IN');
  }
}
