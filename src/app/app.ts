import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { filter } from 'rxjs';

/**
 * SearchResult: Represents a single search suggestion
 * - text: the visible text in the element
 * - element: the DOM node reference (to scroll/highlight when clicked)
 */
interface SearchResult {
  text: string;
  element: HTMLElement;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  // Signals (Angular 16 reactive state)
  sidebarOpen = signal(false);        // Tracks if the sidebar is open (mobile view)
  sidebarCollapsed = signal(false);   // Tracks if sidebar is collapsed (desktop view)
  searchQuery = signal('');           // Current search input
  suggestions = signal<SearchResult[]>([]); // Live search suggestions
  currentPage = signal('');           // Current route/page

  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  constructor() {
    // Listen to navigation events and update currentPage
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        this.currentPage.set(e.urlAfterRedirects);
      });
  }

  /**
   * Toggle sidebar behavior based on device:
   * - Mobile: open/close full sidebar
   * - Desktop: collapse/expand sidebar width
   */
  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.sidebarOpen.update(v => !v);
    } else {
      this.sidebarCollapsed.update(v => !v);
    }
  }

  /**
   * updateSuggestions:
   * Runs every time user types in search input.
   * Scans the current <main> content area for text
   * inside headers, paragraphs, table cells, etc.
   * Returns up to 10 matches that include the query string.
   */
  updateSuggestions() {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) {
      this.suggestions.set([]);
      return;
    }

    const main = document.querySelector('main.content');
    if (!main) return;

    const results: SearchResult[] = [];
    main.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6,p,span,td,th,li,.name,.title')
      .forEach(el => {
        const text = (el.textContent || '').trim();
        if (text.length > 2 && text.toLowerCase().includes(q)) {
          results.push({ text, element: el });
        }
      });

    this.suggestions.set(results.slice(0, 10));
  }

  /**
   * onSearch:
   * Triggered when user presses Enter OR clicks a suggestion.
   * - Scrolls to the matched element smoothly
   * - Temporarily highlights the element (background + outline)
   * - Clears suggestions + resets search box
   */
  onSearch(item?: SearchResult) {
    const target = item ?? this.suggestions()[0]; // if user didn’t pick -> use first suggestion
    if (!target) return;

    const el = target.element as HTMLElement;

    // Smooth scroll to element
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Backup old styles
    const prevBg = el.style.backgroundColor;
    const prevOutline = el.style.outline;
    const prevTransition = el.style.transition;

    // Add highlight with smooth transition
    el.style.transition = prevTransition
      ? `${prevTransition}, background 0.3s ease, outline-color 0.3s ease`
      : 'background 0.3s ease, outline-color 0.3s ease';

    el.style.backgroundColor = '#fff3cd'; 
    el.style.outline = '2px solid #facc15'; 
    el.style.borderRadius = el.style.borderRadius || '4px';

    // Remove highlight after 2 seconds
    setTimeout(() => {
      el.style.backgroundColor = prevBg;
      el.style.outline = prevOutline;
      el.style.transition = prevTransition;
    }, 2000);

    // Reset state
    this.suggestions.set([]);
    this.searchQuery.set('');
  }

  /**
   * highlight:
   * Used in the dropdown suggestion list.
   * Wraps the matched query in <mark> tags with styles.
   * Example: "Dashboard" + query "dash" -> "<mark>Dash</mark>board"
   */
  highlight(text: string): SafeHtml {
    const q = this.searchQuery().trim();
    if (!q) return text;
    const re = new RegExp(`(${q})`, 'gi');
    const newText = text.replace(re, `<mark>$1</mark>`);
    return this.sanitizer.bypassSecurityTrustHtml(newText);
  }
}
