from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.core.config import settings

import app.models.user
import app.models.student_profile
import app.models.activity
import app.models.project

from app.api.routes import (
    activity,
    analytics,
    assessment,
    auth,
    career,
    chat,
    conversations,
    documents,
    health,
    next_best_action,
    profile,
    projects,
    study,
    users,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-NEXUS",
    description=(
        "Agentic Generative AI System for "
        "Personalized Student Learning, "
        "Career Guidance, and "
        "Employability Enhancement"
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(analytics.router, prefix=API_PREFIX)
app.include_router(assessment.router, prefix=API_PREFIX)
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(career.router, prefix=API_PREFIX)
app.include_router(chat.router, prefix=API_PREFIX)
app.include_router(conversations.router, prefix=API_PREFIX)
app.include_router(documents.router, prefix=API_PREFIX)
app.include_router(health.router, prefix=API_PREFIX)
app.include_router(profile.router, prefix=API_PREFIX)
app.include_router(projects.router, prefix=API_PREFIX)
app.include_router(study.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(next_best_action.router, prefix=API_PREFIX)
app.include_router(activity.router, prefix=API_PREFIX)


@app.get("/")
def root():
    return {
        "name": "AI-NEXUS",
        "version": "1.0.0",
        "status": "online",
        "message": "AI-NEXUS backend is running",
    }




