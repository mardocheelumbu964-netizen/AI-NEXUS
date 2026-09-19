import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document
from app.rag.pipeline import process_document
from app.utils.file_parser import (
    get_file_extension,
    is_supported_file,
)


class DocumentService:

    @staticmethod
    def save_upload(
        db: Session,
        upload_file: UploadFile,
        user_id: int,
    ) -> Document:

        original_filename = (
            upload_file.filename
            or "unknown_file"
        )

        extension = get_file_extension(
            original_filename
        )

        if not is_supported_file(
            original_filename
        ):
            raise ValueError(
                "Unsupported file type. "
                "Allowed: PDF, DOCX, PPTX, TXT."
            )

        upload_dir = Path(
            settings.UPLOAD_DIR
        ).resolve()

        upload_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        unique_filename = (
            f"{uuid.uuid4().hex}"
            f"{extension}"
        )

        file_path = upload_dir / unique_filename

        total_size = 0
        max_size = (
            settings.MAX_UPLOAD_SIZE_MB
            * 1024
            * 1024
        )

        with open(file_path, "wb") as output:

            while True:

                chunk = upload_file.file.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > max_size:

                    output.close()

                    file_path.unlink(
                        missing_ok=True
                    )

                    raise ValueError(
                        f"File exceeds the maximum "
                        f"size of "
                        f"{settings.MAX_UPLOAD_SIZE_MB} MB."
                    )

                output.write(chunk)

        document = Document(
            user_id=user_id,
            original_filename=original_filename,
            stored_filename=unique_filename,
            file_type=extension,
            file_path=str(file_path),
            file_size=total_size,
            status="uploaded",
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        try:

            result = process_document(
                file_path=str(file_path),
                file_extension=extension,
                document_id=document.id,
                user_id=user_id,
                filename=original_filename,
            )

            document.extracted_text = result[
                "text"
            ]

            document.status = "processed"

            db.commit()
            db.refresh(document)

        except Exception:

            document.status = "processing_failed"

            db.commit()

            raise

        return document

    @staticmethod
    def get_user_documents(
        db: Session,
        user_id: int,
    ) -> list[Document]:

        result = db.execute(
            select(Document)
            .where(Document.user_id == user_id)
            .order_by(
                Document.created_at.desc()
            )
        )

        return list(result.scalars().all())

    @staticmethod
    def get_document(
        db: Session,
        document_id: int,
        user_id: int,
    ) -> Document | None:

        result = db.execute(
            select(Document).where(
                Document.id == document_id,
                Document.user_id == user_id,
            )
        )

        return result.scalar_one_or_none()