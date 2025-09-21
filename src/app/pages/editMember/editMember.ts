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
  form!: FormGroup;
  uploadedPhotoUrl: string | null = null;
  memberId!: number;
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
    this.memberId = +this.route.snapshot.paramMap.get('id')!;
    this.teamService.getMemberById(this.memberId).subscribe((member) => {
      if (member) {
        this.uploadedPhotoUrl = member.photoUrl;
        this.form.patchValue(member);
      }
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
    const updated: Partial<TeamMember> = {
      ...this.form.value,
      photoUrl: this.uploadedPhotoUrl || this.form.value.photoUrl
    };
    this.teamService.updateMember(this.memberId, updated);
    this.messageService.add({
      severity: 'success',
      summary: 'Updated',
      detail: 'Member updated successfully'
    });
    setTimeout(() => this.router.navigate(['/team']), 1000);
  }

  cancel() {
    this.router.navigate(['/team']);
  }
}
