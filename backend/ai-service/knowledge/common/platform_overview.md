# Platform Overview

AuctXI is a modern, real-time sports auction platform designed to manage sports auctions, bidding, and team formations.

## Roles
- **Admin**: Has full control over the platform. Admins can manage users, create sports categories, define global rules, and view platform-wide analytics.
- **Manager**: Organizes and manages specific auctions. Managers can create auctions, invite players, define team budgets, and oversee the live bidding process.
- **Client**: Represents team owners. Clients register, load their wallets via the Payment Service, join auctions, and place real-time bids on players to build their teams.

## Technical Architecture
AuctXI is built using a polyglot microservice architecture.
- Frontend: React (Vite)
- Gateway: Node.js (Express)
- Core Business Logic: Spring Boot (Java)
- Payment Service: ASP.NET Core
- Notification Service: ASP.NET Core
- AI Assistant: Python (FastAPI + LangChain + Ollama)
