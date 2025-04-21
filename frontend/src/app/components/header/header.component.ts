import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'; 
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators'; 
import { AuthService } from '../../services/auth.service';
import { UserProfileComponent } from '../../pages/user-profile/user-profile.component';
import { FormsModule } from '@angular/forms';

interface ValidationResponse {
    isValid: boolean;
    user?: {
        username?: string;
        email?: string;
        profileImageUrl?: string;
    };
}

@Component({
    selector: 'app-header',
    standalone: true, 
    imports: [
        CommonModule, 
        RouterModule, 
        MatIconModule,
        FormsModule,
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
    isMobileMenuOpen = false;
    isLoggedIn = false; 
    userProfileImageUrl: string | null = null; 
    username: string | null = null;
    private authSubscription: Subscription = new Subscription();
    searchTerm: string = '';

    constructor(
        private router: Router,
        private http: HttpClient,
        private authService: AuthService 
    ) {}

    ngOnInit() {
        this.authSubscription = this.authService.isLoggedIn$.subscribe(status => {
            this.isLoggedIn = status;
            if (this.isLoggedIn) {
                this.fetchUserProfileIfNeeded();
            } else {
                this.userProfileImageUrl = null;
            }
            console.log(`HeaderComponent received login status: ${status}`); 
        });
    }

    ngOnDestroy() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }

    fetchUserProfileIfNeeded() {
        const token = localStorage.getItem('token');
        if (this.isLoggedIn && token && !this.username) {
           this.validateToken(token).subscribe({
             next: (response) => {
               if (response.isValid && response.user) {
                  this.username = response.user.username || null; 
                  
                  this.userProfileImageUrl = response.user.profileImageUrl || 'assets/default-profile.png';
                  console.log(`User profile data fetched: username=${this.username}`);
               } else if (!response.isValid) {
                 console.error("Token validation failed when fetching profile. Logging out.");
                 this.logout(); 
               } else if (response.isValid && !response.user) {
                  console.warn("Token valid, but no user data received from backend.");
               }
             },
             error: (err) => {
                console.error("Error fetching user profile:", err);
                this.logout();
             }
           });
        }
    }

    validateToken(token: string): Observable<ValidationResponse> {
        console.log('Header: validateToken function CALLED with token:', token);
        const validationUrl = 'http://127.0.0.1:8000/api/accounts/validate-token/';
        const headers = { 'Authorization': `Token ${token}` }; 
        console.log('Header: Preparing to send POST to:', validationUrl);
        return this.http.post<ValidationResponse>(validationUrl, {}, { headers }).pipe(
            tap(response => console.log('Header: Raw response from validateToken:', response)),
            catchError((error: HttpErrorResponse) => {
                console.error('Header: CATCHING error in validateToken HTTP call:', error);
                return of({ isValid: false, user: undefined }); 
            })
        );
    }
    

    logout() {
        this.clearAuthData(); 
        this.authService.logout(); 
        this.router.navigate(['/']);
        console.log("User logged out.");
    }

    clearAuthData() {
        localStorage.removeItem('token');
        console.log("Auth data cleared from localStorage.");
    }

    onSearchSubmit(): void {
        const query = this.searchTerm.trim();
        if (query) {
             console.log(`Navigating to search results for: ${query}`);
             this.router.navigate(['/search'], { queryParams: { query: query } });
             // Очищаем поле поиска после отправки (опционально)
             // this.searchTerm = '';
             this.isMobileMenuOpen = false;
        } else {
            console.log('Search term is empty, not navigating.');
        }
    }

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }
}