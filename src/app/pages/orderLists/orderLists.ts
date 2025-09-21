import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
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
  filterType: string = '';
  filterStatus: string = '';
  filterDateMode: 'none' | 'newest' | 'oldest' | 'range' = 'none';
  rangeDates: Date[] | undefined;

  private filterType$ = new BehaviorSubject<string>('');
  private filterStatus$ = new BehaviorSubject<string>('');
  private filterDateMode$ = new BehaviorSubject<'none' | 'newest' | 'oldest' | 'range'>('none');
  private dateFrom$ = new BehaviorSubject<string>('');
  private dateTo$ = new BehaviorSubject<string>('');
  private currentPage$ = new BehaviorSubject<number>(1);

  orders$: Observable<OrderRow[]>;
  filteredOrders$: Observable<OrderRow[]>;
  paginatedOrders$: Observable<OrderRow[]>;

  currentPage = 1;
  pageSize = 9;
  startIndex = 0;
  endIndex = 0;

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
    this.orders$ = this.dataService.getOrders().pipe(map((d: any) => d.orders as OrderRow[]));

    this.filteredOrders$ = combineLatest([
      this.orders$,
      this.filterType$,
      this.filterStatus$,
      this.filterDateMode$,
      this.dateFrom$,
      this.dateTo$
    ]).pipe(
      map(([orders, type, status, dateMode, from, to]) => {
        let result = [...orders];

        if (type) result = result.filter(o => o.type === type);
        if (status) result = result.filter(o => o.status === status);

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

  onFilterChange() {
    this.filterType$.next(this.filterType);
    this.filterStatus$.next(this.filterStatus);
    this.filterDateMode$.next(this.filterDateMode);
    this.currentPage$.next(1);
  }

  onDateRangeChange(range: Date[] | undefined) {
    if (range && range.length === 2) {
      this.dateFrom$.next(range[0].toISOString());
      this.dateTo$.next(range[1].toISOString());
    }
    this.currentPage$.next(1);
  }

  resetFilters() {
    this.filterType = '';
    this.filterStatus = '';
    this.filterDateMode = 'none';
    this.rangeDates = undefined;
    this.dateFrom$.next('');
    this.dateTo$.next('');
    this.onFilterChange();
  }

  nextPage() { this.currentPage$.next(this.currentPage + 1); }
  prevPage() { if (this.currentPage > 1) this.currentPage$.next(this.currentPage - 1); }

  statusClass(status: Status) { return status.toLowerCase().replace(' ', '-'); }
}
