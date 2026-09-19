from langchain_community.embeddings import (
    HuggingFaceEmbeddings,
)

from app.core.config import settings


_embeddings = None


def get_embeddings() -> HuggingFaceEmbeddings:

    global _embeddings

    if _embeddings is None:

        _embeddings = HuggingFaceEmbeddings(
            model_name=settings.EMBEDDING_MODEL,
            model_kwargs={
                "device": "cpu",
            },
            encode_kwargs={
                "normalize_embeddings": True,
            },
        )

    return _embeddings