from sanic import Sanic
from sanic.response import json
app=Sanic("pxxl")
@app.get("/")
async def root(request): return json({"service":"Pxxl Sanic API"})
@app.get("/health")
async def health(request): return json({"status":"ok"})
@app.get("/api")
async def api(request): return json({"message":"Hello from Sanic"})
