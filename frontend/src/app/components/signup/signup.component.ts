import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

const fullRegistrationUrl = 'http://127.0.0.1:8000/api/accounts/register/';

@Component({
    selector: 'app-signup',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
    username = '';
    email = '';
    password = '';
    password2 = '';
    firstName = ''; 
    lastName = '';  
    error = '';

    constructor(private http: HttpClient, private router: Router) {}

    signup() {
        const fullRegistrationUrl = 'http://127.0.0.1:8000/api/accounts/register/';
        this.http.post<any>(fullRegistrationUrl, {
            username: this.username,
            email: this.email,
            password: this.password,
            password2: this.password2,
            first_name: this.firstName,
            last_name: this.lastName   
        }).subscribe({
            next: data => {
                this.router.navigate(['/login']); 
            },
            error: error => {
                
                this.error = 'Registration failed. ';
                if (error.error) {
                    const errors = error.error;
                    for (const key in errors) {
                        if (errors.hasOwnProperty(key)) {
                            this.error += `${key}: ${errors[key].join ? errors[key].join(', ') : errors[key]} `;
                        }
                    }
                }
                console.error(error);
            }
        });
    }
}