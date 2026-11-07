from fastapi import FastAPI

app = FastAPI(title="Cérvix-AI")

@app.get("/api/salud")
def salud():
    return {"estado": "ok"}