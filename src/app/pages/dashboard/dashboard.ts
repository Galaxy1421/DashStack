/**
 * Component: DashboardComponent
 *
 * Purpose:
 * - Provides a high-level dashboard view of metrics, sales history, and recent deals.
 * - Displays statistical cards with trend calculations.
 * - Shows a dynamic line chart for sales growth.
 * - Renders a deals table with filtering by month.
 *
 * Key Features:
 * - Loads dashboard metrics from a static JSON (`assets/dashboard.json`).
 * - Dynamically generates daily sales data for each month.
 * - Uses Chart.js to render a responsive line chart for sales growth.
 * - Fetches product deals via DataService and enriches them with random metadata
 *   (status, location, date, pieces).
 * - Supports filtering deals by month (with a default "All Months" option).
 * - Provides animation for card rendering with Angular animations.
 *
 * Dependencies:
 * - Angular CommonModule, FormsModule
 * - HttpClientModule for fetching JSON
 * - Chart.js for rendering charts
 * - PrimeNG Select for dropdown filters
 * - RxJS for observables and data transformations
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Observable, map, BehaviorSubject, combineLatest } from 'rxjs';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Chart } from 'chart.js/auto';
import { SelectModule } from 'primeng/select';
import { DataService } from '../../data.service';

// Default chart styling
Chart.defaults.font.family = "'Nunito Sans', sans-serif";
Chart.defaults.font.size = 13;
Chart.defaults.color = '#133882ff';

// Interfaces for dashboard data
interface DailySale { day: number; sales: number; growth: number; }
interface SalesMonth { month: string; days: number; baseSales: number; dailySales: DailySale[]; }
interface Deal {
  product: string;
  location: string;
  date: string;
  amount: number;
  status: string;
  piece: number;
  image: string;
}
interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalSales: number;
  totalPending: number;
  previousTotals: any;
  metrics: any;
  previousMetrics: any;
  salesHistory: SalesMonth[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, SelectModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(150, [
            animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {
  // State for cards section
  cards$: Observable<any[]>;
  months: string[] = [];
  monthOptions: { label: string; value: string }[] = [];
  selectedMonth: string | null = null;
  salesData: SalesMonth[] = [];
  private chart?: Chart;

  // State for deals section
  deals$!: Observable<Deal[]>;
  selectedDealMonth: string | null = null;
  selectedDealMonth$ = new BehaviorSubject<string | null>(null);
  dealMonthOptions: { label: string; value: string | null }[] = [];

  constructor(private http: HttpClient, private dataService: DataService) {
    // Load dashboard JSON and transform into card data + sales + deals
    this.cards$ = this.http.get<DashboardData>('assets/dashboard.json').pipe(
      map(d => {
        // Prepare sales data (add synthetic daily sales variation)
        this.salesData = d.salesHistory.map(m => ({
          ...m,
          dailySales: this.generateDailySales(m.baseSales, m.days)
        }));
        this.months = this.salesData.map(s => s.month);
        this.monthOptions = this.months.map(m => ({ label: m, value: m }));

        if (this.months.length > 0) {
          this.selectedMonth = this.months[0];

          setTimeout(() => {
            this.renderChartIfDataAvailable();
          });
        } else {
          this.selectedMonth = null;
        }

        // Load deals from DataService and decorate with fake details
        const allDeals$ = this.dataService.getProducts(48).pipe(
          map((res: any) =>
            res.products.map((p: any, i: number) => {
              const piece = Math.floor(Math.random() * 450) + 50;
              const status = ['Delivered', 'Pending', 'Shipped'][Math.floor(Math.random() * 3)];
              const location = [
                'New York, USA','London, UK','Berlin, DE','Tokyo, JP','Dubai, UAE',
                'Paris, FR','Toronto, CA','Sydney, AU','Riyadh, KSA','Rome, IT'
              ][Math.floor(Math.random() * 10)];
              const month = (i % 12) + 1;
              const day = Math.floor(Math.random() * 28) + 1;
              const hour = Math.floor(Math.random() * 23);
              const min = Math.floor(Math.random() * 59);

              return {
                product: p.title,
                location,
                date: `${day.toString().padStart(2,'0')}.${month.toString().padStart(2,'0')}.2019 - ${hour}:${min.toString().padStart(2,'0')}`,
                amount: piece * p.price,
                status,
                piece,
                image: p.thumbnail
              } as Deal;
            })
          )
        );

        // Combine deals with selected month filter
        this.deals$ = combineLatest([allDeals$, this.selectedDealMonth$]).pipe(
          map(([deals, selectedMonth]) => {
            // Initialize dropdown month options once
            if (this.dealMonthOptions.length === 0) {
              const monthNums: number[] = Array.from(
                new Set<number>(deals.map((d: Deal) => parseInt(d.date.split('.')[1], 10)))
              ).sort((a, b) => a - b);

              this.dealMonthOptions = [
                { label: 'All Months', value: null },
                ...monthNums.map((m: number) => {
                  const monthName = new Date(2000, m - 1).toLocaleString('en-US', { month: 'long' });
                  return { label: monthName, value: monthName };
                })
              ];
            }

            // Apply filtering
            if (!selectedMonth) return deals;
            return deals.filter((d: Deal) => {
              const monthNum = parseInt(d.date.split('.')[1], 10);
              const monthName = new Date(2000, monthNum - 1).toLocaleString('en-US', { month: 'long' });
              return monthName === selectedMonth;
            });
          })
        );

        // Transform into cards data (users, orders, sales, etc.)
        return [
          { title: 'Users', subtitle: 'Total Users', value: d.totalUsers.toLocaleString(), icon: 'pi pi-users', tint: 'tint-blue', trend: this.calcTrend(d.totalUsers, d.previousTotals.totalUsers), baseline: 'last month' },
          { title: 'Orders', subtitle: 'Total Orders', value: d.totalOrders.toLocaleString(), icon: 'pi pi-shopping-bag', tint: 'tint-green', trend: this.calcTrend(d.totalOrders, d.previousTotals.totalOrders), baseline: 'last month' },
          { title: 'Sales', subtitle: 'Total Sales', value: '$' + d.totalSales.toLocaleString(), icon: 'pi pi-dollar', tint: 'tint-amber', trend: this.calcTrend(d.totalSales, d.previousTotals.totalSales), baseline: 'last month' },
          { title: 'Pending', subtitle: 'Total Pending Orders', value: d.totalPending.toLocaleString(), icon: 'pi pi-clock', tint: 'tint-pink', trend: this.calcTrend(d.totalPending, d.previousTotals.totalPending), baseline: 'last month' },
          { title: 'Conversion', subtitle: 'Conversion Rate', value: d.metrics.conversionRate + '%', icon: 'pi pi-chart-line', tint: 'tint-blue', trend: this.calcTrend(d.metrics.conversionRate, d.previousMetrics.conversionRate), baseline: 'last month' },
          { title: 'Avg Order', subtitle: 'Average Order Value', value: '$' + d.metrics.avgOrderValue, icon: 'pi pi-wallet', tint: 'tint-green', trend: this.calcTrend(d.metrics.avgOrderValue, d.previousMetrics.avgOrderValue), baseline: 'last month' },
          { title: 'Returns', subtitle: 'Return Rate', value: d.metrics.returnRate + '%', icon: 'pi pi-refresh', tint: 'tint-amber', trend: this.calcTrend(d.metrics.returnRate, d.previousMetrics.returnRate), baseline: 'last month' },
          { title: 'NPS', subtitle: 'Net Promoter Score', value: d.metrics.nps.toString(), icon: 'pi pi-star', tint: 'tint-pink', trend: this.calcTrend(d.metrics.nps, d.previousMetrics.nps), baseline: 'last survey' },
          { title: 'Top', subtitle: 'Top Channel', value: d.metrics.topChannel.name, icon: 'pi pi-sitemap', tint: 'tint-blue', trend: this.calcTrend(d.metrics.topChannel.sales, d.previousMetrics.topChannel.sales), baseline: 'last month' }
        ];
      })
    );
  }

  ngOnInit() {}

  // Generate synthetic daily sales data with sinusoidal + random variation
  generateDailySales(base: number, days: number): DailySale[] {
    return Array.from({ length: days }, (_, i) => {
      const cycle = (Math.sin((i / days) * 2 * Math.PI) + 1) / 2;
      const growth = Math.round(cycle * 100 + (Math.random() * 10 - 5));
      const sales = base + Math.floor(growth * 30) + (Math.random() * 500 - 250);
      return { day: i + 1, sales: Math.max(0, sales), growth: Math.min(100, Math.max(0, growth)) };
    });
  }

  // Render sales chart for selected month using Chart.js
  updateChart() {
    if (!this.selectedMonth) return;
    const monthData = this.salesData.find(s => s.month === this.selectedMonth);
    if (!monthData || !monthData.dailySales?.length) return;

    const el = document.getElementById('salesChart') as HTMLCanvasElement;
    if (!el) return;
    if (this.chart) this.chart.destroy();

    const ctx = el.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, el.height);
    gradient.addColorStop(0, 'rgba(37, 100, 235, 0.42)');
    gradient.addColorStop(0.5, 'rgba(37, 100, 235, 0.1)');
    gradient.addColorStop(1, 'rgba(37, 100, 235, 0.03)');

    this.chart = new Chart(el, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Growth %',
          data: monthData.dailySales.map(d => ({
            x: d.day,
            y: d.growth,
            sales: d.sales
          })),
          borderColor: '#2050b9ff',
          backgroundColor: gradient,
          fill: true,
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#1643a5ff',
          clip: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            bodyFont: { size: window.innerWidth < 640 ? 10 : 12 },
            callbacks: {
              label: (ctx) => {
                const raw: any = ctx.raw;
                return `Sales: ${Math.round(raw.sales).toLocaleString()} | Growth: ${raw.y.toFixed(0)}%`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            min: 1,
            title: { display: true, text: 'Days', color: '#133882ff', font: { size: window.innerWidth < 640 ? 10 : 12, weight: 600 } },
            ticks: { stepSize: 3, font: { size: window.innerWidth < 640 ? 9 : 12 } },
            grid: { display: false }
          },
          y: {
            min: 0,
            max: 100,
            title: { display: true, text: 'Growth %', color: '#133882ff', font: { size: window.innerWidth < 640 ? 10 : 12, weight: 600 } },
            ticks: { stepSize: 20, font: { size: window.innerWidth < 640 ? 9 : 12 }, callback: v => v + '%' },
            grid: { display: true }
          }
        }
      }
    });
  }

  // Calculate percentage trend compared to previous value
  private calcTrend(curr: number, prev: number): number {
    return ((curr - prev) / prev) * 100;
  }

  private renderChartIfDataAvailable() {
    if (!this.selectedMonth) return;

    const monthData = this.salesData.find(s => s.month === this.selectedMonth);
    if (!monthData || !monthData.dailySales?.length) return;

    this.updateChart();
  }
}
