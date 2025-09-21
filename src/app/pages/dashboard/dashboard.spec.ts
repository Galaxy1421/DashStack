/**
 * Test Suite: DashboardComponent
 *
 * This spec verifies:
 * - Component creation
 * - Rendering of page title
 * - Rendering of stat cards (using mock dashboard data)
 * - calcTrend calculation
 * - updateChart behavior with selected month
 * - Rendering of deals table rows (using mock deals data)
 *
 * Notes:
 * - MockHttpClient simulates the dashboard.json request with fixed data.
 * - MockDataService simulates product data for generating deals.
 * - provideNoopAnimations is used to disable Angular animations in tests.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../data.service';

// Mock HttpClient to return fake dashboard.json data
class MockHttpClient {
  get() {
    return of({
      totalUsers: 120,
      totalOrders: 80,
      totalSales: 5000,
      totalPending: 10,
      previousTotals: { totalUsers: 100, totalOrders: 60, totalSales: 4000, totalPending: 5 },
      metrics: {
        conversionRate: 12,
        avgOrderValue: 150,
        returnRate: 7,
        nps: 70,
        topChannel: { name: 'Online', sales: 600 }
      },
      previousMetrics: {
        conversionRate: 10,
        avgOrderValue: 120,
        returnRate: 6,
        nps: 60,
        topChannel: { name: 'Online', sales: 500 }
      },
      salesHistory: [
        { month: 'January', days: 3, baseSales: 100, dailySales: [] },
        { month: 'February', days: 2, baseSales: 150, dailySales: [] }
      ]
    });
  }
}

// Mock DataService to return fake products for deals
class MockDataService {
  getProducts() {
    return of({
      products: [
        { title: 'Test Product A', price: 100, thumbnail: 'imgA.png' },
        { title: 'Test Product B', price: 200, thumbnail: 'imgB.png' },
        { title: 'Test Product C', price: 300, thumbnail: 'imgC.png' }
      ]
    });
  }
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideNoopAnimations(),
        { provide: HttpClient, useClass: MockHttpClient },
        { provide: DataService, useClass: MockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test 1: Component should be created successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Page title "Dashboard" should be rendered
  it('should render page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.page-title')?.textContent).toContain('Dashboard');
  });

  // Test 3: Stat cards should render using mock dashboard data
  it('should render stat cards', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const cards = fixture.debugElement.queryAll(By.css('.stat-card'));
    expect(cards.length).toBeGreaterThan(0);
  });

  // Test 4: calcTrend should calculate the correct percentage
  it('calcTrend should work correctly', () => {
    const result = (component as any).calcTrend(200, 100);
    expect(result).toBe(100);
  });

  // Test 5: updateChart should create a Chart instance when a month is selected
  it('should update chart when a month is selected', () => {
    component.salesData = [
      {
        month: 'January',
        days: 2,
        baseSales: 100,
        dailySales: [
          { day: 1, sales: 120, growth: 20 },
          { day: 2, sales: 130, growth: 25 }
        ]
      }
    ];
    component.selectedMonth = 'January';

    const canvas = document.createElement('canvas');
    canvas.id = 'salesChart';
    document.body.appendChild(canvas);

    component.updateChart();

    expect((component as any).chart).toBeDefined();

    document.body.removeChild(canvas);
  });

  // Test 6: Deals table should render rows based on mock product data
  it('should render deals table rows', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.deals-table tbody tr'));
    expect(rows.length).toBeGreaterThan(0);
  });
});
