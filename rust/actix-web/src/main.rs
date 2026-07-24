use actix_web::{App, HttpServer, Responder, get, web::Json};
use serde_json::{Value, json};
#[get("/")]
async fn root() -> impl Responder {
    Json(json!({"service":"Pxxl Actix API"}))
}
#[get("/health")]
async fn health() -> impl Responder {
    Json(json!({"status":"ok"}))
}
#[get("/api")]
async fn api() -> impl Responder {
    Json(json!({"message":"Hello from Actix"}))
}
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port = std::env::var("PORT")
        .unwrap_or("8080".into())
        .parse()
        .unwrap();
    HttpServer::new(|| App::new().service(root).service(health).service(api))
        .bind(("0.0.0.0", port))?
        .run()
        .await
}
