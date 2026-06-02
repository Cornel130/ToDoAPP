# ToDoApp

A full-stack task management application with JWT authentication, multi-factor authentication (TOTP and Email OTP), account security, and admin audit logging.

## Tech Stack

**Backend:** Java 21, Spring Boot 3, Spring Security, PostgreSQL, JPA/Hibernate, JWT

**Frontend:** Angular 19, TypeScript, Angular Material

## Features

- Register and login with JWT-based authentication
- Multi-factor authentication — Google Authenticator (TOTP) or Email OTP
- Account lockout after multiple failed login attempts (auto-unlocks after a configured period)
- Task management — create, edit, delete, sort by deadline
- Admin audit log — tracks login, logout, MFA changes, failed attempts, lockouts
- Each browser tab holds an independent session (sessionStorage)

## Prerequisites

- Java 21
- Node.js 18+
- PostgreSQL
- Maven

## Setup

### 1. Database

Create a PostgreSQL database:

```sql
CREATE DATABASE ToDoAppdb;
```

### 2. Environment Variables

The backend reads configuration from environment variables. Set these before running:

| Variable | Description |
|---|---|
| `DB_URL` | JDBC URL (default: `jdbc:postgresql://localhost:5432/ToDoAppdb`) |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key for signing JWT tokens (min. 32 chars) |
| `MAIL_USERNAME` | Gmail address used to send OTP emails |
| `MAIL_PASSWORD` | Gmail app password |
| `APP_CORS_ALLOWED_ORIGIN` | Frontend origin (default: `http://localhost:4200`) |

For Gmail, you need to generate an App Password from your Google account (not your regular password).

### 3. Backend

```bash
cd backend
mvn spring-boot:run
```

Runs on `http://localhost:9098`. Hibernate will create/update the tables automatically on first run.

### 4. Frontend

```bash
cd frontend
npm install
ng serve
```

Runs on `http://localhost:4200`.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new account |
| POST | `/api/auth/login` | Login — returns token or tempToken if MFA is enabled |
| POST | `/api/auth/logout` | Logout |

### MFA
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/mfa/enable` | Start MFA setup (returns tempToken) |
| GET | `/api/auth/mfa/qr` | Get QR code image for TOTP setup |
| POST | `/api/auth/mfa/setup/verify` | Confirm TOTP setup and activate MFA |
| POST | `/api/auth/mfa/verify` | Verify MFA code during login (TOTP or EMAIL) |
| POST | `/api/auth/mfa/email/send` | Send OTP to email |
| POST | `/api/auth/mfa/disable` | Disable MFA |

### Tasks (requires auth)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks/me` | Get your tasks |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |

Tasks are user-scoped — you can only access your own tasks.

### Audit Logs (requires ADMIN role)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/audit-logs` | Get all audit logs |

## Security Notes

- Passwords are hashed with BCrypt
- JWT tokens expire after 15 minutes
- Temporary MFA tokens expire after 5 minutes
- Email OTP codes expire after 10 minutes
- Account locks after 5 failed login attempts and unlocks automatically after 1 minute
- These values can be adjusted in `application.properties`
