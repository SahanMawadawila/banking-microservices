# Banking Microservices Platform

A full-featured banking application built with Spring Boot microservices architecture, RabbitMQ for async messaging, and database-per-service pattern.

## Architecture

```
                        ┌─────────────────────────┐
                        │   API Gateway (:8080)    │
                        │  JWT Auth + Routing      │
                        └──┬──┬──┬──┬──┬──────────┘
                           │  │  │  │  │
          ┌────────────────┘  │  │  │  └────────────────┐
          ▼                   ▼  │  ▼                   ▼
┌──────────────┐  ┌──────────────┐│ ┌──────────────┐  ┌──────────────┐
│   Identity   │  │   Account    ││ │    Loan      │  │ Notification │
│   Service    │  │   Service    ││ │   Service    │  │   Service    │
│   :8081      │  │   :8082      ││ │   :8084      │  │   :8085      │
│  PostgreSQL  │  │  PostgreSQL  ││ │  PostgreSQL  │  │   MongoDB    │
└──────────────┘  └──────────────┘│ └──────────────┘  └──────────────┘
                                  ▼
                        ┌──────────────┐
                        │ Transaction  │
                        │   Service    │
                        │   :8083      │
                        │  PostgreSQL  │
                        └──────────────┘
                              │
                     ┌────────┴────────┐
                     │    RabbitMQ     │
                     │  :5672/:15672   │
                     └─────────────────┘
```

## Services

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| API Gateway | 8080 | — | Routes requests, validates JWT tokens |
| Identity Service | 8081 | PostgreSQL | User registration, login, JWT auth |
| Account Service | 8082 | PostgreSQL | Bank account management |
| Transaction Service | 8083 | PostgreSQL | Deposits, withdrawals, transfers |
| Loan Service | 8084 | PostgreSQL | Loan applications & lifecycle |
| Notification Service | 8085 | MongoDB | In-app notifications |

## RabbitMQ Event Flows

| Producer | Event | Consumer | Action |
|----------|-------|----------|--------|
| Identity | `USER_REGISTERED` | Account | Auto-create savings account |
| Transaction | `TRANSACTION_COMPLETED` | Account | Update account balance |
| Transaction | `TRANSACTION_COMPLETED` | Notification | Send transaction notification |
| Loan | `LOAN_STATUS_CHANGED` | Notification | Send loan status notification |
| Loan | `LOAN_DISBURSED` | Account | Credit loan amount to account |

## Quick Start

### Run with Docker Compose

```bash
docker compose up --build
```

This starts all services including:
- 4x PostgreSQL databases
- 1x MongoDB
- 1x RabbitMQ (Management UI at http://localhost:15672, guest/guest)
- 6x Application services

### API Endpoints

**Identity Service** (`/api/identity`)
- `POST /register` — Register a new user
- `POST /login` — Login and get JWT token
- `GET /validate?token=` — Validate a JWT token

**Account Service** (`/api/accounts`)
- `GET /user/{userId}` — Get user's accounts
- `GET /number/{accountNumber}` — Get account by number
- `POST /` — Create account
- `PUT /{id}/status?status=` — Update account status

**Transaction Service** (`/api/transactions`)
- `POST /deposit` — Deposit money
- `POST /withdraw` — Withdraw money
- `POST /transfer` — Transfer between accounts
- `GET /account/{accountNumber}` — Transaction history

**Loan Service** (`/api/loans`)
- `POST /apply` — Apply for a loan
- `GET /user/{userId}` — Get user's loans
- `PUT /{id}/approve` — Approve loan
- `PUT /{id}/reject` — Reject loan
- `PUT /{id}/disburse` — Disburse approved loan

**Notification Service** (`/api/notifications`)
- `GET /{userId}` — Get notifications
- `PUT /{id}/read` — Mark as read
- `GET /{userId}/unread-count` — Unread count

### Example Flow

```bash
# 1. Register a user (auto-creates savings account via RabbitMQ)
curl -X POST http://localhost:8080/api/identity/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@example.com","password":"password123"}'

# 2. Login to get JWT token
curl -X POST http://localhost:8080/api/identity/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# 3. Get user's accounts (use JWT token from login)
curl http://localhost:8080/api/accounts/user/1 \
  -H "Authorization: Bearer <JWT_TOKEN>"

# 4. Deposit money
curl -X POST http://localhost:8080/api/transactions/deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"accountNumber":"<ACCOUNT_NUMBER>","amount":1000,"userId":1}'

# 5. Check notifications
curl http://localhost:8080/api/notifications/1 \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

## Tech Stack

- **Java 17** + **Spring Boot 4.0.5**
- **Spring Cloud Gateway** (API Gateway)
- **Spring Data JPA** (PostgreSQL)
- **Spring Data MongoDB** (Notifications)
- **Spring AMQP** (RabbitMQ)
- **Spring Security** + **JWT** (Authentication)
- **Docker Compose** (Local deployment)
