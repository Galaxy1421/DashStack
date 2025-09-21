import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

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

  private teamSubject = new BehaviorSubject<TeamMember[]>([]);
  team$ = this.teamSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTeam();
  }

  loadTeam() {
    this.http.get<TeamMember[]>(this.apiUrl).subscribe({
      next: (data) => this.teamSubject.next(data),
      error: (err) => console.error('❌ Failed to load team:', err)
    });
  }

  addMember(member: TeamMember) {
    this.http.post<TeamMember>(this.apiUrl, member).subscribe({
      next: () => this.loadTeam(),
      error: (err) => console.error('❌ Failed to add member:', err)
    });
  }

  updateMember(id: number, updates: Partial<TeamMember>) {
    this.http.put<TeamMember>(`${this.apiUrl}/${id}`, updates).subscribe({
      next: () => this.loadTeam(),
      error: (err) => console.error('❌ Failed to update member:', err)
    });
  }

  deleteMember(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.loadTeam(),
      error: (err) => console.error('❌ Failed to delete member:', err)
    });
  }


  getMemberById(id: number) {
  return this.http.get<TeamMember>(`${this.apiUrl}/${id}`);
}

}
