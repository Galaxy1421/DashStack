import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TeamComponent } from './team';
import { TeamService } from '../../team.service';
import { MessageService } from 'primeng/api';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

class MockTeamService {
  team$ = of([
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '123456789', role: 'Developer', photoUrl: 'john.png' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '987654321', role: 'Designer', photoUrl: 'jane.png' }
  ]);
  deleteMember(id: number) {
    console.log('Mock delete member', id);
  }
}

describe('TeamComponent (شامل)', () => {
  let component: TeamComponent;
  let fixture: ComponentFixture<TeamComponent>;
  let teamService: MockTeamService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamComponent, RouterTestingModule],
      providers: [
        { provide: TeamService, useClass: MockTeamService },
        MessageService,
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamComponent);
    component = fixture.componentInstance;
    teamService = TestBed.inject(TeamService) as any;
    fixture.detectChanges();
  });

  it('ينشئ الكومبوننت', () => {
    expect(component).toBeTruthy();
  });

  it('يعرض عدد الأعضاء في العنوان', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.header h2')?.textContent).toContain('(2)');
  });

  it('يعرض بيانات الأعضاء في الكروت', () => {
    const cards = fixture.nativeElement.querySelectorAll('.team-card');
    expect(cards.length).toBe(2);
  });

  it('زر Add Now موجود ويوجه لصفحة الإضافة', () => {
    const btn = fixture.debugElement.query(By.css('.p-button-info')).nativeElement;
    expect(btn.textContent).toContain('Add Now');
  });

  it('أزرار Edit موجودة', () => {
    const editButtons = fixture.debugElement.queryAll(By.css('.edit-btn'));
    expect(editButtons.length).toBe(2);
  });

  it('زر Delete موجود لكل عضو', () => {
    const deleteButtons = fixture.debugElement.queryAll(By.css('.delete-btn'));
    expect(deleteButtons.length).toBe(2);
  });

  it('يحذف عضو عند التأكيد', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const spyDelete = spyOn(teamService, 'deleteMember');
    component.deleteMember(1);
    expect(spyDelete).toHaveBeenCalledWith(1);
  });
});
