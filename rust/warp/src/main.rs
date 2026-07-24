use serde_json::json;
use warp::Filter;
#[tokio::main]
async fn main() {
    let root = warp::path::end().map(|| warp::reply::json(&json!({"service":"Pxxl Warp API"})));
    let health = warp::path("health").map(|| warp::reply::json(&json!({"status":"ok"})));
    let api = warp::path("api").map(|| warp::reply::json(&json!({"message":"Hello from Warp"})));
    let port = std::env::var("PORT")
        .unwrap_or("8080".into())
        .parse()
        .unwrap();
    warp::serve(root.or(health).or(api))
        .run(([0, 0, 0, 0], port))
        .await
}
