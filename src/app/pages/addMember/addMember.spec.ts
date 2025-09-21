import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { EditMemberComponent } from '../editMember/editMember';
import { AddMemberComponent } from './addMember';
import { TeamService } from '../../team.service';
import { of } from 'rxjs';

class MockTeamService {
  getMemberById(id: number) { return of({ id, firstName: 'Jane' }); }
  updateMember(id: number, member: any) {}
  addMember(member: any) {}
}

class MockRouter {
  navigate(path: string[]) {}
}

describe('EditMemberComponent', () => {
  let fixture: ComponentFixture<EditMemberComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMemberComponent, HttpClientTestingModule],
      providers: [
        MessageService,
        { provide: TeamService, useClass: MockTeamService },
        { provide: Router, useClass: MockRouter }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(EditMemberComponent);
  });
  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});

describe('AddMemberComponent', () => {
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
  });
  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
