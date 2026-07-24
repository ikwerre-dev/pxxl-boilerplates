import http from "node:http";
const port = Number(process.env.PORT || 3000);
const server = http.createServer((req, res) => {
  res.setHeader("content-type", "application/json");
  if (req.url === "/health") return res.end(JSON.stringify({ status: "ok" }));
  if (req.url === "/api") return res.end(JSON.stringify({ message: "Hello from Node.js" }));
  res.end(JSON.stringify({ service: "Pxxl Node API" }));
});
server.listen(port, "0.0.0.0", () => console.log(`Listening on :${port}`));
