import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common'; 
import { Subscription } from 'rxjs';
import { ProductsService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { switchMap, tap, catchError } from 'rxjs/operators'; 
import { of } from 'rxjs';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  searchTerm: string | null = null;
  searchResults: Product[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  private routeSubscription: Subscription = new Subscription();
  addingProductId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private cartService: CartService 
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.queryParamMap.pipe(
      tap(() => { 
        this.isLoading = true; 
        this.errorMessage = null;
        this.searchResults = []; 
        this.searchTerm = null;
      }),
      switchMap(params => { 
        const query = params.get('query');
        this.searchTerm = query; 
        if (query) {
          console.log(`Searching for: ${query}`);
          return this.productsService.searchProducts(query);
        } else {

          console.log('Search query is empty.');
          return of([]); 
        }
      })
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isLoading = false;
        console.log('Search results:', results);
      },
      error: (err) => {
        console.error('Error during search:', err);
        this.errorMessage = 'Произошла ошибка во время поиска.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  addToCart(productId: number): void {
    if (this.addingProductId) return; 
    this.addingProductId = productId; 
    console.log(`Adding product ${productId} to cart from search results...`);
    this.cartService.addItem(productId, 1).subscribe({
      next: (cart) => {
        console.log('Product added to cart from search!', cart);
        alert('Товар добавлен в корзину!'); 
        this.addingProductId = null; 
      },
      error: (err) => {
        console.error('Failed to add product to cart from search:', err);
        alert('Ошибка добавления товара в корзину.'); 
        this.addingProductId = null; 
      }
    });
  }

}

