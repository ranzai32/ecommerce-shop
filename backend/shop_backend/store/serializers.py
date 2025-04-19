from rest_framework import serializers
from .models import Category, Product, Cart, CartItem
from accounts.serializers import UserSerializer

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug'] 

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'category', 
            'name',
            'slug',
            'description',
            'price',
            'image', 
            'available',    
        ]

class CartItemProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'image', 'slug']


class CartItemSerializer(serializers.ModelSerializer):
    product = CartItemProductSerializer(read_only=True) 
    total_item_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, source='get_total_item_price') 
    product_id = serializers.IntegerField(write_only=True) 

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'total_item_price', 'product_id']
        read_only_fields = ['id', 'product', 'total_item_price'] 

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value


class CartSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) 
    items = CartItemSerializer(many=True, read_only=True) 
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, source='get_total_price') 
    total_quantity = serializers.IntegerField(read_only=True, source='get_total_quantity') 

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price', 'total_quantity', 'created_at', 'updated_at']
        