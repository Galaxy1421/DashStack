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
  constructor(public teamService: TeamService, private messageService: MessageService) {}

  deleteMember(id: number) {
    if (confirm("Are you sure you want to delete this member?")) {
      this.teamService.deleteMember(id);
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Member deleted successfully' });
    }
  }
}
