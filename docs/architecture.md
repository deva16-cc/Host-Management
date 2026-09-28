# Employee Management System - Architecture

## Three Tiers

### Presentation Tier
React is built into static assets and served by Nginx.

### Application Tier
FastAPI exposes REST APIs for employee CRUD operations.

### Database Tier
MySQL stores employee records using a persistent Docker volume.

## Request Flow

```text
Browser
   |
   v
Nginx / React
   |
   | /api/*
   v
FastAPI
   |
   | SQL
   v
MySQL
```

## CI/CD Flow

```text
Developer
   |
   v
GitHub
   |
   v
Jenkins
   |
   +--> Validate
   |
   +--> Docker Build
   |
   +--> Deploy/Test
   |
   v
Application
```

## AWS Target

```text
Internet
   |
   v
AWS EC2
   |
   +--> Nginx / Frontend
   |
   +--> FastAPI
   |
   +--> MySQL
```

For a production-style extension, the database tier can be moved to Amazon RDS and the application can be placed behind an Application Load Balancer.
