import Fastify from "fastify";
const port = Number(process.env.PORT || 3000);
const app = Fastify({ logger: true });
app.get("/", async () => ({ service: "Pxxl Fastify API" }));
app.get("/health", async () => ({ status: "ok" }));
app.get("/api", async () => ({ message: "Hello from Fastify" }));
await app.listen({ port, host: "0.0.0.0" });
