# AuctXI — Docker Deployment Plan

## Project Overview

AuctXI is a **microservices-based auction platform** with the following services — each already has a `Dockerfile`:

| Service | Tech Stack | Current Dev Port | Role |
|---|---|---|---|
| `frontend` | Vite + React → Nginx | 80 | UI served by Nginx |
| `api-gateway` | Node.js 20 / Express | 3000 | JWT auth + reverse proxy |
| `core-service` | Spring Boot 4 / Java 21 / MySQL | 8080 | Main business logic, JPA, WebSocket, AMQP |
| `ai-service` | Python 3.12 / FastAPI / Uvicorn | 8000 (env: 5003) | RAG, LLM (Groq/Ollama), Redis chat history |
| `PaymentService` | ASP.NET 10 / Razorpay | 5001 | Payment processing |
| `NotificationService` | ASP.NET 10 / RabbitMQ / MySQL | (auto) | Email & push notifications |

**Infrastructure dependencies** discovered from configs and code:
- **MySQL** — used by `core-service` (JPA) and `NotificationService` (Pomelo EF Core)
- **RabbitMQ** — used by `core-service` (spring-boot-starter-amqp) and `NotificationService` (RabbitMQ.Client)
- **Redis** — used by `ai-service` for chat history TTL

---

## Architecture Diagram

```
                         ┌─────────────────────────────────────────┐
                         │              Docker Network              │
                         │              auctxi-network              │
  Browser ──────────────►│                                          │
                         │  ┌──────────┐    ┌──────────────────┐   │
                         │  │ frontend │    │   api-gateway    │   │
                         │  │  :80     │    │     :3000        │   │
                         │  └──────────┘    └────────┬─────────┘   │
                         │                           │              │
                         │          ┌────────────────┼──────────┐  │
                         │          │                │          │  │
                         │  ┌───────▼──────┐  ┌─────▼──────┐  │  │
                         │  │ core-service │  │ ai-service │  │  │
                         │  │   :8080      │  │  :8000     │  │  │
                         │  └──────┬───────┘  └─────┬──────┘  │  │
                         │         │                 │         │  │
                         │   ┌─────▼──────────┐ ┌───▼───┐    │  │
                         │   │  PaymentSvc    │ │ Redis │    │  │
                         │   │    :5001       │ │ :6379 │    │  │
                         │   └────────────────┘ └───────┘    │  │
                         │                                    │  │
                         │  ┌──────────────────┐  ┌────────┐ │  │
                         │  │NotificationService│  │MySQL   │ │  │
                         │  │   :8082           │  │ :3306  │ │  │
                         │  └──────────────────┘  └────────┘ │  │
                         │                                    │  │
                         │              ┌──────────┐          │  │
                         │              │ RabbitMQ │          │  │
                         │              │:5672/15672│         │  │
                         │              └──────────┘          │  │
                         └─────────────────────────────────────────┘
```

---

## Files to Create

### 1. Root `docker-compose.yml`

The single orchestration file at `git_auctxi/docker-compose.yml` that brings up all 9 containers.

**Services defined:**

| Container Name | Image Built From | Ports Exposed |
|---|---|---|
| `mysql` | `mysql:8.0` (official) | `3306:3306` |
| `rabbitmq` | `rabbitmq:3-management` (official) | `5672:5672`, `15672:15672` (mgmt UI) |
| `redis` | `redis:7-alpine` (official) | `6379:6379` |
| `core-service` | `./backend/core-service` | `8080:8080` |
| `notification-service` | `./backend/NotificationService` | `8082:8080` |
| `payment-service` | `./backend/PaymentService` | `5001:80` |
| `ai-service` | `./backend/ai-service` | `8000:8000` |
| `api-gateway` | `./backend/api-gateway` | `3000:3000` |
| `frontend` | `./frontend` | `80:80` |

**`depends_on` start ordering:**
```
mysql, rabbitmq, redis
    └──► core-service
    └──► notification-service
             └──► api-gateway
    └──► payment-service
             └──► api-gateway
    └──► ai-service (redis)
             └──► api-gateway
                      └──► frontend (optional, frontend is static)
```

**Single Docker network:** `auctxi-network` (bridge). All service-to-service calls use container names as hostnames.

---

### 2. Environment Variable Strategy

> [!IMPORTANT]
> The gateway's `index.js` currently hardcodes `localhost` URLs for all downstream services. In Docker, services communicate via **container names**, not localhost. This needs to be updated via environment variables.

**Root `.env` file** (`git_auctxi/.env`) will hold all secrets & config. It is referenced by `docker-compose.yml` via `env_file:` or inline `environment:` blocks.

#### Variables needed per service:

**`core-service` (Spring Boot):**
```
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/auctxi_db
SPRING_DATASOURCE_USERNAME=auctxi_user
SPRING_DATASOURCE_PASSWORD=<secret>
SPRING_RABBITMQ_HOST=rabbitmq
JWT_SECRET=<base64-secret>
SPRING_MAIL_HOST=smtp.example.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=<email>
SPRING_MAIL_PASSWORD=<secret>
```

**`notification-service` (ASP.NET):**
```
ConnectionStrings__DefaultConnection=Server=mysql;Port=3306;Database=notification_db;User=auctxi_user;Password=<secret>
RabbitMQ__Host=rabbitmq
Smtp__Host=smtp.example.com
Smtp__Username=<email>
Smtp__Password=<secret>
```

**`payment-service` (ASP.NET):**
```
Razorpay__KeyId=<your_key_id>
Razorpay__KeySecret=<your_key_secret>
```

**`ai-service` (Python):**
```
LLM_PROVIDER=groq
GROQ_API_KEY=<your_groq_api_key>
GROQ_MODEL=llama-3.1-8b-instant
SPRING_BOOT_URL=http://core-service:8080
AI_INTERNAL_TOKEN=<secret>
REDIS_HOST=redis
REDIS_PORT=6379
AI_SERVICE_PORT=8000
FAISS_INDEX_PATH=./faiss_index
```

**`api-gateway` (Node.js):**
```
PORT=3000
JWT_SECRET=<same-base64-secret-as-core-service>
PAYMENT_SERVICE_URL=http://payment-service:80
AI_SERVICE_URL=http://ai-service:8000
CORE_SERVICE_URL=http://core-service:8080
```

**`mysql` (infra):**
```
MYSQL_ROOT_PASSWORD=<root_secret>
MYSQL_DATABASE=auctxi_db
MYSQL_USER=auctxi_user
MYSQL_PASSWORD=<secret>
```

---

### 3. Nginx Config for Frontend

The frontend Dockerfile already uses `nginx:alpine`. A custom `nginx.conf` should be added to the `frontend/` directory to:
- Serve the built React SPA from `/usr/share/nginx/html`
- Proxy `/api` and `/uploads` requests to `api-gateway:3000` (so the browser only talks to one origin — port 80)
- Handle React Router's client-side routing with `try_files $uri /index.html`

> [!NOTE]
> This eliminates CORS issues entirely since the browser sees a single origin (port 80), and Nginx handles routing to the gateway internally within the Docker network.

---

### 4. Volume Strategy (Persistence)

| Volume Name | Mounted Into | Purpose |
|---|---|---|
| `mysql-data` | `mysql:/var/lib/mysql` | Database persistence across restarts |
| `rabbitmq-data` | `rabbitmq:/var/lib/rabbitmq` | Queue persistence |
| `redis-data` | `redis:/data` | Cache persistence (optional) |
| `core-uploads` | `core-service:/app/uploads` | Uploaded auction images |
| `faiss-index` | `ai-service:/app/faiss_index` | Vector store persistence |

---

### 5. Health Checks

> [!TIP]
> Adding health checks ensures Docker only starts dependent services once the dependency is truly ready (not just "started").

| Service | Health Check Command |
|---|---|
| `mysql` | `mysqladmin ping -h localhost` |
| `rabbitmq` | `rabbitmq-diagnostics check_port_connectivity` |
| `redis` | `redis-cli ping` |
| `core-service` | `curl -f http://localhost:8080/actuator/health` (Spring Actuator already in pom.xml) |
| `api-gateway` | `curl -f http://localhost:3000/health` (already implemented in index.js) |

---

## Issues to Fix Before Running Docker Compose

> [!WARNING]
> These issues exist in the current code and must be addressed before Docker deployment works correctly.

### Issue 1 — Hardcoded `localhost` in `api-gateway/index.js`

The proxy targets are hardcoded:
```js
target: 'http://localhost:5001'   // ❌ won't work in Docker
target: 'http://localhost:5003'   // ❌ 
target: 'http://localhost:8080'   // ❌
```
**Fix:** Read targets from environment variables (e.g. `process.env.CORE_SERVICE_URL`).

### Issue 2 — `NotificationService` & `PaymentService` Dockerfiles missing `EXPOSE`

Both ASP.NET Dockerfiles don't have `EXPOSE` statements and don't specify port configuration.
**Fix:** Add `EXPOSE 8080` and set `ASPNETCORE_URLS=http://+:8080` via environment variable.

### Issue 3 — `ai-service` port conflict

The `ai-service/.env.example` says `AI_SERVICE_PORT=5003` but the Dockerfile `EXPOSE`s `8000`. The gateway proxies to `:5003`.
**Fix:** Standardise on port `8000` and update the gateway's env variable accordingly.

### Issue 4 — Database schemas

No migration scripts or init SQL are included.
**Fix:** Add an `init.sql` or ensure Spring Boot's `spring.jpa.hibernate.ddl-auto=update` / `create` is set for first-run, and EF Core migrations are applied via a startup script for the .NET services.

---

## Deployment Steps (Manual Procedure)

```
Phase 1 — Prerequisites
  ├─ Install Docker Desktop (Windows)
  └─ Ensure WSL2 backend is enabled

Phase 2 — Configuration
  ├─ Copy .env.example → .env at project root
  ├─ Fill in secrets (DB passwords, GROQ_API_KEY, JWT_SECRET, Razorpay keys, SMTP)
  └─ Verify .env is in .gitignore ✅ (already present)

Phase 3 — Fix Code Issues (see above)
  ├─ Update api-gateway/index.js to use env vars for proxy targets
  ├─ Add EXPOSE + ASPNETCORE_URLS to NotificationService & PaymentService Dockerfiles
  └─ Resolve ai-service port standardisation

Phase 4 — Build & Run
  ├─ docker compose build         # builds all 6 custom images
  ├─ docker compose up -d         # starts all 9 containers in background
  └─ docker compose logs -f       # tail logs to verify startup

Phase 5 — Verify
  ├─ http://localhost             → Frontend (Nginx)
  ├─ http://localhost/api/v1/...  → API Gateway → Services (via Nginx proxy)
  ├─ http://localhost:3000/health → Gateway health check
  ├─ http://localhost:8080/actuator/health → Core Service health
  └─ http://localhost:15672       → RabbitMQ Management UI

Phase 6 — Database Init (first run only)
  ├─ core-service: Spring JPA will auto-create tables if ddl-auto=update
  └─ notification-service: Run EF Core migrations via exec into container
       docker compose exec notification-service dotnet ef database update
```

---

## Proposed File Structure After Dockerization

```
git_auctxi/
├── docker-compose.yml          ← NEW: orchestrates all 9 containers
├── .env                        ← NEW: secrets (gitignored)
├── .env.example                ← NEW: template for secrets
├── frontend/
│   ├── Dockerfile              ← EXISTS (no change needed)
│   └── nginx.conf              ← NEW: SPA routing + /api proxy
├── backend/
│   ├── api-gateway/
│   │   ├── Dockerfile          ← EXISTS (no change needed)
│   │   └── index.js            ← MODIFY: use env vars for proxy targets
│   ├── core-service/
│   │   └── Dockerfile          ← EXISTS (no change needed)
│   ├── ai-service/
│   │   └── Dockerfile          ← EXISTS (no change needed)
│   ├── PaymentService/
│   │   └── Dockerfile          ← MODIFY: add EXPOSE + ASPNETCORE_URLS
│   └── NotificationService/
│       └── Dockerfile          ← MODIFY: add EXPOSE + ASPNETCORE_URLS
```

---

## Open Questions

1. **SMTP for production** — `NotificationService` has `UseMockEmail: true`. Do you want real email sending enabled in Docker? Which SMTP provider?
2. **Razorpay mode** — Currently `rzp_test_*` keys are committed. Should Docker use the same test keys or switch to live keys via `.env`?
3. **Ollama** — The `ai-service` supports Ollama as a fallback LLM. Should the Docker setup include an Ollama container, or is Groq the only provider for Docker?
4. **Database schemas** — Are there existing migration scripts/SQL dumps, or should Spring Boot and EF Core auto-create schemas on first boot?
5. **Frontend `vite.config.js`** — Does the frontend `VITE_API_URL` need to be baked into the build, or will Nginx proxying handle it transparently?
