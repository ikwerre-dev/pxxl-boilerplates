<?php
use CodeIgniter\Router\RouteCollection;/** @var RouteCollection $routes */$routes->get("/",fn()=>service("response")->setJSON(["service"=>"Pxxl CodeIgniter API"]));$routes->get("health",fn()=>service("response")->setJSON(["status"=>"ok"]));$routes->get("api",fn()=>service("response")->setJSON(["message"=>"Hello from CodeIgniter"]));
