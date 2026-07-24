from starlette.applications import Starlette
from starlette.responses import JSONResponse
from starlette.routing import Route
async def root(request): return JSONResponse({"service":"Pxxl Starlette API"})
async def health(request): return JSONResponse({"status":"ok"})
async def api(request): return JSONResponse({"message":"Hello from Starlette"})
app=Starlette(routes=[Route("/",root),Route("/health",health),Route("/api",api)])
