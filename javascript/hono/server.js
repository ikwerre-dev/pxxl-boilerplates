import { serve } from "@hono/node-server";
import { Hono } from "hono";
const port = Number(process.env.PORT || 3000);
const app = new Hono();
app.get("/", (c) => c.json({ service: "Pxxl Hono API" }));
app.get("/health", (c) => c.json({ status: "ok" }));
app.get("/api", (c) => c.json({ message: "Hello from Hono" }));
serve({ fetch: app.fetch, port, hostname: "0.0.0.0" });
