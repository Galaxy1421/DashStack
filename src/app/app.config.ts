/**
 * app.config.ts
 * 
 * Purpose:
 * - Define global application configuration for Angular.
 * - Setup providers for routing, HTTP, animations, error handling, and UI theme.
 * 
 * Key Features:
 * - Global error listeners for better debugging
 * - Zoneless change detection (improves performance by removing Zone.js dependency)
 * - Router setup with application routes
 * - HTTP client configuration for API communication
 * - Animations enabled for Angular and PrimeNG
 * - PrimeNG configuration using the Aura theme
 */

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    // Global error handling
    provideBrowserGlobalErrorListeners(),

    // Zoneless change detection (improves performance, no Zone.js dependency)
    provideZonelessChangeDetection(),

    // Enable Angular animations
    provideAnimations(),

    // Provide application routes
    provideRouter(routes),

    // Provide HttpClient for API requests
    provideHttpClient(),

    // PrimeNG theme and configuration
    providePrimeNG({
      theme: { 
        preset: aura,   // Aura theme preset
        options: {
          darkModeSelector: '', // Disable dark mode by default
        }
      }
    })
  ]
};
