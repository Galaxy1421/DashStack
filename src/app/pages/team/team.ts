/**
 * TeamComponent
 * 
 * Purpose:
 * - Display the list of team members (teamService.team$)
 * - Provide buttons for adding, editing, and deleting a member
 * - Handle member deletion with a confirmation dialog
 * - Show a toast notification upon successful deletion
 * 
 * Key Points:
 * - Uses TeamService as the centralized data source
 * - Implemented as a standalone Angular component
 * - Integrates PrimeNG UI modules (Button, Toast) and Angular Router
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { TeamService } from '../../team.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-team',
  standalone: true,
  providers: [MessageService],
  imports: [CommonModule, ButtonModule, RouterModule, ToastModule],
  templateUrl: './team.html',
  styleUrls: ['./team.scss']
})
export class TeamComponent {
  // Inject TeamService to access team data
  // Inject MessageService to display toast notifications
  constructor(public teamService: TeamService, private messageService: MessageService) {}

  /**
   * Delete a team member
   * - Displays a confirmation dialog
   * - If confirmed: calls service.deleteMember
   * - Shows a success toast notification
   */
  deleteMember(id: number) {
    if (confirm("Are you sure you want to delete this member?")) {
      this.teamService.deleteMember(id);
      this.messageService.add({
        severity: 'success',
        summary: 'Deleted',
        detail: 'Member deleted successfully'
      });
    }
  }
}
