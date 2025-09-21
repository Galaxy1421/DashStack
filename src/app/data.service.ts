import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Service: DataService
 *
 * Purpose:
 * - Centralized data provider for the application.
 * - Handles HTTP requests to both local JSON assets and external APIs.
 *
 * Key Responsibilities:
 * - Fetch dashboard statistics (from local JSON file).
 * - Fetch order list data (from local JSON file).
 * - Fetch product list data (from external dummyjson API).
 *
 * Data Sources:
 * - Local: `assets/dashboard.json` → used for dashboard charts/metrics.
 * - Local: `assets/orderLists.json` → used for the orders table.
 * - Remote: `https://dummyjson.com/products` → mock product API with `limit` parameter.
 *
 * Usage:
 * - Inject this service into components (e.g., DashboardComponent, OrderListsComponent, FavoritesComponent).
 * - Subscribe to returned Observables to get data asynchronously.
 */
@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private http: HttpClient) {}

  /**
   * Fetch dashboard summary data
   * @returns Observable<any> → dashboard.json content
   */
  getDashboardData(): Observable<any> {
    return this.http.get('assets/dashboard.json');
  }

  /**
   * Fetch list of orders
   * @returns Observable<any> → orderLists.json content
   */
  getOrders(): Observable<any> {
    return this.http.get('assets/orderLists.json');
  }

  /**
   * Fetch products from external API (dummyjson.com)
   * @param limit number of products to fetch (default = 30)
   * @returns Observable<any> → products response object
   */
  getProducts(limit: number = 30): Observable<any> {
    return this.http.get(`https://dummyjson.com/products?limit=${limit}`);
  }
}
