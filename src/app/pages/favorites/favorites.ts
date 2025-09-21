import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../data.service';
import { map, Observable } from 'rxjs';
import { ButtonModule } from 'primeng/button'; 
import { animate, style, transition, trigger, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.scss'],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('heartAnimation', [
      transition('inactive => active', [
        style({ transform: 'scale(1)' }),
        animate('200ms ease-out', style({ transform: 'scale(1.4)' })),
        animate('150ms ease-in', style({ transform: 'scale(1)' }))
      ]),
      transition('active => inactive', [
        style({ transform: 'scale(1)' }),
        animate('200ms ease-in', style({ transform: 'scale(0.8)' })),
        animate('150ms ease-out', style({ transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class FavoritesComponent {
  favorites$: Observable<any[]>;

  constructor(private dataService: DataService) {
    this.favorites$ = this.dataService.getProducts(100).pipe(
      map((res: any) =>
        res.products.map((p: any) => ({
          ...p,
          currentIndex: 0,
          reviewsCount: Math.floor(Math.random() * 200) + 1,
          isFavorite: true
        }))
      )
    );
  }

  toggleFavorite(product: any) {
    product.isFavorite = !product.isFavorite;
  }

  nextImage(product: any) {
    if (product.images?.length > 1) {
      product.currentIndex = (product.currentIndex + 1) % product.images.length;
    }
  }

  prevImage(product: any) {
    if (product.images?.length > 1) {
      product.currentIndex =
        (product.currentIndex - 1 + product.images.length) % product.images.length;
    }
  }

  getStars(rating: number): { filled: boolean }[] {
    const rounded = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => ({ filled: i < rounded }));
  }
}
