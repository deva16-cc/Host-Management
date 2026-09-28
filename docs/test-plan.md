# Test Plan

## Application tests

1. Open the frontend.
2. Verify seeded employees appear.
3. Add a new employee.
4. Refresh the page and verify persistence.
5. Edit the employee.
6. Delete the employee.
7. Call `/api/health`.
8. Call `/api/employees`.

## Docker tests

```bash
docker compose ps
docker compose logs backend
docker compose logs database
docker network ls
docker volume ls
```

## Useful API tests

```bash
curl http://localhost/api/health
curl http://localhost/api/employees
```
