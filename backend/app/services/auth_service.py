from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import UserRegister


class AuthService:

    @staticmethod
    def get_user_by_email(
        db: Session,
        email: str,
    ) -> User | None:

        result = db.execute(
            select(User).where(
                User.email == email.lower()
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    def register_user(
        db: Session,
        user_data: UserRegister,
    ) -> User:

        existing_user = AuthService.get_user_by_email(
            db,
            user_data.email,
        )

        if existing_user:
            raise ValueError(
                "A user with this email already exists."
            )

        user = User(
            full_name=user_data.full_name.strip(),
            email=user_data.email.lower(),
            password_hash=hash_password(
                user_data.password
            ),
            role="student",
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    def authenticate_user(
        db: Session,
        email: str,
        password: str,
    ) -> User | None:

        user = AuthService.get_user_by_email(
            db,
            email,
        )

        if not user:
            return None

        if not user.is_active:
            return None

        if not verify_password(
            password,
            user.password_hash,
        ):
            return None

        return user

    @staticmethod
    def create_user_token(
        user: User,
    ) -> str:

        return create_access_token(
            subject=str(user.id)
        )