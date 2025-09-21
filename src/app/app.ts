// Root Angular component (standalone).
// Handles sidebar state, search functionality, and page navigation tracking.
import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { filter } from 'rxjs';

// Shape of a search result item (stores found text and its DOM element reference).
interface SearchResult {
  text: string;
  element: HTMLElement;
}

@Component({
  selector: 'app-root',                 // Root selector <app-root>
  standalone: true,                     // Standalone component (no NgModule needed)
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive, FormsModule], // Required Angular features
  templateUrl: './app.html',            // External HTML template
  styleUrls: ['./app.scss']             // External SCSS styles
})
export class App {
  // Reactive signals for managing UI state
  sidebarOpen = signal(false);             // Tracks whether sidebar is visible (mobile behavior)
  sidebarCollapsed = signal(false);        // Tracks whether sidebar is collapsed (desktop behavior)
  searchQuery = signal('');                // Current text in the search box
  suggestions = signal<SearchResult[]>([]);// Current search suggestions list
  currentPage = signal('');                // Holds the current active route/page

  // Angular dependency injection
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    // Listen to router navigation changes and update current page signal
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.currentPage.set(e.urlAfterRedirects);
      });
  }

  // Toggle sidebar open/collapse depending on viewport size.
  // - On mobile (<=768px): fully open/close
  // - On desktop: collapse/expand (width change)
  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.sidebarOpen.update(v => !v);
    } else {
      this.sidebarCollapsed.update(v => !v);
    }
  }

  // Update the suggestions list based on search query.
  // Scans text-based elements inside the <main.content> container.
  updateSuggestions() {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) {
      this.suggestions.set([]);
      return;
    }

    const main = document.querySelector('main.content');
    if (!main) return;

    const results: SearchResult[] = [];

    // Collect matches from headings, paragraphs, spans, table cells, list items, and custom .name/.title elements
    main.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6,p,span,td,th,li,.name,.title')
      .forEach(el => {
        const text = (el.textContent || '').trim();
        if (text.length > 2 && text.toLowerCase().includes(q)) {
          results.push({ text, element: el });
        }
      });

    // Keep only top 10 results
    this.suggestions.set(results.slice(0, 10));
  }

  // Scroll to a selected search result and temporarily highlight it.
  onSearch(item?: SearchResult) {
    const target = item ?? this.suggestions()[0];
    if (!target) return;

    const el = target.element as HTMLElement;

    // Smooth scroll to element
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Inline highlight styling (temporary effect)
    const prevBg = el.style.backgroundColor;
    const prevOutline = el.style.outline;
    const prevTransition = el.style.transition;

    // Add smooth transition if missing
    el.style.transition = prevTransition
      ? `${prevTransition}, background 0.3s ease, outline-color 0.3s ease`
      : 'background 0.3s ease, outline-color 0.3s ease';

    el.style.backgroundColor = '#fff3cd';   // Light yellow background
    el.style.outline = '2px solid #facc15'; // Bright yellow outline
    el.style.borderRadius = el.style.borderRadius || '4px';

    // Revert back after 2 seconds
    setTimeout(() => {
      el.style.backgroundColor = prevBg;
      el.style.outline = prevOutline;
      el.style.transition = prevTransition;
    }, 2000);

    // Cleanup: reset suggestions and query
    this.suggestions.set([]);
    this.searchQuery.set('');
  }

  // Highlight matching substring in suggestion text with <mark> tag.
  highlight(text: string): SafeHtml {
    const q = this.searchQuery().trim();
    if (!q) return text;
    const re = new RegExp(`(${q})`, 'gi');
    const newText = text.replace(re, `<mark>$1</mark>`);
    return this.sanitizer.bypassSecurityTrustHtml(newText);
  }
}
