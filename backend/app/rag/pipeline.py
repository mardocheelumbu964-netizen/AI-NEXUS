from app.rag.chunker import split_text
from app.rag.retriever import add_document_chunks
from app.utils.file_parser import extract_text


def process_document(
    file_path: str,
    file_extension: str,
    document_id: int,
    user_id: int,
    filename: str,
) -> dict:

    text = extract_text(
        file_path,
        file_extension,
    )

    if not text.strip():
        raise ValueError(
            "No readable text was found in the document."
        )

    chunks = split_text(text)

    if not chunks:
        raise ValueError(
            "Document could not be divided into chunks."
        )

    chunks_added = add_document_chunks(
        chunks=chunks,
        document_id=document_id,
        user_id=user_id,
        filename=filename,
    )

    return {
        "text": text,
        "chunk_count": len(chunks),
        "chunks_added": chunks_added,
    }