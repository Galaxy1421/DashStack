
/**
 * EditMemberComponent
 * -------------------
 * This component is responsible for editing an existing team member.
 * 
 * Features:
 * - Pre-fills the form with data retrieved from TeamService using the route parameter (id).
 * - Allows updating personal details, role, gender, and profile photo.
 * - Provides form validation (all fields required, email format enforced).
 * - Displays a live preview of the uploaded profile picture.
 * - Shows toast notifications for validation warnings and successful updates.
 * - Redirects back to the team page after a successful update.
 * 
 * Dependencies:
 * - Angular Reactive Forms for form handling and validation.
 * - PrimeNG components for UI (buttons, inputs, select, file upload, toast).
 * - TeamService for fetching and updating member data.
 * - Router/ActivatedRoute for navigation and route parameter access.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService, TeamMember } from '../../team.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-edit-member',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    FileUploadModule,
    ToastModule
  ],
  templateUrl: './editMember.html',
  styleUrls: ['./editMember.scss']
})
export class EditMemberComponent implements OnInit {
  form!: FormGroup;                       // Reactive form for editing member data
  uploadedPhotoUrl: string | null = null; // Stores preview of uploaded photo
  memberId!: number;                      // Current member ID from route
  genders = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' }
  ];

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {
    // Initialize the form with validators
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role: ['', Validators.required],
      gender: ['', Validators.required],
      photoUrl: ['']
    });
  }

  ngOnInit() {
    // Get member ID from route and load data from TeamService
    this.memberId = +this.route.snapshot.paramMap.get('id')!;
    this.teamService.getMemberById(this.memberId).subscribe((member) => {
      if (member) {
        this.uploadedPhotoUrl = member.photoUrl; // Show current photo
        this.form.patchValue(member);            // Populate form with existing data
      }
    });
  }

  // Handle photo selection and update preview
  onPhotoSelect(event: any) {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => (this.uploadedPhotoUrl = e.target.result);
      reader.readAsDataURL(file);
    }
  }

  // Ignore PrimeNG auto-upload behavior (handled manually)
  onPhotoUpload(event: any) {
    console.log('⚠️ Ignored auto-upload');
  }

  // Submit updated member details
  onSubmit() {
    if (this.form.invalid) {
      // Show warning if form is invalid
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill all fields'
      });
      return;
    }

    // Merge updated values with existing data
    const updated: Partial<TeamMember> = {
      ...this.form.value,
      photoUrl: this.uploadedPhotoUrl || this.form.value.photoUrl
    };

    // Update member in TeamService
    this.teamService.updateMember(this.memberId, updated);

    // Show success notification
    this.messageService.add({
      severity: 'success',
      summary: 'Updated',
      detail: 'Member updated successfully'
    });

    // Redirect back to team page after a short delay
    setTimeout(() => this.router.navigate(['/team']), 1000);
  }

  // Cancel edit and navigate back to team page
  cancel() {
    this.router.navigate(['/team']);
  }
}
