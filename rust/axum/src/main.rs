use axum::{Json, Router, routing::get};
use serde_json::{Value, json};
#[tokio::main]
async fn main() {
    let app = Router::new()
        .route(
            "/",
            get(|| async { Json(json!({"service":"Pxxl Axum API"})) }),
        )
        .route("/health", get(|| async { Json(json!({"status":"ok"})) }))
        .route(
            "/api",
            get(|| async { Json(json!({"message":"Hello from Axum"})) }),
        );
    let port = std::env::var("PORT").unwrap_or("8080".into());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}
