import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductsService } from '../../services/product.service';

interface Product { // Adjust this interface to match your JSON data
  id: number;
  title: string;
  price: number;
  description: string;
  images: string[];
  category: {
    id: number;
    name: string;
    image: string;
  };
}

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
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.isLoading = false;
        this.products = response;
        console.log('Fetched products:', this.products);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load products.';
        console.error(error);
      },
    });
  }
}