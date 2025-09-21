/**
 * Test Suite: AppComponent
 * 
 * This spec verifies:
 * - Component creation
 * - Sidebar toggle behavior (mobile vs desktop)
 * - Search functionality (updateSuggestions, onSearch)
 * - Highlighting matched text with <mark>
 * 
 * It focuses on ensuring the main app shell works as expected.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { App } from './app';
import { RouterTestingModule } from '@angular/router/testing';
import { DomSanitizer } from '@angular/platform-browser';

describe('App Component', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    // Setup: configure the testing module with the App component
    // and include RouterTestingModule for router-related functionality
    await TestBed.configureTestingModule({
      imports: [App, RouterTestingModule],
    }).compileComponents();

    // Create the component fixture (test environment wrapper for the component)
    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;

    // Trigger initial change detection so bindings and lifecycle hooks run
    fixture.detectChanges();
  });

  afterEach(() => {
    // Cleanup: if <main class="content"> was manually added to document.body
    // in a test, remove it to avoid interference with other tests
    const main = document.querySelector('main.content');
    if (main?.parentNode === document.body) {
      document.body.removeChild(main);
    }
  });

  // Test 1: Ensure component instance is created
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Ensure sidebar opens/closes in mobile view
  it('toggleSidebar should open/close the sidebar in mobile view', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(500);
    const prev = component.sidebarOpen();
    component.toggleSidebar();
    expect(component.sidebarOpen()).toBe(!prev);
  });

  // Test 3: Ensure sidebar collapses/expands in desktop view
  it('toggleSidebar should collapse/expand the sidebar in desktop view', () => {
    spyOnProperty(window, 'innerWidth').and.returnValue(1200);
    const prev = component.sidebarCollapsed();
    component.toggleSidebar();
    expect(component.sidebarCollapsed()).toBe(!prev);
  });

  // Test 4: Ensure onSearch scrolls the matched element into view
  it('onSearch should scroll the matched element into view', () => {
    const div = document.createElement('div');
    div.textContent = 'Hello World';
    spyOn(div, 'scrollIntoView');

    component.suggestions.set([{ text: 'Hello World', element: div }]);
    component.onSearch();

    expect(div.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
  });

  // Test 5: Ensure highlight wraps matching query with <mark>
  it('highlight should wrap matching query with <mark> tag', () => {
    component.searchQuery.set('test');
    const result = component.highlight('this is a test string') as any;
    const sanitized = TestBed.inject(DomSanitizer).sanitize(1, result);
    expect(sanitized).toContain('<mark>test</mark>');
  });

  // Test 6: Ensure highlight leaves text unchanged when no query matches
  it('highlight should return text unchanged when no query matches', () => {
    component.searchQuery.set('');
    const result = component.highlight('hello world') as any;
    expect(result).toBe('hello world');
  });
});
