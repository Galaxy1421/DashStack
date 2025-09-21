/**
 * Test Suite: TeamComponent
 * 
 * This spec verifies:
 * - Component creation
 * - Rendering of team member cards
 * - Existence of header, Add button, Edit/Delete buttons
 * - Member count display in the header
 * - Delete member workflow (with confirm/without confirm)
 * 
 * Uses fake data (BehaviorSubject) to simulate TeamService members.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamComponent } from './team';
import { TeamService, TeamMember } from '../../team.service';
import { MessageService } from 'primeng/api';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

describe('TeamComponent (with TeamService + fake data)', () => {
  let component: TeamComponent;
  let fixture: ComponentFixture<TeamComponent>;
  let teamService: TeamService;
  let teamSubject: BehaviorSubject<TeamMember[]>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TeamComponent,
        RouterTestingModule,
        HttpClientTestingModule // Required if TeamService uses HttpClient
      ],
      providers: [
        TeamService,        // Real TeamService (we will feed it with fake data)
        MessageService,
        provideNoopAnimations() // Disable animations for stable tests
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamComponent);
    component = fixture.componentInstance;
    teamService = TestBed.inject(TeamService);

    // 👇 Feed the team$ observable with fake members (instead of API calls)
    teamSubject = new BehaviorSubject<TeamMember[]>([
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123456789',
        role: 'Developer',
        gender: 'male',
        photoUrl: 'john.png'
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '987654321',
        role: 'Designer',
        gender: 'female',
        photoUrl: 'jane.png'
      }
    ]);
    (teamService as any).team$ = teamSubject.asObservable();

    fixture.detectChanges(); // Trigger Angular change detection after loading fake data
  });

  // Test 1: Ensure component is created successfully
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Ensure member count is displayed correctly in header
  it('should display member count in the header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headerText = compiled.querySelector('.header h2')?.textContent || '';
    expect(headerText).toContain('(2)');
  });

  // Test 3: Ensure team member cards are rendered
  it('should render team member cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.team-card');
    expect(cards.length).toBe(2);
  });

  // Test 4: Ensure "Add Now" button is present
  it('should have an "Add Now" button', () => {
    const btn = fixture.debugElement.query(By.css('.p-button-info')).nativeElement;
    expect(btn.textContent).toContain('Add Now');
  });

  // Test 5: Ensure Edit buttons exist for each member
  it('should have Edit buttons for each member', () => {
    const editButtons = fixture.debugElement.queryAll(By.css('.edit-btn'));
    expect(editButtons.length).toBe(2);
  });

  // Test 6: Ensure Delete buttons exist for each member
  it('should have Delete buttons for each member', () => {
    const deleteButtons = fixture.debugElement.queryAll(By.css('.delete-btn'));
    expect(deleteButtons.length).toBe(2);
  });

  // Test 7: Ensure deleteMember is called when user confirms
  it('should call deleteMember on service when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true); // simulate confirm = OK
    const spyDelete = spyOn(teamService, 'deleteMember').and.callThrough();

    component.deleteMember(1);

    expect(spyDelete).toHaveBeenCalledWith(1);
  });

  // Test 8: Ensure deleteMember is not called when user cancels
  it('should NOT call deleteMember on service when canceled', () => {
    spyOn(window, 'confirm').and.returnValue(false); // simulate confirm = Cancel
    const spyDelete = spyOn(teamService, 'deleteMember').and.callThrough();

    component.deleteMember(1);

    expect(spyDelete).not.toHaveBeenCalled();
  });
});
