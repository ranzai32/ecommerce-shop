import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../services/product.service';
import { ProductModalComponent } from '../../components/product-modal/product-modal.component';
import { CommonModule } from '@angular/common';

interface Product {
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
  selector: 'app-product-detail',
  imports: [ProductModalComponent, CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  productId!: number;
  product: Product | null = null;
  showModal = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.productId = +params['id'];
      this.fetchProduct();
    });
  }

  fetchProduct(): void {
    this.productService.getProductById(this.productId).subscribe(
      (data) => {
        this.product = data;
      },
      (error) => {
        console.error('Error fetching product', error);
      }
    );
  }

  closeModal() {
    this.showModal = false;
  }
}