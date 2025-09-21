import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { EditMemberComponent } from './editMember';
import { TeamService, TeamMember } from '../../team.service';

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

class MockRouter {
  navigate(path: string[]) {}
}

describe('EditMemberComponent', () => {
  let component: EditMemberComponent;
  let fixture: ComponentFixture<EditMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMemberComponent],
      providers: [
        MessageService,
        { provide: TeamService, useClass: MockTeamService },
        { provide: Router, useClass: MockRouter },
        { provide: 'ActivatedRoute', useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load member data on init', () => {
    expect(component.form.value.firstName).toBe('Jane');
    expect(component.uploadedPhotoUrl).toBe('mock.png');
  });

  it('form should be invalid when empty', () => {
    component.form.reset();
    expect(component.form.valid).toBeFalse();
  });

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
});
