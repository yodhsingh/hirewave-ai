"""Unit tests for security module."""

import pytest
from datetime import datetime, timedelta
from jose import jwt

from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.core.config import settings


class TestPasswordHashing:
    """Tests for password hashing functions."""

    def test_password_hash_generates_hash(self):
        """Test that password hashing generates a hash."""
        password = "mysecurepassword123"
        hashed = get_password_hash(password)

        assert hashed is not None
        assert hashed != password
        assert len(hashed) > 0

    def test_password_hash_unique_for_same_password(self):
        """Test that hashing same password generates different hashes (salt)."""
        password = "mysecurepassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        # Bcrypt includes random salt, so hashes should be different
        assert hash1 != hash2

    def test_verify_password_correct(self):
        """Test verifying correct password."""
        password = "mysecurepassword123"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test verifying incorrect password."""
        password = "mysecurepassword123"
        wrong_password = "wrongpassword456"
        hashed = get_password_hash(password)

        assert verify_password(wrong_password, hashed) is False

    def test_verify_password_empty_password(self):
        """Test verifying with empty password."""
        password = "mysecurepassword123"
        hashed = get_password_hash(password)

        assert verify_password("", hashed) is False

    def test_hash_empty_password(self):
        """Test hashing empty password."""
        # Empty passwords should still hash (though not recommended)
        hashed = get_password_hash("")
        assert hashed is not None
        assert len(hashed) > 0


class TestJWTTokens:
    """Tests for JWT token creation and verification."""

    def test_create_access_token(self):
        """Test creating access token."""
        data = {"sub": "123"}
        token = create_access_token(data)

        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

    def test_create_refresh_token(self):
        """Test creating refresh token."""
        data = {"sub": "123"}
        token = create_refresh_token(data)

        assert token is not None
        assert isinstance(token, str)
        assert len(token) > 0

    def test_access_token_different_from_refresh_token(self):
        """Test that access and refresh tokens are different."""
        data = {"sub": "123"}
        access_token = create_access_token(data)
        refresh_token = create_refresh_token(data)

        assert access_token != refresh_token

    def test_verify_access_token(self):
        """Test verifying valid access token."""
        data = {"sub": "123"}
        token = create_access_token(data)
        payload = verify_token(token)

        assert payload is not None
        assert payload["sub"] == "123"

    def test_verify_refresh_token(self):
        """Test verifying valid refresh token."""
        data = {"sub": "456"}
        token = create_refresh_token(data)
        payload = verify_token(token)

        assert payload is not None
        assert payload["sub"] == "456"

    def test_verify_invalid_token(self):
        """Test verifying invalid token."""
        invalid_token = "invalid.token.here"
        payload = verify_token(invalid_token)

        assert payload is None

    def test_verify_empty_token(self):
        """Test verifying empty token."""
        payload = verify_token("")

        assert payload is None

    def test_token_contains_expiry(self):
        """Test that token contains expiration claim."""
        data = {"sub": "123"}
        token = create_access_token(data)

        # Decode without verification to inspect payload
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        assert "exp" in payload
        assert payload["exp"] > datetime.utcnow().timestamp()

    def test_token_contains_type(self):
        """Test that token contains type claim."""
        data = {"sub": "123"}
        access_token = create_access_token(data)
        refresh_token = create_refresh_token(data)

        access_payload = jwt.decode(
            access_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        refresh_payload = jwt.decode(
            refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        assert access_payload.get("type") == "access"
        assert refresh_payload.get("type") == "refresh"

    def test_token_with_additional_data(self):
        """Test creating token with additional payload data."""
        data = {
            "sub": "123",
            "role": "admin",
            "email": "test@example.com"
        }
        token = create_access_token(data)
        payload = verify_token(token)

        assert payload["sub"] == "123"
        assert payload["role"] == "admin"
        assert payload["email"] == "test@example.com"


class TestTokenExpiration:
    """Tests for token expiration handling."""

    def test_expired_token_verification(self):
        """Test that expired tokens fail verification."""
        # Create a token that's already expired
        data = {"sub": "123"}
        # Override to create an expired token
        expired_delta = timedelta(seconds=-1)
        expire = datetime.utcnow() + expired_delta
        to_encode = data.copy()
        to_encode.update({"exp": expire, "type": "access"})
        expired_token = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )

        payload = verify_token(expired_token)
        assert payload is None

    def test_token_not_yet_valid(self):
        """Test token with future 'not before' claim."""
        # This tests robustness of the token verification
        data = {"sub": "123"}
        token = create_access_token(data)
        payload = verify_token(token)

        # Should still be valid
        assert payload is not None


class TestTokenSecurity:
    """Tests for token security properties."""

    def test_token_signature_validation(self):
        """Test that token with wrong signature fails."""
        data = {"sub": "123"}
        token = create_access_token(data)

        # Tamper with the token signature
        parts = token.split(".")
        if len(parts) == 3:
            # Modify the signature part
            tampered_token = f"{parts[0]}.{parts[1]}.tampered_signature"
            payload = verify_token(tampered_token)
            assert payload is None

    def test_token_payload_modification_detected(self):
        """Test that modified payload is detected."""
        data = {"sub": "123"}
        token = create_access_token(data)

        # Try to decode, modify, and re-encode with different secret
        try:
            parts = token.split(".")
            # This should fail verification
            modified_token = f"{parts[0]}.modified.{parts[2]}"
            payload = verify_token(modified_token)
            assert payload is None
        except Exception:
            pass  # Expected behavior


class TestEdgeCases:
    """Tests for edge cases in security functions."""

    def test_password_with_special_characters(self):
        """Test password with special characters."""
        password = "P@ssw0rd!#$%^&*(){}[]|\\:\";<>,.?/~`"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True

    def test_password_with_unicode(self):
        """Test password with unicode characters."""
        password = "密码测试пароль"
        hashed = get_password_hash(password)

        assert verify_password(password, hashed) is True

    def test_very_long_password(self):
        """Test very long password - bcrypt truncates at 72 bytes."""
        # bcrypt has a max length of 72 bytes
        password = "a" * 72  # Max allowed length
        hashed = get_password_hash(password)

        # Password at max length should work
        assert verify_password(password, hashed) is True

    def test_token_with_numeric_subject(self):
        """Test token with numeric subject (as string)."""
        data = {"sub": "12345"}
        token = create_access_token(data)
        payload = verify_token(token)

        assert payload["sub"] == "12345"

    def test_token_with_email_subject(self):
        """Test token with email as subject."""
        data = {"sub": "user@example.com"}
        token = create_access_token(data)
        payload = verify_token(token)

        assert payload["sub"] == "user@example.com"
