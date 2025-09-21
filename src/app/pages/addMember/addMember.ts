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
  form: FormGroup;
  uploadedPhotoUrl: string | null = null;
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

  onPhotoSelect(event: any) {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => (this.uploadedPhotoUrl = e.target.result);
      reader.readAsDataURL(file);
    }
  }

  onPhotoUpload(event: any) {
    console.log('⚠️ Ignored auto-upload');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill all fields'
      });
      return;
    }
    const newMember = {
      ...this.form.value,
      photoUrl: this.uploadedPhotoUrl || `https://i.pravatar.cc/100?u=${Date.now()}`
    };
    this.teamService.addMember(newMember as any);
    this.messageService.add({
      severity: 'success',
      summary: 'Added',
      detail: 'Member added successfully'
    });
    setTimeout(() => this.router.navigate(['/team']), 1000);
  }

  cancel() {
    this.router.navigate(['/team']);
  }
}
