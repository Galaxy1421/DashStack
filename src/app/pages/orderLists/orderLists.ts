/**
 * Component: OrderListsComponent
 *
 * Purpose:
 * - Display a dynamic list of orders with filters and pagination.
 * - Allow filtering by type, status, and date (newest, oldest, or custom range).
 * - Provide pagination and reset functionality.
 * - Assign badge classes for statuses dynamically.
 *
 * Key Features:
 * - Reactive filters: BehaviorSubjects + combineLatest ensure real-time updates.
 * - Sorting by date modes: newest, oldest, or range-based.
 * - Pagination handled reactively with page state.
 * - Clean reset method to restore default filters.
 *
 * Data Flow:
 * - orders$ → raw orders from DataService
 * - filteredOrders$ → after applying filters/sorting
 * - paginatedOrders$ → slice of filtered data based on current page
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable, startWith } from 'rxjs';
import { DataService } from '../../data.service';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';

type Status = 'Completed' | 'Processing' | 'Rejected' | 'On Hold' | 'In Transit';

interface OrderRow {
  id: string;
  name: string;
  address: string;
  date: string;
  type: string;
  status: Status;
}

@Component({
  selector: 'app-order-lists',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerModule, SelectModule],
  templateUrl: './orderLists.html',
  styleUrls: ['./orderLists.scss']
})
export class OrderListsComponent {
  // === UI filter states ===
  filterType: string = '';
  filterStatus: string = '';
  filterDateMode: 'none' | 'newest' | 'oldest' | 'range' = 'none';
  rangeDates: Date[] | undefined;

  // === Internal reactive streams for filters ===
  private filterType$ = new BehaviorSubject<string>('');
  private filterStatus$ = new BehaviorSubject<string>('');
  private filterDateMode$ = new BehaviorSubject<'none' | 'newest' | 'oldest' | 'range'>('none');
  private dateFrom$ = new BehaviorSubject<string>('');
  private dateTo$ = new BehaviorSubject<string>('');
  private currentPage$ = new BehaviorSubject<number>(1);

  // === Orders data streams ===
  orders$: Observable<OrderRow[]>;
  filteredOrders$: Observable<OrderRow[]>;
  paginatedOrders$: Observable<OrderRow[]>;

  // === Pagination state ===
  currentPage = 1;
  pageSize = 9;
  startIndex = 0;
  endIndex = 0;

  // === Filter options for UI dropdowns ===
  dateModeOptions = [
    { label: 'Newest → Oldest', value: 'newest' },
    { label: 'Oldest → Newest', value: 'oldest' },
    { label: 'Range', value: 'range' }
  ];

  typeOptions = [
    { label: 'Book', value: 'Book' },
    { label: 'Medicine', value: 'Medicine' },
    { label: 'Electric', value: 'Electric' },
    { label: 'Mobile', value: 'Mobile' },
    { label: 'Watch', value: 'Watch' }
  ];

  statusOptions = [
    { label: 'Completed', value: 'Completed' },
    { label: 'Processing', value: 'Processing' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'On Hold', value: 'On Hold' },
    { label: 'In Transit', value: 'In Transit' }
  ];

  constructor(private dataService: DataService) {
    // Load initial orders (fallback to [] in case of null)
    this.orders$ = this.dataService.getOrders().pipe(
      map((d: any) => d?.orders as OrderRow[] || []),
      startWith([]) 
    );

    // Combine all filter streams + orders stream to produce filtered results
    this.filteredOrders$ = combineLatest([
      this.orders$,
      this.filterType$,
      this.filterStatus$,
      this.filterDateMode$,
      this.dateFrom$,
      this.dateTo$
    ]).pipe(
      map(([orders, type, status, dateMode, from, to]) => {
        let result = orders ?? [];

        // Filter by type
        if (type) result = result.filter(o => o.type === type);

        // Filter by status
        if (status) result = result.filter(o => o.status === status);

        // Sort or filter by date depending on mode
        if (dateMode === 'newest') {
          result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else if (dateMode === 'oldest') {
          result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } else if (dateMode === 'range' && from && to) {
          const fromDate = new Date(from).getTime();
          const toDate = new Date(to).getTime();
          result = result.filter(o => {
            const d = new Date(o.date).getTime();
            return d >= fromDate && d <= toDate;
          });
        }

        return result;
      })
    );

    // Pagination logic: slice the filtered results based on currentPage
    this.paginatedOrders$ = combineLatest([
      this.filteredOrders$,
      this.currentPage$
    ]).pipe(
      map(([orders, page]) => {
        this.currentPage = page;
        this.startIndex = (page - 1) * this.pageSize;
        this.endIndex = Math.min(this.startIndex + this.pageSize, orders.length);
        return orders.slice(this.startIndex, this.endIndex);
      })
    );
  }

  /** Triggered when filter values change */
  onFilterChange() {
    this.filterType$.next(this.filterType);
    this.filterStatus$.next(this.filterStatus);
    this.filterDateMode$.next(this.filterDateMode);
    this.currentPage$.next(1);
  }

  /** Update date range filter and reset to first page */
  onDateRangeChange(range: Date[] | undefined) {
    if (range && range.length === 2) {
      this.dateFrom$.next(range[0].toISOString());
      this.dateTo$.next(range[1].toISOString());
    }
    this.currentPage$.next(1);
  }

  /** Reset all filters to defaults */
  resetFilters() {
    this.filterType = '';
    this.filterStatus = '';
    this.filterDateMode = 'none';
    this.rangeDates = undefined;
    this.dateFrom$.next('');
    this.dateTo$.next('');
    this.onFilterChange();
  }

  /** Pagination: go to next page */
  nextPage() { this.currentPage$.next(this.currentPage + 1); }

  /** Pagination: go to previous page */
  prevPage() { if (this.currentPage > 1) this.currentPage$.next(this.currentPage - 1); }

  /** Return CSS class name for order status badge */
  statusClass(status: Status | undefined) {
    return status ? status.toLowerCase().replace(' ', '-') : '';
  }
}
