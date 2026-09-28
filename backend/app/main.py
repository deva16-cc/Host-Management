import os
from typing import Generator

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://employee_user:employeepassword@database:3306/employees_db",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

app = FastAPI(title="Employee Management API", version="1.0.0")


class EmployeeCreate(BaseModel):
    name: str
    email: EmailStr
    department: str
    role: str


class Employee(EmployeeCreate):
    id: int


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as exc:
        return {"status": "degraded", "database": "unavailable", "error": str(exc)}


@app.get("/api/employees", response_model=list[Employee])
def list_employees(db: Session = Depends(get_db)):
    rows = db.execute(
        text(
            "SELECT id, name, email, department, role "
            "FROM employees ORDER BY id DESC"
        )
    ).mappings().all()
    return [dict(row) for row in rows]


@app.post("/api/employees", response_model=Employee, status_code=201)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text(
                "INSERT INTO employees (name, email, department, role) "
                "VALUES (:name, :email, :department, :role)"
            ),
            payload.model_dump(),
        )
        db.commit()
        employee_id = result.lastrowid
        row = db.execute(
            text(
                "SELECT id, name, email, department, role "
                "FROM employees WHERE id=:id"
            ),
            {"id": employee_id},
        ).mappings().one()
        return dict(row)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))


@app.put("/api/employees/{employee_id}", response_model=Employee)
def update_employee(
    employee_id: int,
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
):
    existing = db.execute(
        text("SELECT id FROM employees WHERE id=:id"),
        {"id": employee_id},
    ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Employee not found")

    try:
        db.execute(
            text(
                "UPDATE employees SET name=:name, email=:email, "
                "department=:department, role=:role WHERE id=:id"
            ),
            {**payload.model_dump(), "id": employee_id},
        )
        db.commit()
        row = db.execute(
            text(
                "SELECT id, name, email, department, role "
                "FROM employees WHERE id=:id"
            ),
            {"id": employee_id},
        ).mappings().one()
        return dict(row)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))


@app.delete("/api/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    result = db.execute(
        text("DELETE FROM employees WHERE id=:id"),
        {"id": employee_id},
    )
    db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted", "id": employee_id}
