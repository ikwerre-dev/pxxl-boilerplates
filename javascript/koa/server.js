import Koa from "koa";
const port = Number(process.env.PORT || 3000);
const app = new Koa();
app.use((ctx) => {
  ctx.type = "application/json";
  ctx.body = ctx.path === "/health" ? { status: "ok" } : ctx.path === "/api" ? { message: "Hello from Koa" } : { service: "Pxxl Koa API" };
});
app.listen(port, "0.0.0.0");
