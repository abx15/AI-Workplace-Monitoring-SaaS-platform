# Fallback entry point for Render
# This file imports the actual FastAPI app from main.py
from main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
