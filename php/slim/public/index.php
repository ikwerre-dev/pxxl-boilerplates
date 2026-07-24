<?php
require __DIR__."/../vendor/autoload.php";
use Slim\Factory\AppFactory;
$app=AppFactory::create();
$app->get("/",fn($q,$r)=>$r->withHeader("Content-Type","application/json")->write(json_encode(["service"=>"Pxxl Slim API"])));
$app->get("/health",fn($q,$r)=>$r->withHeader("Content-Type","application/json")->write(json_encode(["status"=>"ok"])));
$app->get("/api",fn($q,$r)=>$r->withHeader("Content-Type","application/json")->write(json_encode(["message"=>"Hello from Slim"])));
$app->run();
