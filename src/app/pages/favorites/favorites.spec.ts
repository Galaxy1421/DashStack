/**
 * Test Suite: FavoritesComponent
 *
 * This spec verifies:
 * - Component creation
 * - Loading favorite products from DataService
 * - Rendering of product cards
 * - Toggling favorite status
 * - Image navigation (next/prev)
 * - Star rating rendering
 *
 * Uses MockDataService to provide deterministic test data.
 * Animations are disabled in test using provideNoopAnimations().
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoritesComponent } from './favorites';
import { DataService } from '../../data.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

// Mock service that returns static data instead of making real API calls
class MockDataService {
  getProducts() {
    return of({
      products: [
        { id: 1, title: 'Mock Product 1', price: 100, images: ['img1a.jpg', 'img1b.jpg'], rating: 4, isFavorite: true },
        { id: 2, title: 'Mock Product 2', price: 200, images: ['img2.jpg'], rating: 5, isFavorite: false }
      ]
    });
  }
}

describe('FavoritesComponent', () => {
  let component: FavoritesComponent;
  let fixture: ComponentFixture<FavoritesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritesComponent], // Import the standalone component
      providers: [
        { provide: DataService, useClass: MockDataService }, // Replace real service with mock
        provideNoopAnimations() // Disable Angular animations during testing
      ]
    }).compileComponents();

    // Create component test fixture
    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger initial data binding
  });

  // Test 1: Ensure component can be created successfully
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // Test 2: Ensure favorites$ loads products and sets isFavorite=true
  it('should load favorite products from service (all marked isFavorite=true)', (done) => {
    component.favorites$.subscribe((favorites) => {
      // In the component, all products are forced to isFavorite=true,
      // so both mock products should appear in the favorites stream
      expect(favorites.length).toBe(2);
      expect(favorites[0].title).toBe('Mock Product 1');
      expect(favorites[0].isFavorite).toBeTrue();
      done();
    });
  });

  // Test 3: Ensure DOM renders correct number of product cards
  it('should render product cards', () => {
    // Verify DOM rendering of product cards
    const cards = fixture.debugElement.queryAll(By.css('.product-card'));
    expect(cards.length).toBe(2);
  });

  // Test 4: Ensure toggleFavorite flips the favorite status
  it('should toggle favorite status', (done) => {
    component.favorites$.subscribe((products) => {
      const product = products[0];
      const prev = product.isFavorite;

      // Toggle favorite
      component.toggleFavorite(product);

      // Expect the value to flip
      expect(product.isFavorite).toBe(!prev);
      done();
    });
  });

  // Test 5: Ensure nextImage cycles to the next image index
  it('should move to next image', (done) => {
    component.favorites$.subscribe((products) => {
      const product = products[0]; // has 2 images
      const initialIndex = product.currentIndex;

      component.nextImage(product);

      // Should advance to the next image index
      expect(product.currentIndex).toBe((initialIndex + 1) % product.images.length);
      done();
    });
  });

  // Test 6: Ensure prevImage cycles back correctly when at index 0
  it('should move to previous image', (done) => {
    component.favorites$.subscribe((products) => {
      const product = products[0]; // has 2 images
      product.currentIndex = 0;

      component.prevImage(product);

      // If at index 0, going prev should wrap to the last image
      expect(product.currentIndex).toBe(product.images.length - 1);
      done();
    });
  });

  // Test 7: Ensure getStars returns correct filled stars based on rating
  it('should return correct star ratings', () => {
    // 4.2 should round to 4 filled stars
    const stars = component.getStars(4.2);
    expect(stars.length).toBe(5);
    expect(stars.filter(s => s.filled).length).toBe(4);

    // 5 should result in all stars filled
    const stars2 = component.getStars(5);
    expect(stars2.filter(s => s.filled).length).toBe(5);
  });
});
