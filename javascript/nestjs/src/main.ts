import "reflect-metadata";
import { Controller, Get, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
@Controller() class AppController { @Get() root() { return { service: "Pxxl NestJS API" }; } @Get("health") health() { return { status: "ok" }; } @Get("api") api() { return { message: "Hello from NestJS" }; } }
@Module({ controllers: [AppController] }) class AppModule {}
async function bootstrap() { const app = await NestFactory.create(AppModule); await app.listen(Number(process.env.PORT || 3000), "0.0.0.0"); }
bootstrap();
