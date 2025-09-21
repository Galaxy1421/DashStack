/**
 * Test Suite: AddMemberComponent
 *
 * Verifies:
 * - Component creation
 * - Form validation (invalid when empty)
 * - Submitting a valid form triggers addMember
 * - Cancel button navigates back to /team
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AddMemberComponent } from './addMember';
import { TeamService, TeamMember } from '../../team.service';

// Mock TeamService
class MockTeamService {
  addMember(member: TeamMember) {}
}

// Mock Router
class MockRouter {
  navigate(path: string[]) {}
}

describe('AddMemberComponent', () => {
  let component: AddMemberComponent;
  let fixture: ComponentFixture<AddMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMemberComponent, HttpClientTestingModule],
      providers: [
        MessageService,
        { provide: TeamService, useClass: MockTeamService },
        { provide: Router, useClass: MockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test 1: Component should be created successfully
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Form should be invalid when empty
  it('form should be invalid when empty', () => {
    component.form.reset();
    expect(component.form.valid).toBeFalse();
  });

  // Test 3: addMember should be called when form is valid and submitted
  it('should call addMember on valid form submit', () => {
    const teamService = TestBed.inject(TeamService);
    spyOn(teamService, 'addMember');

    component.form.setValue({
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      phone: '987654321',
      role: 'Developer',
      gender: 'Male',
      photoUrl: 'mock.png'
    });

    component.onSubmit();
    expect(teamService.addMember).toHaveBeenCalledWith(jasmine.any(Object));
  });

  // Test 4: cancel() should navigate back to /team
  it('should navigate back to /team on cancel', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    component.cancel();
    expect(router.navigate).toHaveBeenCalledWith(['/team']);
  });
});
