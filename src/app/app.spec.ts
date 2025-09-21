import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { RouterTestingModule } from '@angular/router/testing';
import { DomSanitizer } from '@angular/platform-browser';

describe('App Component', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    const main = document.querySelector('main.content');
    if (main && document.body.contains(main)) {
      document.body.removeChild(main);
    }
  });

  it('ينشئ الكومبوننت', () => {
    expect(component).toBeTruthy();
  });

  it('toggleSidebar يفتح ويغلق في الموبايل', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(500);
    const prev = component.sidebarOpen();
    component.toggleSidebar();
    expect(component.sidebarOpen()).toBe(!prev);
  });

  it('toggleSidebar يعمل collapse في الديسكتوب', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(1200);
    const prev = component.sidebarCollapsed();
    component.toggleSidebar();
    expect(component.sidebarCollapsed()).toBe(!prev);
  });

  it('updateSuggestions يرجع نتائج للبحث', () => {
    const main = document.createElement('main');
    main.classList.add('content');
    const h2 = document.createElement('h2');
    h2.textContent = 'Dashboard Page';
    main.appendChild(h2);
    document.body.appendChild(main);

    component.searchQuery.set('Dash');
    component.updateSuggestions();

    expect(component.suggestions().length).toBeGreaterThan(0);
  });

  it('onSearch يعمل scroll للعنصر', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello World';
    spyOn(div, 'scrollIntoView');

    component.suggestions.set([{ text: 'Hello World', element: div }]);
    component.onSearch();

    expect(div.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
  });

  it('highlight يضيف <mark>', () => {
    component.searchQuery.set('test');
    const result = component.highlight('this is a test string') as any;
    const sanitized = TestBed.inject(DomSanitizer).sanitize(1, result);
    expect(sanitized).toContain('<mark>test</mark>');
  });

  it('highlight يرجع النص بدون تغيير إذا ما فيه كلمة مطابقة', () => {
    component.searchQuery.set('');
    const result = component.highlight('hello world') as any;
    expect(result).toBe('hello world');
  });
});
