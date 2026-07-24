from litestar import Litestar, get
@get("/")
async def root(): return {"service":"Pxxl Litestar API"}
@get("/health")
async def health(): return {"status":"ok"}
@get("/api")
async def api(): return {"message":"Hello from Litestar"}
app=Litestar([root,health,api])
