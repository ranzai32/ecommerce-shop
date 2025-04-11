import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'; // Assuming you use Angular Material Icons
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, Subscription } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators'; // Import map if needed for response transformation
import { AuthService } from '../../services/auth.service'; // <-- УКАЖИТЕ ПРАВИЛЬНЫЙ ПУТЬ к вашему AuthService

// Интерфейс для ответа от validate-token (убедитесь, что он соответствует вашему API)
interface ValidationResponse {
    isValid: boolean;
    user?: {
        // Добавьте поля пользователя, которые может вернуть ваш бэкенд
        username?: string;
        email?: string;
        profileImageUrl?: string;
    };
}

@Component({
    selector: 'app-header',
    standalone: true, // Используем standalone компонент, как в вашем исходном коде
    imports: [
        CommonModule, // Нужен для *ngIf, *ngFor и т.д.
        RouterModule, // Нужен для routerLink
        MatIconModule // Нужен для <mat-icon>
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
    isMobileMenuOpen = false; // Для мобильного меню (если есть)
    isLoggedIn = false; // Статус входа
    userProfileImageUrl: string | null = null; // URL аватара
    private authSubscription: Subscription = new Subscription(); // Подписка на статус аутентификации

    constructor(
        private router: Router,
        private http: HttpClient,
        private authService: AuthService // Внедряем сервис аутентификации
    ) {}

    ngOnInit() {
        // Подписываемся на изменения статуса входа из AuthService
        this.authSubscription = this.authService.isLoggedIn$.subscribe(status => {
            this.isLoggedIn = status;
            if (this.isLoggedIn) {
                // Если статус true (вошли в систему), запрашиваем данные профиля
                this.fetchUserProfileIfNeeded();
            } else {
                // Если статус false (вышли из системы), сбрасываем аватар
                this.userProfileImageUrl = null;
            }
            console.log(`HeaderComponent received login status: ${status}`); // Для отладки
        });
    }

    ngOnDestroy() {
        // Отписываемся при уничтожении компонента во избежание утечек памяти
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }

    // Запрашивает данные пользователя (например, аватар), если пользователь вошел и данных еще нет
    fetchUserProfileIfNeeded() {
        const token = localStorage.getItem('token');
        // Запрашиваем только если есть токен и нет уже загруженного аватара
        if (token && !this.userProfileImageUrl) {
           this.validateToken(token).subscribe({
             next: (response) => {
               if (response.isValid && response.user) {
                  // Устанавливаем аватар из ответа сервера
                  this.userProfileImageUrl = response.user.profileImageUrl || 'assets/default-profile.png'; // Используем дефолтный, если URL нет
                  console.log("User profile data fetched/updated.");
               } else if (!response.isValid) {
                 // Если бэкенд вдруг сказал, что токен невалиден, хотя мы считали, что вошли
                 console.error("Token validation failed unexpectedly after login notification.");
                 this.logout(); // Выходим из системы
               }
             },
             error: (err) => {
               // При любой ошибке запроса профиля - выходим из системы
               console.error("Error fetching user profile:", err);
               this.logout();
             }
           });
        } else if (!token && this.isLoggedIn) {
             // Если сервис сказал, что мы вошли, но токена нет - несоответствие, выходим
             console.warn("Logged in status true but no token found. Logging out.");
             this.logout();
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
                return of({ isValid: false });
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

    toggleMobileMenu() {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
    }
}