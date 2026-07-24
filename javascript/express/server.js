import express from "express";
const port = Number(process.env.PORT || 3000);
const app = express();
app.use(express.json());
app.get("/", (_req, res) => res.json({ service: "Pxxl Express API" }));
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/api", (_req, res) => res.json({ message: "Hello from Express" }));
app.listen(port, "0.0.0.0", () => console.log(`Listening on :${port}`));
