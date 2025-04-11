import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'; 
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loggedInStatus = new BehaviorSubject<boolean>(this.checkInitialLoginStatus());
  public isLoggedIn$ = this.loggedInStatus.asObservable();

  constructor() { }

  private checkInitialLoginStatus(): boolean {
    return !!localStorage.getItem('token');
  }

  login(): void {
    this.loggedInStatus.next(true); 
  }

  logout(): void {
    this.loggedInStatus.next(false); 
  }
}
