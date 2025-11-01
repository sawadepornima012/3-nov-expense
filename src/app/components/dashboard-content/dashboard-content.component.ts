// src/app/components/dashboard-content/dashboard-content.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-content.component.html',
  styleUrls: ['./dashboard-content.component.scss']
})
export class DashboardContentComponent implements OnInit, AfterViewInit, OnDestroy {
  // Chart instances
  private expenseBarChart: Chart | null = null;
  private expensePieChart: Chart | null = null;
  private chartsInitialized = false;

  // Filter properties
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  
  // Sample data
  availableYears: number[] = [2023, 2024, 2025];
  availableMonths: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Summary data
  totalIncome: number = 75000;
  totalExpenses: number = 45000;
  netBalance: number = 30000;
  categories: any[] = [];

 
   
  

 
  constructor(private router: Router) {
     Chart.register(...registerables);
  }

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (!user) {
      this.router.navigate(['/login']);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  // Filter methods
  onFilterChange(): void {
    this.loadDashboardData();
    this.refreshCharts();
  }

  resetFilters(): void {
    const currentDate = new Date();
    this.selectedYear = currentDate.getFullYear();
    this.selectedMonth = currentDate.getMonth() + 1;
    this.onFilterChange();
  }

  getCurrentFilterDisplay(): string {
    const monthName = this.availableMonths[this.selectedMonth - 1];
    return `${monthName} ${this.selectedYear}`;
  }

  // Data loading methods
  loadDashboardData(): void {
    this.calculateSummaryData();
  }

  calculateSummaryData(): void {
    // Sample calculations
    this.totalIncome = 75000 + (Math.random() * 10000);
    this.totalExpenses = 45000 + (Math.random() * 5000);
    this.netBalance = this.totalIncome - this.totalExpenses;
  }

  getExpensesCount(): number {
    return 15;
  }

  // Chart methods
  initCharts(): void {
    if (this.chartsInitialized) {
      return;
    }

    this.destroyCharts();

    try {
      this.initExpenseBarChart();
      this.initExpensePieChart();
      this.chartsInitialized = true;
    } catch (error) {
      console.error('Error initializing charts:', error);
      setTimeout(() => this.initCharts(), 500);
    }
  }

  initExpenseBarChart(): void {
    const canvas = document.getElementById('expenseBarChart') as HTMLCanvasElement;
    
    if (!canvas) {
      console.warn('expenseBarChart canvas not found');
      return;
    }

    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context for expenseBarChart');
      return;
    }

    // Sample data for bar chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const expenseData = [12000, 19000, 15000, 25000, 22000, 30000];
    const incomeData = [20000, 25000, 22000, 30000, 28000, 35000];

    this.expenseBarChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Expenses',
            data: expenseData,
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
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                // FIXED: Added null check for context.parsed.y
                const value = context.parsed.y ?? 0;
                return `${context.dataset.label}: ₹${value.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₹' + value.toLocaleString();
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  initExpensePieChart(): void {
    const canvas = document.getElementById('expensePieChart') as HTMLCanvasElement;
    
    if (!canvas) {
      console.warn('expensePieChart canvas not found');
      return;
    }

    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context for expensePieChart');
      return;
    }

    // Sample data for pie chart
    const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare'];
    const amounts = [8000, 6000, 4000, 7000, 5000, 3000];
    const backgroundColors = [
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(245, 158, 11, 0.8)',   // Amber
      'rgba(139, 92, 246, 0.8)',   // Purple
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(20, 184, 166, 0.8)'    // Teal
    ];

    this.expensePieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: categories,
        datasets: [{
          data: amounts,
          backgroundColor: backgroundColors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed ?? 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '0%'
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
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  // Utility methods
  formatNumber(value: number, format: string = '1.2-2'): string {
    if (format === '1.2-2') {
      return value.toFixed(2);
    }
    return value.toString();
  }
}