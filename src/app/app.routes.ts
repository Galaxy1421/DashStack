import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { OrderListsComponent } from './pages/orderLists/orderLists';
import { TeamComponent } from './pages/team/team';
import {AddMemberComponent} from './pages/addMember/addMember';
import { EditMemberComponent } from './pages/editMember/editMember';
import { FavoritesComponent } from './pages/favorites/favorites'


export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'orders', component: OrderListsComponent },
  { path: 'team', component: TeamComponent },
{ path: 'addMember', component: AddMemberComponent },
  { path: 'editMember/:id', component: EditMemberComponent },
  { path: 'favorites', component: FavoritesComponent }


];
