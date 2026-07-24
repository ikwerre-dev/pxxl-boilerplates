from django.http import JsonResponse
from django.urls import path
urlpatterns=[path("",lambda r:JsonResponse({"service":"Pxxl Django API"})),path("health",lambda r:JsonResponse({"status":"ok"})),path("api",lambda r:JsonResponse({"message":"Hello from Django"}))]
