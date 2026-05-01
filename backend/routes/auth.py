"""Authentication routes — login and register."""

from fastapi import APIRouter, HTTPException
from models import LoginRequest, RegisterRequest, AuthResponse
from database import get_db
import sqlite3

router = APIRouter()


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    conn = get_db()
    user = conn.execute(
        "SELECT id, email, name, city, role FROM users WHERE email = ? AND password = ?",
        (req.email, req.password)
    ).fetchone()
    conn.close()

    if not user:
        return AuthResponse(success=False, message="Invalid credentials")

    return AuthResponse(
        success=True,
        user={"id": user["id"], "email": user["email"], "name": user["name"], "city": user["city"], "role": user["role"]},
        message="Login successful"
    )


@router.post("/register", response_model=AuthResponse)
async def register(req: RegisterRequest):
    if req.role not in ("patient", "lender"):
        raise HTTPException(status_code=400, detail="Role must be 'patient' or 'lender'")

    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO users (email, password, name, city, role) VALUES (?, ?, ?, ?, ?)",
            (req.email, req.password, req.name, req.city, req.role)
        )
        conn.commit()
        user = conn.execute(
            "SELECT id, email, name, city, role FROM users WHERE email = ?", (req.email,)
        ).fetchone()
        conn.close()
        return AuthResponse(
            success=True,
            user={"id": user["id"], "email": user["email"], "name": user["name"], "city": user["city"], "role": user["role"]},
            message="Registration successful"
        )
    except sqlite3.IntegrityError:
        conn.close()
        return AuthResponse(success=False, message="Email already registered")
