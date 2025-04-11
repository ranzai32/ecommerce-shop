import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'; // Используем BehaviorSubject для хранения текущего состояния

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // BehaviorSubject хранит последнее значение и выдает его новым подписчикам
  // Начальное значение - проверяем наличие токена при старте
  private loggedInStatus = new BehaviorSubject<boolean>(this.checkInitialLoginStatus());
  // Публичный Observable, на который будут подписываться компоненты
  public isLoggedIn$ = this.loggedInStatus.asObservable();

  constructor() { }

  private checkInitialLoginStatus(): boolean {
    // Простая проверка наличия токена при инициализации сервиса
    return !!localStorage.getItem('token');
  }

  // Вызывается из LoginComponent при успехе
  login(): void {
    this.loggedInStatus.next(true); // Сообщаем подписчикам, что статус true
  }

  // Вызывается из HeaderComponent при выходе
  logout(): void {
    this.loggedInStatus.next(false); // Сообщаем подписчикам, что статус false
  }
}
