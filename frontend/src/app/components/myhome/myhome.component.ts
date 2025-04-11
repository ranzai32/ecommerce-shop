import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductsService, Product } from '../../services/product.service'; 


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

  constructor(private productService: ProductsService) {} 

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
}