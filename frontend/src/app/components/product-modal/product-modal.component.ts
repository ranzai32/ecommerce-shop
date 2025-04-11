import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product } from '../../services/product.service'; 

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
  constructor(private router: Router) {}

 
  ngOnInit() {
    setTimeout(() => {
      this.isVisible = true;
    }, 50); 
  }

  close() {
    this.isVisible = false;
    setTimeout(() => {
      this.closeModal.emit();
    }, 300); 
  }
}