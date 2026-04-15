# Start All Backend Services

All backend services are now in the `backend/` folder.

## Services Overview

```
backend/
├── eureka-server/     # Port 8761 - Service Discovery
├── api-gateway/       # Port 8091 - API Gateway
└── (Node.js)          # Port 9090 - Main Backend
```

## Quick Start

### Terminal 1 - Eureka Server
```bash
cd backend/eureka-server
mvn spring-boot:run
```
Wait for: `Started EurekaServerApplication`
Dashboard: http://localhost:8761

### Terminal 2 - API Gateway
```bash
cd backend/api-gateway
mvn spring-boot:run
```
Wait for: `Started ApiGatewayApplication`

### Terminal 3 - Node.js Backend
```bash
cd backend
npm start
```
Wait for: `Matchy Backend Service running`

## Verify

Open http://localhost:8761 - You should see:
- API-GATEWAY (1 instance)
- BACKEND-SERVICE (1 instance)

Test: http://localhost:8091/api/health

## Startup Order

1. Eureka Server (8761) - Start first
2. API Gateway (8091) - Registers with Eureka
3. Backend (9090) - Registers with Eureka

## Ports

- 8761: Eureka Server
- 8091: API Gateway (Frontend connects here)
- 9090: Node.js Backend
- 4200: Angular Frontend

## Stop Services

Press `Ctrl+C` in each terminal.
