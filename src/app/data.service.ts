import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<any> {
    return this.http.get('assets/dashboard.json');
  }

  getOrders(): Observable<any> {
    return this.http.get('assets/orderLists.json');
  }


getProducts(limit: number = 30): Observable<any> {
  return this.http.get(`https://dummyjson.com/products?limit=${limit}`);
}


}
