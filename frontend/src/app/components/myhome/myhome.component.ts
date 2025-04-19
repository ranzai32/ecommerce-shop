import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductsService, Product } from '../../services/product.service'; 
import { CartService } from '../../services/cart.service'; 

@Component({
  selector: 'app-myhome',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './myhome.component.html',
  styleUrls: ['./myhome.component.scss'],
})
export class MyhomeComponent implements OnInit {
  products: Product[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  addingProductId: number | null = null;

  constructor(
    private productService: ProductsService,
    private cartService: CartService,
  ) {} 

  ngOnInit(): void {
    this.isLoading = true; 
    this.errorMessage = null;
    this.productService.getProducts().subscribe({ 
      next: (response) => {
        this.products = response; 
        this.isLoading = false;
        console.log('Fetched products:', this.products); 
      },
      error: (error) => {
        this.isLoading = false; 
        this.errorMessage = 'Failed to load products from API.';
        console.error('Error fetching products:', error);
      },
    });
  }

  addToCart(productId: number): void {
    if (this.addingProductId) return; 
    this.addingProductId = productId; 
    console.log(`Adding product ${productId} to cart...`);
    this.cartService.addItem(productId, 1).subscribe({
      next: (cart) => {
        console.log('Product added to cart!', cart);
        alert('Товар добавлен в корзину!'); 
        this.addingProductId = null; 
      },
      error: (err) => {
        console.error('Failed to add product to cart:', err);
        alert('Ошибка добавления товара в корзину.'); 
        this.addingProductId = null; 
      }
    });
  }
}