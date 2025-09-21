/**
 * Test Suite: OrderListsComponent
 * 
 * This spec verifies:
 * - Component creation and page title
 * - Table headers rendering
 * - Filtering by type, status, and date range
 * - Sorting by newest/oldest
 * - Pagination and navigation between pages
 * - Resetting filters to default
 * - CSS class mapping for statuses
 * 
 * Uses MockDataService to provide consistent test data.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { OrderListsComponent } from './orderLists';
import { DataService } from '../../data.service';

// Mock DataService to provide static test data instead of real API calls
class MockDataService {
  getOrders() {
    return of({
      orders: [
        { id: '1', name: 'Order A', address: 'NY', date: '2024-05-01', type: 'Book',   status: 'Completed' },
        { id: '2', name: 'Order B', address: 'LA', date: '2024-01-01', type: 'Mobile', status: 'Processing' },
        { id: '3', name: 'Order C', address: 'TX', date: '2024-03-01', type: 'Book',   status: 'Rejected' },
        { id: '4', name: 'Order D', address: 'CA', date: '2024-02-15', type: 'Watch',  status: 'On Hold' },
        { id: '5', name: 'Order E', address: 'FL', date: '2024-04-10', type: 'Mobile', status: 'In Transit' }
      ]
    });
  }
}

describe('OrderListsComponent (full test suite)', () => {
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

  // Test 1: Ensure component is created successfully
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Ensure page title is rendered
  it('should display the page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.page-title')?.textContent).toContain('Order Lists');
  });

  // Test 3: Ensure table headers match expected labels
  it('should render table headers correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headers = Array.from(compiled.querySelectorAll('thead th')).map(el => el.textContent?.trim());
    expect(headers).toEqual(['ID', 'NAME', 'ADDRESS', 'DATE', 'TYPE', 'STATUS']);
  });

  // Test 4: Ensure filtering by type works (Book)
  it('should filter by type = Book', (done) => {
    component.filterType = 'Book';
    component.onFilterChange();
    component.filteredOrders$.subscribe((orders) => {
      expect(orders.length).toBe(2);
      expect(orders.every(o => o.type === 'Book')).toBeTrue();
      done();
    });
  });

  // Test 5: Ensure filtering by status works (Completed)
  it('should filter by status = Completed', (done) => {
    component.filterStatus = 'Completed';
    component.onFilterChange();
    component.filteredOrders$.subscribe((orders) => {
      expect(orders.length).toBe(1);
      expect(orders[0].status).toBe('Completed');
      done();
    });
  });

  // Test 6: Ensure sorting by newest date works
  it('should sort orders by newest date', (done) => {
    component.filterDateMode = 'newest';
    component.onFilterChange();
    component.filteredOrders$.subscribe((orders) => {
      const dates = orders.map(o => new Date(o.date).getTime());
      const sorted = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sorted);
      done();
    });
  });

  // Test 7: Ensure sorting by oldest date works
  it('should sort orders by oldest date', (done) => {
    component.filterDateMode = 'oldest';
    component.onFilterChange();
    component.filteredOrders$.subscribe((orders) => {
      const dates = orders.map(o => new Date(o.date).getTime());
      const sorted = [...dates].sort((a, b) => a - b);
      expect(dates).toEqual(sorted);
      done();
    });
  });

  // Test 8: Ensure pagination works (2 per page)
  it('should paginate results (2 items per page)', (done) => {
    component.pageSize = 2;
    component.onFilterChange();
    component.paginatedOrders$.subscribe((orders) => {
      expect(orders.length).toBe(2);
      done();
    });
  });

  // Test 9: Ensure page navigation works (next/prev)
  it('should move between pages (next/prev)', () => {
    component.pageSize = 2;
    component.onFilterChange();
    component.nextPage();
    expect(component.currentPage).toBe(2);
    component.prevPage();
    expect(component.currentPage).toBe(1);
  });

  // Test 10: Ensure resetFilters resets all filters to defaults
  it('should reset filters to default values', () => {
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

  // Test 11: Ensure statusClass returns correct CSS class
  it('should return correct CSS class for status', () => {
    expect(component.statusClass('Completed')).toBe('completed');
    expect(component.statusClass('On Hold')).toBe('on-hold');
    expect(component.statusClass('In Transit')).toBe('in-transit');
  });

  // Test 12: Ensure filtering by date range works correctly
  it('should filter orders by date range', (done) => {
    const from = new Date('2024-02-01');
    const to = new Date('2024-03-15');

    component.filterDateMode = 'range';
    component.onDateRangeChange([from, to]);
    component.onFilterChange();

    component.filteredOrders$.subscribe((orders) => {
      const ids = orders.map(o => o.id);
      expect(ids).toContain('3'); // Order C
      expect(ids).toContain('4'); // Order D
      expect(orders.length).toBe(2);
      done();
    });
  });
});