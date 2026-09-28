CREATE DATABASE IF NOT EXISTS employees_db;
USE employees_db;

CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO employees (name, email, department, role)
VALUES
('Arun Kumar', 'arun@example.com', 'DevOps', 'Engineer'),
('Priya Sharma', 'priya@example.com', 'Engineering', 'Developer')
ON DUPLICATE KEY UPDATE name = VALUES(name);
