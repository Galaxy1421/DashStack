
/**
 * FavoritesComponent
 * 
 * This component displays a grid of favorite products. 
 * - Loads products from DataService (limit 100) and marks them all as favorites.
 * - Adds UI features such as:
 *   • Product image carousel (next/prev navigation).
 *   • Toggleable favorite heart icon with animations.
 *   • Dynamic star rating rendering based on product rating.
 *   • Randomized reviews count for demo purposes.
 * - Animations:
 *   • listAnimation: staggered fade-in for the product list.
 *   • cardAnimation: scale-in effect for each card.
 *   • heartAnimation: scaling effect when toggling favorites.
 */


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
    // Animation for the entire product list (staggered fade-in and slide-up)
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
    // Animation for each product card (scale in)
    trigger('cardAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    // Heart (favorite) toggle animation
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
  // Observable stream of favorite products
  favorites$: Observable<any[]>;

  constructor(private dataService: DataService) {
    // Load products from the API (limit = 100)
    this.favorites$ = this.dataService.getProducts(100).pipe(
      map((res: any) =>
        res.products.map((p: any) => ({
          ...p,
          currentIndex: 0, // index for image carousel
          reviewsCount: Math.floor(Math.random() * 200) + 1, // random fake reviews count
          isFavorite: true // mark all as favorite (NOTE: this overrides actual value)
        }))
      )
    );
  }

  /** Toggle favorite status for a product */
  toggleFavorite(product: any) {
    product.isFavorite = !product.isFavorite;
  }

  /** Move to next image in product gallery */
  nextImage(product: any) {
    if (product.images?.length > 1) {
      product.currentIndex = (product.currentIndex + 1) % product.images.length;
    }
  }

  /** Move to previous image in product gallery */
  prevImage(product: any) {
    if (product.images?.length > 1) {
      product.currentIndex =
        (product.currentIndex - 1 + product.images.length) % product.images.length;
    }
  }

  /**
   * Return an array of star objects for rating display
   * Each star has a "filled" property to determine if it should be highlighted
   */
  getStars(rating: number): { filled: boolean }[] {
    const rounded = Math.round(rating); // round rating to nearest int
    return Array.from({ length: 5 }, (_, i) => ({ filled: i < rounded }));
  }
}
