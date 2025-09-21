/**
 * AddMemberComponent
 * -------------------
 * This component provides a form for adding a new team member.
 * 
 * Features:
 * - Reactive form with validation (firstName, lastName, email, phone, role, gender, photo)
 * - Preview uploaded photo or placeholder if none selected
 * - Uses PrimeNG components (Button, InputText, Select, FileUpload, Toast)
 * - On successful submit, adds member via TeamService and navigates back to /team
 * - Cancel button returns to team list without saving
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { Router } from '@angular/router';
import { TeamService } from '../../team.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-add-member',
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
  templateUrl: './addMember.html',
  styleUrls: ['./addMember.scss']
})
export class AddMemberComponent {
  // Reactive form group
  form: FormGroup;

  // Holds the uploaded photo preview URL
  uploadedPhotoUrl: string | null = null;

  // Dropdown options for gender select
  genders = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' }
  ];

  constructor(
    private fb: FormBuilder,
    private teamService: TeamService,
    private router: Router,
    private messageService: MessageService
  ) {
    // Initialize the reactive form with validators
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

  /**
   * Handle file selection event from p-fileUpload
   * - Reads the file as DataURL for image preview
   */
  onPhotoSelect(event: any) {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => (this.uploadedPhotoUrl = e.target.result);
      reader.readAsDataURL(file);
    }
  }

  /**
   * Dummy upload handler
   * - Auto-upload is disabled, so this only logs a message
   */
  onPhotoUpload(event: any) {
    console.log('⚠️ Ignored auto-upload');
  }

  /**
   * Submit the form
   * - Validates input
   * - Adds new member using TeamService
   * - Shows toast notification
   * - Redirects back to /team after success
   */
  onSubmit() {
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill all fields'
      });
      return;
    }

    // Build new member object with either uploaded or generated photo
    const newMember = {
      ...this.form.value,
      photoUrl: this.uploadedPhotoUrl || `https://i.pravatar.cc/100?u=${Date.now()}`
    };

    // Call service to add member
    this.teamService.addMember(newMember as any);

    // Success message
    this.messageService.add({
      severity: 'success',
      summary: 'Added',
      detail: 'Member added successfully'
    });

    // Navigate to /team after short delay
    setTimeout(() => this.router.navigate(['/team']), 1000);
  }

  /**
   * Cancel and go back to team page
   */
  cancel() {
    this.router.navigate(['/team']);
  }
}
