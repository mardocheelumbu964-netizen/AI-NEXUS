from flask import Flask, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)


@app.get("/")
def home():
    return jsonify({
        "service": "AI-NEXUS Flask Analytics Service",
        "status": "online",
        "message": "Analytics microservice is running."
    })


@app.get("/health")
def health():
    return jsonify({
        "status": "healthy",
        "service": "flask-analytics",
        "timestamp": datetime.now().isoformat()
    })


@app.get("/api/analytics/overview")
def analytics_overview():
    return jsonify({
        "learning_progress": 78,
        "study_consistency": 84,
        "career_readiness": 68,
        "assessment_average": 76,
        "resume_score": 74,
        "interview_readiness": 61
    })


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
