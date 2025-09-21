// NOTE: This service centralizes data fetching for the app.
// It uses Angular's HttpClient to retrieve local JSON assets and a demo API.
// No business logic is performed here—only HTTP calls. Keep it stateless.
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// @Injectable with providedIn: 'root' makes a singleton service
// available app-wide without having to manually add it to a providers array.
@Injectable({ providedIn: 'root' })

// DataService: add any new data endpoints here to avoid scattering HTTP calls around the codebase.
export class DataService {

  // DI: Angular will inject the HttpClient instance here.
  constructor(private http: HttpClient) {}

  // Fetch dashboard widgets/statistics from a local JSON file under assets/.
  // Returns: Observable<any> that emits the parsed JSON once the HTTP GET completes.
  // Note: consider creating a Dashboard interface to replace 'any' for better type safety.
  getDashboardData(): Observable<any> {
    return this.http.get('/assets/dashboard.json');
  }

  // Fetch orders list from a local JSON fixture.
  // Tip: For production, wire this to a real endpoint and add pagination params as needed.
  getOrders(): Observable<any> {
    return this.http.get('/assets/orderLists.json');
  }

  // Fetch team members data from assets.
  // Returning 'any' keeps it flexible, but defining a TeamMember interface will improve DX.
  getTeam():Observable<any>{
    return this.http.get('/assets/team.json');
  }

  // Demo endpoint: pulls products from the public dummyjson API.
  // Param: 'limit' controls how many items to fetch (default 30).
  // Consider adding error handling (e.g., catchError) and mapping the response to a typed model.
  getProducts(limit: number = 30): Observable<any> {
    return this.http.get(`https://dummyjson.com/products?limit=${limit}`);
  }

}
