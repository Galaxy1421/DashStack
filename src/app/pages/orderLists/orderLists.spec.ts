import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { OrderListsComponent } from './orderLists';
import { DataService } from '../../data.service';

class MockDataService {
  getOrders() {
    return of({
      orders: [
        { id: '1', name: 'Order A', address: 'NY', date: '2024-05-01', type: 'Book', status: 'Completed' },
        { id: '2', name: 'Order B', address: 'LA', date: '2024-01-01', type: 'Mobile', status: 'Processing' },
        { id: '3', name: 'Order C', address: 'TX', date: '2024-03-01', type: 'Book', status: 'Rejected' },
        { id: '4', name: 'Order D', address: 'CA', date: '2024-02-15', type: 'Watch', status: 'On Hold' },
        { id: '5', name: 'Order E', address: 'FL', date: '2024-04-10', type: 'Mobile', status: 'In Transit' }
      ]
    });
  }
}

describe('OrderListsComponent (شامل)', () => {
  let component: OrderListsComponent;
  let fixture: ComponentFixture<OrderListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderListsComponent, HttpClientTestingModule],
      providers: [{ provide: DataService, useClass: MockDataService }]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ينشئ الكومبوننت', () => {
    expect(component).toBeTruthy();
  });

  it('يعرض العنوان', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.page-title')?.textContent).toContain('Order Lists');
  });

  it('يعرض الأعمدة بشكل صحيح', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headers = Array.from(compiled.querySelectorAll('thead th')).map(el => el.textContent?.trim());
    expect(headers).toEqual(['ID', 'NAME', 'ADDRESS', 'DATE', 'TYPE', 'STATUS']);
  });

  it('يعمل فلترة حسب النوع (Book)', (done) => {
    component.filterType = 'Book';
    component.onFilterChange();
    component.filteredOrders$.subscribe((orders) => {
      expect(orders.length).toBe(2);
      expect(orders.every(o => o.type === 'Book')).toBeTrue();
      done();
    });
  });

  it('يعمل فلترة حسب الحالة (Completed)', (done) => {
    component.filterStatus = 'Completed';
    component.onFilterChange();
    component.filteredOrders$.subscribe((orders) => {
      expect(orders.length).toBe(1);
      expect(orders[0].status).toBe('Completed');
      done();
    });
  });

  it('يرتب حسب التاريخ (newest)', (done) => {
    component.filterDateMode = 'newest';
    component.onFilterChange();
    component.filteredOrders$.subscribe((orders) => {
      const dates = orders.map(o => new Date(o.date).getTime());
      const sorted = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sorted);
      done();
    });
  });

  it('يرتب حسب التاريخ (oldest)', (done) => {
    component.filterDateMode = 'oldest';
    component.onFilterChange();
    component.filteredOrders$.subscribe((orders) => {
      const dates = orders.map(o => new Date(o.date).getTime());
      const sorted = [...dates].sort((a, b) => a - b);
      expect(dates).toEqual(sorted);
      done();
    });
  });

  it('يدعم الباجينيشن (2 عناصر لكل صفحة)', (done) => {
    component.pageSize = 2;
    component.onFilterChange();
    component.paginatedOrders$.subscribe((orders) => {
      expect(orders.length).toBe(2);
      done();
    });
  });

  it('يتنقل بين الصفحات (next/prev)', (done) => {
    component.pageSize = 2;
    component.onFilterChange();
    component.nextPage();
    expect(component.currentPage).toBe(2);
    component.prevPage();
    expect(component.currentPage).toBe(1);
    done();
  });

  it('يعيد resetFilters كل القيم للوضع الافتراضي', () => {
    component.filterType = 'Book';
    component.filterStatus = 'Completed';
    component.filterDateMode = 'newest';
    component.rangeDates = [new Date(), new Date()];
    component.resetFilters();
    expect(component.filterType).toBe('');
    expect(component.filterStatus).toBe('');
    expect(component.filterDateMode).toBe('none');
    expect(component.rangeDates).toBeUndefined();
  });

  it('statusClass يرجع الكلاس الصح', () => {
    expect(component.statusClass('Completed')).toBe('completed');
    expect(component.statusClass('On Hold')).toBe('on-hold');
    expect(component.statusClass('In Transit')).toBe('in-transit');
  });

  it('يعمل فلترة حسب النطاق الزمني (range)', (done) => {
  const from = new Date('2024-02-01');
  const to = new Date('2024-03-15');

  component.filterDateMode = 'range';
  component.onDateRangeChange([from, to]);  
  component.onFilterChange();

  component.filteredOrders$.subscribe((orders) => {
    const ids = orders.map(o => o.id);
    expect(ids).toContain('3');
    expect(ids).toContain('4');
    expect(orders.length).toBe(2);
    done();
  });
});

});


