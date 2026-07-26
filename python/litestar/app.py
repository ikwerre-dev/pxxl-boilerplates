from litestar import Litestar, get
@get("/")
async def root() -> dict[str, str]: return {"service":"Pxxl Litestar API"}
@get("/health")
async def health() -> dict[str, str]: return {"status":"ok"}
@get("/api")
async def api() -> dict[str, str]: return {"message":"Hello from Litestar"}
app=Litestar([root,health,api])
