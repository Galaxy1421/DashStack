import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

/**
 * Service: TeamService
 *
 * Purpose:
 * - Manage team members state and synchronize with backend API.
 * - Provide reactive `team$` observable for components to subscribe to.
 * - Encapsulate CRUD operations (create, read, update, delete) for team data.
 *
 * Key Features:
 * - Uses `BehaviorSubject` to store and stream the latest team data.
 * - Automatically reloads team data after every mutation (add, update, delete).
 * - Provides a method to fetch a specific member by ID.
 *
 * Data Flow:
 * - Backend API (http://localhost:4000/api/team) is the single source of truth.
 * - Team data is fetched and stored in `teamSubject`.
 * - Components (e.g., TeamComponent) subscribe to `team$` for auto-updates.
 */
export interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  gender: string;
  photoUrl: string;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  private apiUrl = 'http://localhost:4000/api/team';

  // BehaviorSubject holds the current state of the team and emits updates to subscribers
  private teamSubject = new BehaviorSubject<TeamMember[]>([]);
  team$ = this.teamSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load team immediately when service is created
    this.loadTeam();
  }

  /**
   * Fetch all team members from the backend API
   * and update the BehaviorSubject.
   */
  loadTeam() {
    this.http.get<TeamMember[]>(this.apiUrl).subscribe({
      next: (data) => {
        console.log('✅ Team loaded successfully:', data);
        this.teamSubject.next(data);
      },
      error: (err) => console.error('❌ Failed to load team:', err)
    });
  }

  /**
   * Add a new team member
   * @param member - TeamMember object
   */
  addMember(member: TeamMember) {
    this.http.post<TeamMember>(this.apiUrl, member).subscribe({
      next: (res) => {
        console.log('✅ Member added successfully:', res);
        this.loadTeam();
      },
      error: (err) => console.error('❌ Failed to add member:', err)
    });
  }

  /**
   * Update an existing team member by ID
   * @param id - ID of the member
   * @param updates - Partial<TeamMember> with fields to update
   */
  updateMember(id: number, updates: Partial<TeamMember>) {
    this.http.put<TeamMember>(`${this.apiUrl}/${id}`, updates).subscribe({
      next: (res) => {
        console.log(`✅ Member with ID ${id} updated successfully:`, res);
        this.loadTeam();
      },
      error: (err) => console.error(`❌ Failed to update member ${id}:`, err)
    });
  }

  /**
   * Delete a team member by ID
   * @param id - ID of the member
   */
  deleteMember(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        console.log(`✅ Member with ID ${id} deleted successfully`);
        this.loadTeam();
      },
      error: (err) => console.error(`❌ Failed to delete member ${id}:`, err)
    });
  }

  /**
   * Fetch a single team member by ID
   * @param id - ID of the member
   * @returns Observable<TeamMember>
   */
  getMemberById(id: number) {
    return this.http.get<TeamMember>(`${this.apiUrl}/${id}`);
  }
}
