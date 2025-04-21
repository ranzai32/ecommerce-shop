from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied
from django.conf import settings
from .models import Category, Product, Cart, CartItem
from rest_framework.filters import SearchFilter

from .serializers import (
    CategorySerializer,
    ProductSerializer,
    CartSerializer,
    CartItemSerializer
)

from rest_framework.authentication import TokenAuthentication

try:
    from accounts.serializers import UserSerializer
except ImportError:
    class UserSerializer(serializers.Serializer):
        username = serializers.CharField(read_only=True)

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows categories to be viewed.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny] 
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows products to be viewed.
    """
    queryset = Product.objects.filter(available=True) 
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny] 
    filter_backends = [SearchFilter] 
    search_fields = ['name', 'description', 'category__name']

class CartViewSet(viewsets.GenericViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated] 
    authentication_classes = [TokenAuthentication]
     

    def get_object(self):
        if not self.request.user.is_authenticated:
             raise PermissionDenied("Требуется аутентификация для доступа к корзине.")
        cart, created = Cart.objects.prefetch_related('items__product__category').get_or_create(user=self.request.user)
        return cart

    def retrieve(self, request, *args, **kwargs):
        try:
            cart = self.get_object()
            serializer = self.get_serializer(cart)
            return Response(serializer.data)
        except PermissionDenied as e:
            return Response({'detail': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
             print(f"Error retrieving cart for user {request.user}: {e}")
             return Response({'detail': 'Не удалось получить корзину.'}, status=status.HTTP_400_BAD_REQUEST)

    def add_item(self, request, *args, **kwargs):
        try:
            cart = self.get_object()
            item_serializer = CartItemSerializer(data=request.data, context={'request': request})
            item_serializer.is_valid(raise_exception=True)
            product_id = item_serializer.validated_data['product_id']
            quantity = item_serializer.validated_data['quantity']

            try:
                product = Product.objects.get(id=product_id, available=True)
            except Product.DoesNotExist:
                return Response({'detail': 'Товар не найден или недоступен.'}, status=status.HTTP_404_NOT_FOUND)

            cart_item, created = CartItem.objects.get_or_create(
                cart=cart, product=product, defaults={'quantity': quantity}
            )
            if not created:
                cart_item.quantity += quantity
                cart_item.save()

            cart_serializer = self.get_serializer(cart)
            return Response(cart_serializer.data, status=status.HTTP_200_OK)

        except PermissionDenied as e:
            return Response({'detail': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except serializers.ValidationError as e:
             return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error adding item for user {request.user}: {e}")
            return Response({'detail': 'Ошибка добавления товара в корзину.'}, status=status.HTTP_400_BAD_REQUEST)

    def update_item(self, request, item_id=None, *args, **kwargs):
        try:
            cart = self.get_object()
            try:
                cart_item = cart.items.get(id=item_id)
            except CartItem.DoesNotExist:
                return Response({'detail': 'Товар в корзине не найден.'}, status=status.HTTP_404_NOT_FOUND)

            item_serializer = CartItemSerializer(cart_item, data=request.data, partial=True, context={'request': request})
            item_serializer.is_valid(raise_exception=True)
            validated_quantity = item_serializer.validated_data.get('quantity')
            if validated_quantity is not None:
                 cart_item.quantity = validated_quantity
                 cart_item.save(update_fields=['quantity'])
            else:
                 return Response({'detail': 'Поле quantity обязательно для обновления.'}, status=status.HTTP_400_BAD_REQUEST)

            cart_serializer = self.get_serializer(cart)
            return Response(cart_serializer.data, status=status.HTTP_200_OK)

        except PermissionDenied as e:
             return Response({'detail': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except serializers.ValidationError as e:
             return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
             print(f"Error updating item {item_id} for user {request.user}: {e}")
             return Response({'detail': 'Ошибка обновления товара в корзине.'}, status=status.HTTP_400_BAD_REQUEST)

    def remove_item(self, request, item_id=None, *args, **kwargs):
         try:
            cart = self.get_object()
            try:
                cart_item = cart.items.get(id=item_id)
            except CartItem.DoesNotExist:
                return Response({'detail': 'Товар в корзине не найден.'}, status=status.HTTP_404_NOT_FOUND)

            cart_item.delete()
            cart_serializer = self.get_serializer(cart)
            return Response(cart_serializer.data, status=status.HTTP_200_OK)
         except PermissionDenied as e:
             return Response({'detail': str(e)}, status=status.HTTP_403_FORBIDDEN)
         except Exception as e:
             print(f"Error removing item {item_id} for user {request.user}: {e}")
             return Response({'detail': 'Ошибка удаления товара из корзины.'}, status=status.HTTP_400_BAD_REQUEST)

    def clear_cart(self, request, *args, **kwargs):
         try:
            cart = self.get_object()
            cart.items.all().delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
         except PermissionDenied as e:
             return Response({'detail': str(e)}, status=status.HTTP_403_FORBIDDEN)
         except Exception as e:
             print(f"Error clearing cart for user {request.user}: {e}")
             return Response({'detail': 'Ошибка очистки корзины.'}, status=status.HTTP_400_BAD_REQUEST)