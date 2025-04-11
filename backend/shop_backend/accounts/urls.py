from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)  

urlpatterns = [
    path('', include(router.urls)),
    path('register/', views.UserRegistrationViewSet.as_view({'post': 'create'}), name='user-register'),
    path('login/', views.UserLoginViewSet.as_view({'post': 'create'}), name='user-login'),
    path('validate-token/', views.ValidateTokenView.as_view(), name='validate-token'),
]