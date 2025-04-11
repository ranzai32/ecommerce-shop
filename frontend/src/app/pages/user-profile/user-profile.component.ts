import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http'; 
import { Observable, of } from 'rxjs'; 
import { catchError, tap } from 'rxjs/operators'; 
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';


interface ValidationResponse {
  isValid: boolean;
  user?: {
    username?: string;
    email?: string;
    profileImageUrl?: string;
    id?: number;
    first_name?: string;
    last_name?: string;  
  };
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  userData: ValidationResponse['user'] | null = null; 
  isLoading = true; 
  errorMessage: string | null = null; 
  constructor(private http: HttpClient) { } 

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const token = localStorage.getItem('token');

    if (!token) {
      this.errorMessage = "Ошибка: Токен аутентификации не найден.";
      this.isLoading = false;
      return;
    }

    this.validateToken(token).subscribe({
      next: (response) => {
        if (response.isValid && response.user) {
          this.userData = response.user;
        } else {
          this.errorMessage = "Не удалось получить данные профиля или токен недействителен.";
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = "Ошибка при загрузке профиля.";
        console.error("Error fetching user profile:", err);
        this.isLoading = false;
      }
    });
  }

  validateToken(token: string): Observable<ValidationResponse> {
      const validationUrl = 'http://127.0.0.1:8000/api/accounts/validate-token/';
      const headers = { 'Authorization': `Token ${token}` };
      return this.http.post<ValidationResponse>(validationUrl, {}, { headers }).pipe(
          tap(response => console.log('UserProfile: Raw response from validateToken:', response)),
          catchError((error: HttpErrorResponse) => {
              console.error('UserProfile: CATCHING error in validateToken HTTP call:', error);
              return of({ isValid: false, user: undefined });
          })
      );
  }
}