import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { Location } from '@angular/common'; 
import { ProductsService, Product } from '../../services/product.service';
import { ProductModalComponent } from '../../components/product-modal/product-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [ProductModalComponent, CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  productId!: number;
  product: Product | null = null;
  showModal = true;
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductsService,
    private location: Location, 
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.route.params.subscribe((params) => {
      const idParam = params['id'];
      this.productId = idParam ? +idParam : 0; 
      if (this.productId && !isNaN(this.productId)) { 
          this.fetchProduct();
      } else {
          console.error("Invalid product ID received:", idParam);
          this.errorMessage = "Неверный ID товара.";
          this.isLoading = false;
          this.showModal = false;
      }
    });
  }

  fetchProduct(): void {
    this.productService.getProductById(this.productId).subscribe({
      next: (data) => {
        this.product = data;
        this.isLoading = false;
        this.showModal = true; 
        console.log("Fetched product detail:", this.product);
      },
      error: (error) => {
        console.error('Error fetching product detail', error);
        this.errorMessage = "Не удалось загрузить детали товара.";
        this.isLoading = false;
        this.showModal = false;
      }
    });
  }

  closeModal() {
    console.log("closeModal called in ProductDetailComponent"); 
    this.showModal = false; 

    
    this.location.back(); 

  }
}