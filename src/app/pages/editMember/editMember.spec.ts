/**
 * Test Suite: EditMemberComponent
 *
 * This spec verifies:
 * - Component creation
 * - Loading member data on init
 * - Form validation (invalid when empty)
 * - Submitting a valid form triggers updateMember
 * - Cancel button navigates back to /team
 *
 * Uses:
 * - MockTeamService to avoid real HTTP requests
 * - MockRouter to prevent real navigation
 * - HttpClientTestingModule to satisfy HttpClient dependencies
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { EditMemberComponent } from './editMember';
import { TeamService, TeamMember } from '../../team.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Mock service for team operations
class MockTeamService {
  getMemberById(id: number) {
    return of({
      id,
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '123456789',
      role: 'Designer',
      gender: 'Female',
      photoUrl: 'mock.png'
    } as TeamMember);
  }
  updateMember(id: number, member: Partial<TeamMember>) {}
}

// Mock Router for navigation testing
class MockRouter {
  navigate(path: string[]) {}
}

describe('EditMemberComponent', () => {
  let component: EditMemberComponent;
  let fixture: ComponentFixture<EditMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EditMemberComponent,
        HttpClientTestingModule // ✅ needed for HttpClient
      ],
      providers: [
        MessageService,
        { provide: TeamService, useClass: MockTeamService },
        { provide: Router, useClass: MockRouter },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test 1: Component should be created successfully
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Member data should load on init from TeamService
  it('should load member data on init', () => {
    expect(component.form.value.firstName).toBe('Jane');
    expect(component.uploadedPhotoUrl).toBe('mock.png');
  });

  //Test 3: Form should be invalid when fields are empty
  it('form should be invalid when empty', () => {
    component.form.reset();
    expect(component.form.valid).toBeFalse();
  });

  //Test 4: updateMember should be called when form is valid and submitted
  it('should call updateMember on valid form submit', () => {
    const teamService = TestBed.inject(TeamService);
    spyOn(teamService, 'updateMember');

    component.form.setValue({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      phone: '123456789',
      role: 'Designer',
      gender: 'Female',
      photoUrl: 'mock.png'
    });

    component.onSubmit();
    expect(teamService.updateMember).toHaveBeenCalledWith(1, jasmine.any(Object));
  });

  // Test 5: cancel() should navigate back to /team
  it('should navigate back to /team on cancel', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    component.cancel();
    expect(router.navigate).toHaveBeenCalledWith(['/team']);
  });
});
