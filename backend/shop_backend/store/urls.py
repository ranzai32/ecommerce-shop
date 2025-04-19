from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, CartViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')

cart_urlpatterns = [
    path('', CartViewSet.as_view({'get': 'retrieve'}), name='cart-detail'),
    path('add-item/', CartViewSet.as_view({'post': 'add_item'}), name='cart-add-item'), 
    path('update-item/<int:item_id>/', CartViewSet.as_view({'patch': 'update_item'}), name='cart-update-item'),
    path('remove-item/<int:item_id>/', CartViewSet.as_view({'delete': 'remove_item'}), name='cart-remove-item'), 
    path('clear/', CartViewSet.as_view({'delete': 'clear_cart'}), name='cart-clear'),
]

urlpatterns = [
    path('', include(router.urls)),
    
    path('cart/', include(cart_urlpatterns)),
]