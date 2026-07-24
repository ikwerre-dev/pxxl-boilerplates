package dev.pxxl
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
fun main(){val port=System.getenv("PORT")?.toIntOrNull()?:8080;embeddedServer(Netty,port=port,host="0.0.0.0"){routing{get("/"){call.respondText("""{"service":"Pxxl Ktor API"}""")};get("/health"){call.respondText("""{"status":"ok"}""")};get("/api"){call.respondText("""{"message":"Hello from Ktor"}""")}}}.start(wait=true)}
