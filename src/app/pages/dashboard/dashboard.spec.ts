import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DashboardComponent } from './dashboard';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.page-title')?.textContent).toContain('Dashboard');
  });

  it('should render stat cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('.stat-card'));
    expect(cards.length).toBeGreaterThan(0);
  });

  it('calcTrend should work correctly', () => {
    const result = (component as any).calcTrend(200, 100);
    expect(result).toBe(100);
  });

  it('should update chart when a month is selected', () => {
    component.salesData = [
      {
        month: 'January',
        days: 5,
        baseSales: 100,
        dailySales: [
          { day: 1, sales: 120, growth: 20 },
          { day: 2, sales: 130, growth: 25 }
        ]
      }
    ];
    component.selectedMonth = 'January';
    component.updateChart();
    expect((component as any).chart).toBeDefined();
  });

  it('should render deals table rows', async () => {
    const mockDeals = [
      {
        product: 'Test Product',
        location: 'NY',
        date: '01.01.2024',
        piece: 5,
        amount: 100,
        status: 'Pending',
        image: 'test.png'
      }
    ];
    component.deals$ = Promise.resolve(mockDeals) as any;
    fixture.detectChanges();

    await fixture.whenStable();
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('.deals-table tbody tr'));
    expect(rows.length).toBeGreaterThan(0);
  });
});
