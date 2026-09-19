from pathlib import Path

import chromadb
from langchain_chroma import Chroma
from langchain_core.documents import Document as LangchainDocument

from app.core.config import settings
from app.rag.embeddings import get_embeddings


def get_vectorstore(
    collection_name: str = "ai_nexus_documents",
) -> Chroma:
    """
    Create or load the AI-NEXUS ChromaDB vector store.
    """

    vectorstore_path = Path(
        settings.VECTORSTORE_DIR
    ).resolve()

    vectorstore_path.mkdir(
        parents=True,
        exist_ok=True,
    )

    return Chroma(
        collection_name=collection_name,
        embedding_function=get_embeddings(),
        persist_directory=str(vectorstore_path),
    )


def add_document_chunks(
    chunks: list[str],
    document_id: int,
    user_id: int,
    filename: str,
) -> int:
    """
    Convert document chunks into vector embeddings
    and store them in ChromaDB.
    """

    if not chunks:
        return 0

    vectorstore = get_vectorstore()

    documents = []

    for index, chunk in enumerate(chunks):
        documents.append(
            LangchainDocument(
                page_content=chunk,
                metadata={
                    "document_id": document_id,
                    "user_id": user_id,
                    "filename": filename,
                    "chunk_index": index,
                },
            )
        )

    ids = [
        f"doc-{document_id}-chunk-{index}"
        for index in range(len(documents))
    ]

    vectorstore.add_documents(
        documents=documents,
        ids=ids,
    )

    return len(documents)


def search_documents(
    query: str,
    user_id: int,
    top_k: int = 5,
):
    """
    Search the student's documents using
    semantic similarity.
    """

    vectorstore = get_vectorstore()

    results = vectorstore.similarity_search(
        query,
        k=top_k,
        filter={
            "user_id": user_id,
        },
    )

    return results


def retrieve_context(
    query: str,
    user_id: int,
    top_k: int = 5,
) -> list[dict]:
    """
    Convert retrieved Chroma documents into
    a simple structure for the AI pipeline.
    """

    results = search_documents(
        query=query,
        user_id=user_id,
        top_k=top_k,
    )

    context = []

    for document in results:
        context.append(
            {
                "content": document.page_content,
                "metadata": document.metadata,
            }
        )

    return context