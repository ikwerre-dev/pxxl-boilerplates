Rails.application.routes.draw do
get "/",to:proc{|_|[200,{"content-type"=>"application/json"},['{"service":"Pxxl Rails API"}']]};get "/health",to:proc{|_|[200,{"content-type"=>"application/json"},['{"status":"ok"}']]};get "/api",to:proc{|_|[200,{"content-type"=>"application/json"},['{"message":"Hello from Rails"}']]};end
