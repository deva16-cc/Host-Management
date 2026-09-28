# Employee Management System

A real 3-tier Employee Management System for AWS/DevOps project readiness.

## Architecture

- Presentation tier: React + Nginx
- Application tier: FastAPI + Uvicorn
- Database tier: MySQL 8
- Local orchestration: Docker Compose
- CI/CD: Jenkins
- Container registry: AWS ECR
- AWS deployment target: EC2

## Features

- Add employees
- List employees
- Edit employees
- Delete employees
- Health check
- Persistent MySQL data
- React frontend served by Nginx
- FastAPI REST API
- Dockerized three-tier architecture

## Local run

```bash
docker compose up -d --build
docker compose ps
```

Open:

http://localhost

API health:

http://localhost/api/health

Stop without deleting containers/volumes:

```bash
docker compose stop
```

Stop and remove containers:

```bash
docker compose down
```

Do not use `docker compose down -v` unless you intentionally want to remove database data.

## API endpoints

- GET `/api/health`
- GET `/api/employees`
- POST `/api/employees`
- PUT `/api/employees/{id}`
- DELETE `/api/employees/{id}`

## Example employee

```json
{
  "name": "Arun Kumar",
  "email": "arun@example.com",
  "department": "DevOps",
  "role": "Engineer"
}
```

## Project structure

```text
employee-management-system/
├── frontend/
├── backend/
├── database/
├── nginx/
├── docs/
├── scripts/
├── docker-compose.yml
├── Jenkinsfile
└── .gitignore
```
