#[macro_use]
extern crate rocket;
use rocket::serde::json::{Value, json};
#[get("/")]
fn root() -> Value {
    json!({"service":"Pxxl Rocket API"})
}
#[get("/health")]
fn health() -> Value {
    json!({"status":"ok"})
}
#[get("/api")]
fn api() -> Value {
    json!({"message":"Hello from Rocket"})
}
#[launch]
fn rocket() -> _ {
    let port = std::env::var("PORT")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(8080);
    rocket::custom(rocket::Config {
        address: "0.0.0.0".parse().unwrap(),
        port,
        ..Default::default()
    })
    .mount("/", routes![root, health, api])
}
