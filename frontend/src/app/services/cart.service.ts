import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Product } from './product.service';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  total_item_price: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_price: string;
  total_quantity: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartApiUrl = 'http://127.0.0.1:8000/api/store/cart/';
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.cartApiUrl).pipe(
      tap(cart => this.cartSubject.next(cart)),
      catchError(this.handleError)
    );
  }

  addItem(productId: number, quantity: number = 1): Observable<Cart> {
    const url = `${this.cartApiUrl}add-item/`;
    const body = { product_id: productId, quantity: quantity };
    return this.http.post<Cart>(url, body).pipe(
      tap(cart => this.cartSubject.next(cart)),
      catchError(this.handleError)
    );
  }

  updateItem(itemId: number, quantity: number): Observable<Cart> {
    const url = `${this.cartApiUrl}update-item/${itemId}/`;
    const body = { quantity: quantity };
    return this.http.patch<Cart>(url, body).pipe(
      tap(cart => this.cartSubject.next(cart)),
      catchError(this.handleError)
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    const url = `${this.cartApiUrl}remove-item/${itemId}/`;
    return this.http.delete<Cart>(url).pipe(
      tap(cart => this.cartSubject.next(cart)),
      catchError(this.handleError)
    );
  }

  clearCart(): Observable<any> {
    return this.http.delete(this.cartApiUrl).pipe(
      tap(() => this.cartSubject.next(null)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    return throwError(() => new Error('Something went wrong with the cart operation.'));
  }

  loadInitialCart() {
    if (localStorage.getItem('token')) {
      this.getCart().subscribe({
        error: err => console.log("Could not load initial cart, maybe user has no cart yet?")
      });
    } else {
      this.cartSubject.next(null);
    }
  }

  getCurrentCartValue(): Cart | null {
    return this.cartSubject.value;
  }
}
