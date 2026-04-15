# Matchy Backend - Microservices Architecture

All backend services are in this folder.

## Structure

```
backend/
├── eureka-server/     # Port 8761 - Service Discovery
├── api-gateway/       # Port 8091 - API Gateway
├── src/               # Node.js Backend (Port 9090)
│   ├── config/
│   ├── repositories/
│   ├── services/
│   ├── controllers/
│   └── routes/
├── server-new.js      # New layered architecture
├── server.js          # Old server (backup)
└── package.json
```

## Quick Start

### Terminal 1 - Eureka Server
```bash
cd eureka-server
mvn spring-boot:run
```
Dashboard: http://localhost:8761

### Terminal 2 - API Gateway
```bash
cd api-gateway
mvn spring-boot:run
```
Port: 8091

### Terminal 3 - Backend Service
```bash
npm start
```
Port: 9090

## Verify

Open http://localhost:8761 - You should see:
- API-GATEWAY
- BACKEND-SERVICE

Test: http://localhost:8091/api/health

## Architecture

Node.js Backend follows layered architecture:
```
Routes → Controller → Service → Repository → Database
```

See `ARCHITECTURE.md` for details.

## Documentation

- `ARCHITECTURE.md` - Complete architecture guide
- `MIGRATION_GUIDE.md` - Migration from old to new
- `RESTRUCTURE_SUMMARY.md` - What changed
- `START_ALL_SERVICES.md` - How to start services
