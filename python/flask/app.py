from flask import Flask, jsonify
app=Flask(__name__)
@app.get("/")
def root(): return jsonify(service="Pxxl Flask API")
@app.get("/health")
def health(): return jsonify(status="ok")
@app.get("/api")
def api(): return jsonify(message="Hello from Flask")
