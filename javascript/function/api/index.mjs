export default function handler(request) {
  const url = new URL(request.url);
  return Response.json({
    service: "Pxxl JavaScript Function",
    status: url.pathname === "/health" ? "ok" : "ready",
    message: url.pathname === "/api" ? "Hello from a Pxxl function" : undefined,
    method: request.method,
    path: url.pathname
  });
}
