import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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

    constructor(private http: HttpClient, private router: Router) {}

    login() {
        
        const fullLoginUrl = 'http://127.0.0.1:8000/api/accounts/login/'; 

        this.http.post<any>(fullLoginUrl, {  // Use the full URL
            username: this.username,
            password: this.password
        }).subscribe({
            next: data => {
                localStorage.setItem('token', data.token); // Store the token
                this.router.navigate(['/']); // Redirect to home
            },
            error: error => {
                this.error = 'Invalid credentials';
                console.error(error);
            }
        });
    }
}