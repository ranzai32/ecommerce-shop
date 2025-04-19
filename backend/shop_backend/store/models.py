from django.db import models
from django.urls import reverse
from django.conf import settings

class Category(models.Model):
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, unique=True)

    class Meta:
        ordering = ('name',)
        verbose_name = 'category'
        verbose_name_plural = 'categories'

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/%Y/%m/%d', blank=True, null=True)
    available = models.BooleanField(default=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('name',)
        indexes = [
            models.Index(fields=['id', 'slug']),
        ]
        verbose_name = 'product'
        verbose_name_plural = 'products'

    def __str__(self):
        return self.name
    
class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cart'       
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)     

    def __str__(self):
        return f"Корзина пользователя {self.user.username}"

    def get_total_price(self):
        return sum(item.get_total_item_price() for item in self.items.all())

    def get_total_quantity(self):
         return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items'      
    )
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE, 
        related_name='cart_items'
    )
    
    quantity = models.PositiveIntegerField(default=1) 
    added_at = models.DateTimeField(auto_now_add=True) 

    class Meta:
        unique_together = ('cart', 'product')
        ordering = ['added_at']

    def __str__(self):
        return f"{self.quantity} x {self.product.name} (Корзина ID: {self.cart.id})"

    def get_total_item_price(self):
        return self.quantity * self.product.price