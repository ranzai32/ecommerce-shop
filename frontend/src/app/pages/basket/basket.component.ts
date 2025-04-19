import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService, Cart, CartItem } from '../../services/cart.service';
import { Subscription } from 'rxjs';

interface CartItemWithLoading extends CartItem {
  loading?: boolean;
}

interface CartWithLoading extends Omit<Cart, 'items'> {
    items: CartItemWithLoading[];
}

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent implements OnInit, OnDestroy {

  cart: CartWithLoading | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  private cartSubscription: Subscription = new Subscription();
  updatingItemId: number | null = null; 

  constructor(private cartService: CartService) {}

  get isAnythingLoading(): boolean {
    return this.isLoading || (this.cart?.items?.some(i => i.loading) ?? false);
  }

  get cartTotalQuantity(): number {
    return this.cart?.total_quantity ?? 0; 
  }

  get cartTotalPrice(): string | number { 
      return this.cart?.total_price ?? 0; 
  }

  ngOnInit(): void {
    this.subscribeToCart();
    this.loadCart();
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  subscribeToCart(): void {
    this.isLoading = true;
    this.cartSubscription = this.cartService.cart$.subscribe({
      next: (cartData) => {
        this.cart = cartData ? { ...cartData, items: cartData.items.map(item => ({ ...item, loading: false })) } : null;
        this.isLoading = false;
        this.errorMessage = null;
        console.log('BasketComponent received cart update:', this.cart);
      },
      error: (err) => {
        this.errorMessage = "Ошибка отображения корзины.";
        this.isLoading = false;
        console.error("Error in cart subscription:", err);
      }
    });
  }

  loadCart(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cartService.getCart().subscribe({
        error: (err) => {
             this.errorMessage = "Не удалось загрузить корзину.";
             this.isLoading = false;
             console.error("Error loading cart:", err);
        }
    });
  }

  private findCartItem(itemId: number): CartItemWithLoading | undefined {
      return this.cart?.items.find(i => i.id === itemId);
  }

  increaseQuantity(itemId: number): void {
    const item = this.findCartItem(itemId);
    if (!item || item.loading || this.updatingItemId === itemId) return;

    const originalQuantity = item.quantity;
    const newQuantity = item.quantity + 1;

    item.loading = true;
    item.quantity = newQuantity;
    this.updatingItemId = itemId;

    console.log(`Optimistic update item ${itemId} quantity to ${newQuantity}`);

    this.cartService.updateItem(item.id, newQuantity).subscribe({
      next: (updatedCart) => {
        console.log(`Backend confirmed update for item ${itemId} to quantity ${newQuantity}`);
        this.updatingItemId = null;
        // Состояние item.loading обновится через subscribeToCart
      },
      error: (err) => {
        alert('Ошибка обновления количества');
        console.error(`Failed to update item ${itemId} quantity:`, err);
        const itemToRevert = this.findCartItem(itemId);
        if (itemToRevert) {
            itemToRevert.quantity = originalQuantity;
            itemToRevert.loading = false;
        }
        this.updatingItemId = null;
      }
    });
  }

  decreaseQuantity(itemId: number): void {
     const item = this.findCartItem(itemId);
     if (!item || item.loading || this.updatingItemId === itemId) return;

     const originalQuantity = item.quantity;
     const newQuantity = item.quantity - 1;

     if (newQuantity <= 0) {
       this.removeItem(itemId);
       return;
     }

     item.loading = true;
     item.quantity = newQuantity;
     this.updatingItemId = itemId;

     console.log(`Optimistic update item ${itemId} quantity to ${newQuantity}`);

     this.cartService.updateItem(item.id, newQuantity).subscribe({
        next: (updatedCart) => {
            console.log(`Backend confirmed update for item ${itemId} to quantity ${newQuantity}`);
            this.updatingItemId = null;
             // Состояние item.loading обновится через subscribeToCart
        },
        error: (err) => {
            console.error(`Failed to update item ${itemId} quantity:`, err);
            alert('Ошибка обновления количества');
            const itemToRevert = this.findCartItem(itemId);
            if(itemToRevert) {
                itemToRevert.quantity = originalQuantity;
                itemToRevert.loading = false;
            }
            this.updatingItemId = null;
        }
     });
  }

  removeItem(itemId: number): void {
    const item = this.findCartItem(itemId);
    if (!item || item.loading || this.updatingItemId === itemId) return;

    console.log(`Removing item ${itemId}`);
    item.loading = true;
    this.updatingItemId = itemId;

    this.cartService.removeItem(itemId).subscribe({
        next: (updatedCart) => {
            console.log(`Item ${itemId} removed.`);
            this.updatingItemId = null;
            // Обновление придет через subscribeToCart
        },
        error: (err) => {
            alert('Ошибка удаления товара');
            console.error('Error removing item:', err);
            const itemToRevert = this.findCartItem(itemId);
            if(itemToRevert) {
                itemToRevert.loading = false;
            }
            this.updatingItemId = null;
        }
     });
  }

  clearCart(): void {
      if (this.cart?.items.some(item => item.loading)) return;

      if (confirm("Вы уверены, что хотите очистить корзину?")) {
          console.log("Clearing cart");
          this.isLoading = true;
          this.cartService.clearCart().subscribe({
              next: () => {
                  console.log("Cart cleared");
              },
              error: (err) => {
                  alert('Ошибка очистки корзины');
                  this.isLoading = false;
              }
          });
      }
  }
}