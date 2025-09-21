/**
 * Application Routes Configuration
 *
 * This file defines all available routes in the application.
 * Each path is mapped to a specific component to handle navigation.
 *
 * Routes included:
 * - Default redirect to Dashboard
 * - Dashboard
 * - Orders list
 * - Team overview
 * - Add team member
 * - Edit team member (with ID parameter)
 * - Favorites page
 */

import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { OrderListsComponent } from './pages/orderLists/orderLists';
import { TeamComponent } from './pages/team/team';
import { AddMemberComponent } from './pages/addMember/addMember';
import { EditMemberComponent } from './pages/editMember/editMember';
import { FavoritesComponent } from './pages/favorites/favorites';

export const routes: Routes = [
  // Redirect root path to dashboard
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // Main routes
  { path: 'dashboard', component: DashboardComponent },
  { path: 'orders', component: OrderListsComponent },
  { path: 'team', component: TeamComponent },

  // Team management
  { path: 'addMember', component: AddMemberComponent },
  { path: 'editMember/:id', component: EditMemberComponent },

  // Favorites
  { path: 'favorites', component: FavoritesComponent }
];
