import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    username = '';
    password = '';
    error = '';

    constructor(
        private http: HttpClient,
        private router: Router,
        private authService: AuthService
    ) {}

    login() {
        const fullLoginUrl = 'http://127.0.0.1:8000/api/accounts/login/';
        this.http.post<any>(fullLoginUrl, {
          username: this.username,
          password: this.password
        }).subscribe({
          next: data => {
            localStorage.setItem('token', data.token);
            this.authService.login();
            this.router.navigate(['/']);
          },
          error: error => {
            this.error = 'Invalid credentials';
            console.error(error);
          }
        });
    }
}