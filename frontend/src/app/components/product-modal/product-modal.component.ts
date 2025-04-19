import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service'; 

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent implements OnInit {
  @Input() product: Product | null = null;
  @Output() closeModal = new EventEmitter<void>();
  isVisible = false;
  isAddingToCart = false;

  constructor(
      private router: Router,
      private cartService: CartService, 
    ) {}

  ngOnInit() {
    setTimeout(() => { this.isVisible = true; }, 50);
  }

  close() {
    this.isVisible = false;
    setTimeout(() => {
      this.closeModal.emit();
    }, 300);
  }

  addToCart(): void {
    if (!this.product || this.isAddingToCart) {
      return; 
    }

    this.isAddingToCart = true; 
    console.log(`Adding product ${this.product.id} from modal to cart...`);

    this.cartService.addItem(this.product.id, 1).subscribe({
      next: (cart) => {
        console.log('Product added to cart from modal!', cart);
        alert('Товар добавлен в корзину!');
        this.isAddingToCart = false;
      },
      error: (err) => {
        console.error('Failed to add product to cart from modal:', err);
        alert('Ошибка добавления товара в корзину.');
        this.isAddingToCart = false; 
      }
    });
  }
}