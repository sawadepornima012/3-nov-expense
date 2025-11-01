import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { ExpenseService } from '../../services/expense.service';
import { Subscription } from 'rxjs';

// Register Chart.js components
Chart.register(...registerables);

// Interfaces
interface Expense {
  id?: number;        // <-- Make id optional
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
  // Filter properties
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  selectedCategory: string = 'all';
  
  // Available options
  availableYears: number[] = [2023, 2024, 2025];
  availableMonths: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Summary statistics
  totalExpenses: number = 0;
  currentMonthExpenses: number = 0;
  expenseChange: number = 0;
  monthlyChange: number = 0;
  pendingPaymentsCount: number = 0;

  // Categories and data
  categories: Category[] = [];
  topExpenses: Expense[] = [];
  categorySpending: CategorySpending[] = [];

  // Insights data
  largestExpense: LargestExpense = { amount: 0, category: '', description: '' };
  fastestGrowingCategory: GrowthCategory = { name: 'None', growth: 0 };
  potentialSavings: number = 0;
  budgetStatus: string = 'On Track';
  isOverBudget: boolean = false;
  budgetRemaining: number = 0;

  // Chart references
  @ViewChild('expenseBarChart', { static: false }) barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('expensePieChart', { static: false }) pieChartRef!: ElementRef<HTMLCanvasElement>;
  
  private barChart: Chart | null = null;
  private pieChart: Chart | null = null;

  private allExpenses: Expense[] = [];
  private expenseSub!: Subscription;

  // Predefined categories
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

  ngAfterViewInit(): void {
    // Chart will be initialized after data loads
  }

  ngOnDestroy(): void {
    if (this.barChart) this.barChart.destroy();
    if (this.pieChart) this.pieChart.destroy();
    if (this.expenseSub) this.expenseSub.unsubscribe();
  }

  /** Load data from backend **/
  private loadExpensesFromBackend(): void {
    this.expenseSub = this.expenseService.getAll().subscribe({
      next: (data) => {
       this.allExpenses = data.map(exp => ({
  ...exp,
  description: exp.description ?? '', // ensure it's always a string
  date: new Date(exp.date) // if it's string, convert to Date for charts
}));

        this.categories = this.allCategories;
        this.calculateStatistics();
        setTimeout(() => this.initializeCharts(), 200);
      },
      error: (err) => {
        console.error('Failed to load expenses:', err);
      }
    });
  }

  // Filter change handler
  onFilterChange(): void {
    this.calculateStatistics();
    this.updateCharts();
  }

  // Reset all filters
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

  /** CALCULATION LOGIC **/
  private calculateStatistics(): void {
    const filteredExpenses = this.getFilteredExpenses();
    this.calculateSummaryStats(filteredExpenses);
    this.calculateTopExpenses(filteredExpenses);
    this.calculateCategorySpending(filteredExpenses);
    this.calculateInsights(filteredExpenses);
  }

  private getFilteredExpenses(): Expense[] {
    return this.allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const yearMatch = expenseDate.getFullYear() === this.selectedYear;
      const monthMatch = expenseDate.getMonth() + 1 === this.selectedMonth;
      const categoryMatch = this.selectedCategory === 'all' || expense.category === this.selectedCategory;
      return yearMatch && monthMatch && categoryMatch;
    });
  }

  private calculateSummaryStats(expenses: Expense[]): void {
    this.totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    this.currentMonthExpenses = this.totalExpenses;
    this.expenseChange = (Math.random() * 20 - 10);
    this.monthlyChange = (Math.random() * 30 - 15);
    this.pendingPaymentsCount = expenses.filter(e => e.isPending).length;
  }

  private calculateTopExpenses(expenses: Expense[]): void {
    this.topExpenses = expenses.sort((a, b) => b.amount - a.amount).slice(0, 5);
  }

  private calculateCategorySpending(expenses: Expense[]): void {
    const categoryMap = new Map<string, number>();
    this.categories.forEach(cat => categoryMap.set(cat.id, 0));
    expenses.forEach(exp => {
      const current = categoryMap.get(exp.category) || 0;
      categoryMap.set(exp.category, current + exp.amount);
    });
    const total = Array.from(categoryMap.values()).reduce((s, a) => s + a, 0);
    this.categorySpending = Array.from(categoryMap.entries())
      .map(([id, amount]) => {
        const cat = this.categories.find(c => c.id === id);
        const percentage = total > 0 ? (amount / total) * 100 : 0;
        return {
          name: cat?.name || 'Unknown',
          amount,
          percentage,
          color: cat?.color || '#CCC'
        };
      })
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }

  private calculateInsights(expenses: Expense[]): void {
    const largest = expenses.reduce((max, e) => e.amount > max.amount ? e : max, { amount: 0, category: '', description: '' } as LargestExpense);
    this.largestExpense = largest;
    const cats = ['Food & Dining', 'Entertainment', 'Shopping', 'Transportation'];
    this.fastestGrowingCategory = {
      name: cats[Math.floor(Math.random() * cats.length)],
      growth: (Math.random() * 50 - 10)
    };
    this.potentialSavings = this.totalExpenses * 0.1;
    const monthlyBudget = 50000;
    this.budgetRemaining = monthlyBudget - this.totalExpenses;
    this.isOverBudget = this.budgetRemaining < 0;
    this.budgetStatus = this.isOverBudget ? 'Over Budget' : 'On Track';
  }

  /** CHART LOGIC **/
  private initializeCharts(): void {
    this.createBarChart();
    this.createPieChart();
  }

  private createBarChart(): void {
    if (!this.barChartRef?.nativeElement) return;
    const ctx = this.barChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.barChart) this.barChart.destroy();

    const months = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const incomeData = [65000, 72000, 68000, 75000];
    const expenseData = [this.currentMonthExpenses * 0.2, this.currentMonthExpenses * 0.3, this.currentMonthExpenses * 0.25, this.currentMonthExpenses * 0.25];

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'Income', data: incomeData, backgroundColor: '#48BB78', borderColor: '#48BB78', borderWidth: 1, borderRadius: 4, barPercentage: 0.6 },
          { label: 'Expenses', data: expenseData, backgroundColor: '#F56565', borderColor: '#F56565', borderWidth: 1, borderRadius: 4, barPercentage: 0.6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' }, tooltip: { mode: 'index', intersect: false } },
        scales: { y: { beginAtZero: true } },
        interaction: { mode: 'index', intersect: false }
      }
    });
  }

  private createPieChart(): void {
    if (!this.pieChartRef?.nativeElement) return;
    const ctx = this.pieChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.pieChart) this.pieChart.destroy();

    const labels = this.categorySpending.map(i => i.name);
    const data = this.categorySpending.map(i => i.amount);
    const colors = this.categorySpending.map(i => i.color);

    this.pieChart = new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2, borderColor: '#fff', hoverOffset: 8 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percent = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${label}: ₹${this.formatNumber(value ?? 0)} (${percent}%)`;
              }
            }
          }
        },
        cutout: '65%',
        animation: { animateScale: true, animateRotate: true }
      }
    });
  }

  private updateCharts(): void {
    if (this.barChart) {
      const expenseData = [this.currentMonthExpenses * 0.2, this.currentMonthExpenses * 0.3, this.currentMonthExpenses * 0.25, this.currentMonthExpenses * 0.25];
      this.barChart.data.datasets[1].data = expenseData;
      this.barChart.update('none');
    }
    if (this.pieChart && this.categorySpending.length > 0) {
      const labels = this.categorySpending.map(i => i.name);
      const data = this.categorySpending.map(i => i.amount);
      const colors = this.categorySpending.map(i => i.color);
      this.pieChart.data.labels = labels;
      this.pieChart.data.datasets[0].data = data;
      this.pieChart.data.datasets[0].backgroundColor = colors;
      this.pieChart.update('none');
    }
  }

  /** UTILITIES **/
  getCategoryName(id: string): string {
    return this.categories.find(c => c.id === id)?.name || 'Unknown';
  }

  getCategoryColor(id: string): string {
    return this.categories.find(c => c.id === id)?.color || '#CCC';
  }

  formatNumber(value: number): string {
    if (!value && value !== 0) return '0';
    if (value >= 100000) return (value / 100000).toFixed(1) + 'L';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toLocaleString('en-IN');
  }

  formatDisplayDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }
}
