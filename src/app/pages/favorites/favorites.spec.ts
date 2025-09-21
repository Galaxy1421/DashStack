import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoritesComponent } from './favorites';
import { DataService } from '../../data.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

class MockDataService {
  getProducts() {
    return of({
      products: [
        { id: 1, title: 'Mock Product 1', price: 100, images: ['mock1.jpg'], rating: 4, isFavorite: true },
        { id: 2, title: 'Mock Product 2', price: 200, images: ['mock2.jpg'], rating: 5, isFavorite: false }
      ]
    });
  }
}

describe('FavoritesComponent', () => {
  let component: FavoritesComponent;
  let fixture: ComponentFixture<FavoritesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritesComponent],
      providers: [{ provide: DataService, useClass: MockDataService }]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load favorite products from service', (done) => {
    component.favorites$.subscribe((favorites) => {
      expect(favorites.length).toBe(1);
      expect(favorites[0].title).toBe('Mock Product 1');
      done();
    });
  });

  it('should render product cards', () => {
    const cards = fixture.debugElement.queryAll(By.css('.product-card'));
    expect(cards.length).toBe(2);
  });

  it('should toggle favorite status', (done) => {
  component.favorites$.subscribe((products) => {
    const product = products[0];
    const prev = product.isFavorite;

    component.toggleFavorite(product);

    expect(product.isFavorite).toBe(!prev);
    done();
  });
});

});
