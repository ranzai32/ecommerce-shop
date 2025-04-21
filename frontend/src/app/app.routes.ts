import { Routes } from '@angular/router';
import { BasketComponent } from './pages/basket/basket.component';
import { HeaderComponent } from './components/header/header.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { MyhomeComponent } from './components/myhome/myhome.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component'; 
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { authGuard } from './guards/auth.guard';
import { SearchResultsComponent } from './pages/search-results/search-results.component'; 

export const routes: Routes = [
  { path: '', component: MyhomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'basket', component: BasketComponent },
  { path: 'product-detail/:id', component: ProductDetailComponent },
  {
    path: 'profile', 
    component: UserProfileComponent,
    canActivate: [authGuard] 
  },
  { path: 'search', component: SearchResultsComponent },
  { path: '**', component: NotFoundComponent }, 
]