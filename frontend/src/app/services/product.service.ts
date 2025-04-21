import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; 
import { catchError, throwError } from 'rxjs';


const API_BASE_URL = 'http://127.0.0.1:8000/api/store'; 

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  category: Category | null; 
  name: string;
  slug: string;
  description: string;
  price: string; 
  image: string | null; 
  available: boolean;
  image_url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly MEDIA_BASE_URL = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_BASE_URL}/products/`).pipe(
      map(products => products.map(product => this.processProductImage(product)))
    );
  }

  searchProducts(searchTerm: string): Observable<Product[]> {
    const url = `${API_BASE_URL}/products/?search=${encodeURIComponent(searchTerm)}`;
    console.log(`ProductService: Searching at URL: ${url}`); 
    return this.http.get<Product[]>(url).pipe(
      map(products => products.map(product => this.processProductImage(product))),
      catchError(err => {
          console.error("Error in searchProducts API call:", err);
          return throwError(() => new Error('API search failed')); 
      })
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${API_BASE_URL}/products/${id}/`).pipe(
      map(product => this.processProductImage(product))
    );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE_URL}/categories/`);
  }

  private processProductImage(product: Product): Product {
    if (product.image) {
      if (product.image.startsWith('http://') || product.image.startsWith('https://')) {
        product.image_url = product.image;
      } else {
        product.image_url = `${this.MEDIA_BASE_URL}${product.image}`;
      }
    } else {
      product.image_url = 'assets/placeholder.jpg';
    }
    return product;
  }

  
}