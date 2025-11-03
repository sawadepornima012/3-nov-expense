import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { Router } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';

@Component({
  selector: 'app-dashboard-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.scss']
})
export class DashboardContentComponent implements OnInit, AfterViewInit, OnDestroy {
  private expenseBarChart: Chart | null = null;
  private expensePieChart: Chart | null = null;
  private chartsInitialized = false;

  // Filters
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;

  availableYears: number[] = [2023, 2024, 2025];
  availableMonths: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Dashboard stats
  totalIncome = 0;
  totalExpenses = 0;
  netBalance = 0;
  categories: string[] = [];

  // Expense list
  allExpenses: Expense[] = [];
  filteredExpenses: Expense[] = [];

  constructor(private router: Router, private expenseService: ExpenseService) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (!user) {
      this.router.navigate(['/login']);
    }

    this.loadExpenses();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
    }, 300);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  /** 🔹 Load all expenses from backend */
  loadExpenses(): void {
    this.expenseService.getAll().subscribe({
      next: (data) => {
        this.allExpenses = data;
        this.applyFilter();
      },
      error: (err) => console.error('Error loading expenses:', err)
    });
  }

  /** 🔹 Filter data based on selected month/year */
  applyFilter(): void {
    this.filteredExpenses = this.allExpenses.filter((exp) => {
      const date = new Date(exp.date);
      return (
        date.getFullYear() === this.selectedYear &&
        date.getMonth() + 1 === this.selectedMonth
      );
    });

    this.calculateSummaryData();
    this.refreshCharts();
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  resetFilters(): void {
    const current = new Date();
    this.selectedYear = current.getFullYear();
    this.selectedMonth = current.getMonth() + 1;
    this.applyFilter();
  }

  getCurrentFilterDisplay(): string {
    const monthName = this.availableMonths[this.selectedMonth - 1];
    return `${monthName} ${this.selectedYear}`;
  }

  /** 🔹 Calculate totals */
  calculateSummaryData(): void {
    const incomeItems = this.filteredExpenses.filter(e => e.type === 'income');
    const expenseItems = this.filteredExpenses.filter(e => e.type === 'expense');

    this.totalIncome = incomeItems.reduce((sum, e) => sum + e.amount, 0);
    this.totalExpenses = expenseItems.reduce((sum, e) => sum + e.amount, 0);
    this.netBalance = this.totalIncome - this.totalExpenses;

    // Unique categories for active month
    this.categories = [...new Set(this.filteredExpenses.map(e => e.category))];
  }

  getExpensesCount(): number {
    return this.filteredExpenses.length;
  }

  /** 🔹 Chart initialization */
  initCharts(): void {
    if (this.chartsInitialized) return;

    this.destroyCharts();
    this.initExpenseBarChart();
    this.initExpensePieChart();
    this.chartsInitialized = true;
  }

  /** 🔹 Bar Chart: Income vs Expense (monthly trend) */
  initExpenseBarChart(): void {
    const canvas = document.getElementById('expenseBarChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Group expenses by month
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpenses = Array(12).fill(0);

    this.allExpenses.forEach(exp => {
      const d = new Date(exp.date);
      const month = d.getMonth();
      if (exp.type === 'income') monthlyIncome[month] += exp.amount;
      if (exp.type === 'expense') monthlyExpenses[month] += exp.amount;
    });

    this.expenseBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.availableMonths.map(m => m.substring(0, 3)),
        datasets: [
          {
            label: 'Income',
            data: monthlyIncome,
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Expenses',
            data: monthlyExpenses,
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
label: (context) => {
  const value = context.parsed?.y ?? 0;
  return `${context.dataset.label}: ₹${value.toLocaleString()}`;
}
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { callback: (value) => '₹' + value.toLocaleString() }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  /** 🔹 Pie Chart: Expense by category */
  initExpensePieChart(): void {
    const canvas = document.getElementById('expensePieChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const categoryTotals: { [key: string]: number } = {};
    this.filteredExpenses
      .filter(e => e.type === 'expense')
      .forEach(exp => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    this.expensePieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: [
            'rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)',
            'rgba(245,158,11,0.8)', 'rgba(139,92,246,0.8)',
            'rgba(236,72,153,0.8)', 'rgba(20,184,166,0.8)',
            'rgba(249,115,22,0.8)', 'rgba(52,211,153,0.8)'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = amounts.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  destroyCharts(): void {
    if (this.expenseBarChart) {
      this.expenseBarChart.destroy();
      this.expenseBarChart = null;
    }
    if (this.expensePieChart) {
      this.expensePieChart.destroy();
      this.expensePieChart = null;
    }
    this.chartsInitialized = false;
  }

  refreshCharts(): void {
    this.destroyCharts();
    setTimeout(() => this.initCharts(), 200);
  }

  formatNumber(value: number, format: string = '1.2-2'): string {
    if (format === '1.2-2') return value.toFixed(2);
    return value.toString();
  }
}
