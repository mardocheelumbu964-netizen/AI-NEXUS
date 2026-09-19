from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User


password_hash = PasswordHash.recommended()


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)


def hash_password(password: str) -> str:
    """Hash a user's password securely."""

    return password_hash.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """Verify a plain password against its stored hash."""

    return password_hash.verify(
        plain_password,
        hashed_password,
    )


def create_access_token(
    subject: str,
    expires_delta: timedelta | None = None,
) -> str:
    """Create a JWT access token."""

    if expires_delta is None:
        expires_delta = timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    expire = datetime.now(timezone.utc) + expires_delta

    payload = {
        "sub": subject,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def decode_access_token(
    token: str,
) -> dict | None:
    """Decode and validate a JWT access token."""

    try:

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        if not payload.get("sub"):
            return None

        return payload

    except JWTError:

        return None


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Return the currently authenticated user.

    The JWT subject is normally the user's database ID.
    For compatibility, email/username subjects are also
    supported if the token was created using those values.
    """

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials.",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )

    payload = decode_access_token(token)

    if payload is None:
        raise credentials_exception

    subject = payload.get("sub")

    if not subject:
        raise credentials_exception

    user = None

    # --------------------------------------------------
    # Preferred lookup: database user ID
    # --------------------------------------------------

    try:

        user_id = int(subject)

        user = (
            db.query(User)
            .filter(
                User.id == user_id
            )
            .first()
        )

    except (ValueError, TypeError):

        user = None

    # --------------------------------------------------
    # Compatibility lookup: email
    # --------------------------------------------------

    if user is None and hasattr(User, "email"):

        user = (
            db.query(User)
            .filter(
                User.email == subject
            )
            .first()
        )

    # --------------------------------------------------
    # Compatibility lookup: username
    # --------------------------------------------------

    if user is None and hasattr(User, "username"):

        user = (
            db.query(User)
            .filter(
                User.username == subject
            )
            .first()
        )

    if user is None:
        raise credentials_exception

    return user
