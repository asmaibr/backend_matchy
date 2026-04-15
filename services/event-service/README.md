# Matchy Backend - Spring Boot REST API

## Overview
Backend REST API for the Matchy freelance platform built with Spring Boot 3.2.0 and Java 17.

## Tech Stack
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: MySQL
- **ORM**: Spring Data JPA / Hibernate
- **Build Tool**: Maven
- **Validation**: Jakarta Validation
- **Dev Tools**: Lombok, Spring DevTools

## Project Structure
```
backend/
├── src/main/java/com/matchy/
│   ├── MatchyApplication.java          # Main application entry point
│   ├── config/
│   │   └── CorsConfig.java             # CORS configuration for Angular
│   ├── entity/
│   │   └── Evenement.java              # JPA Entity
│   ├── dto/
│   │   ├── EvenementDTO.java           # Response DTO
│   │   └── EvenementCreateDTO.java     # Request DTO with validation
│   ├── repository/
│   │   └── EvenementRepository.java    # JPA Repository
│   ├── service/
│   │   ├── EvenementService.java       # Service interface
│   │   └── impl/
│   │       └── EvenementServiceImpl.java # Service implementation
│   ├── controller/
│   │   └── EvenementController.java    # REST Controller
│   └── exception/
│       ├── ResourceNotFoundException.java
│       └── GlobalExceptionHandler.java # Global exception handling
└── src/main/resources/
    └── application.properties          # Database & server configuration
```

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

### Database Setup
1. Install MySQL and start the service
2. Create database (auto-created by application):
```sql
CREATE DATABASE matchy_db;
```

3. Update credentials in `application.properties` if needed:
```properties
spring.datasource.username=root
spring.datasource.password=root
```

### Running the Application

1. Navigate to backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

The server will start on `http://localhost:8080`

## API Endpoints

### Evenement CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/evenements` | Create new event |
| PUT | `/api/evenements/{id}` | Update event |
| DELETE | `/api/evenements/{id}` | Delete event |
| GET | `/api/evenements/{id}` | Get event by ID |
| GET | `/api/evenements` | Get all events |
| GET | `/api/evenements/type/{type}` | Get events by type |
| GET | `/api/evenements/upcoming` | Get upcoming events |
| POST | `/api/evenements/{id}/participate` | Participate in event |
| POST | `/api/evenements/{id}/cancel-participation` | Cancel participation |

### Event Types
- `CERTIFICATION`
- `RECOMMENDATION`
- `FREELANCE_OPPORTUNITY`
- `WORKSHOP`
- `NETWORKING`
- `TRAINING`

### Example Request (Create Event)
```json
{
  "title": "Spring Boot Workshop",
  "description": "Learn Spring Boot fundamentals",
  "date": "2026-03-15T14:00:00",
  "location": "Online",
  "type": "WORKSHOP",
  "maxParticipants": 50
}
```

### Example Response
```json
{
  "id": 1,
  "title": "Spring Boot Workshop",
  "description": "Learn Spring Boot fundamentals",
  "date": "2026-03-15T14:00:00",
  "location": "Online",
  "type": "WORKSHOP",
  "maxParticipants": 50,
  "currentParticipants": 0,
  "status": "ACTIVE",
  "createdAt": "2026-02-25T10:30:00",
  "updatedAt": "2026-02-25T10:30:00"
}
```

## Features Implemented

✅ Full CRUD operations for Evenement entity
✅ DTO pattern for request/response separation
✅ Input validation with Jakarta Validation
✅ Global exception handling
✅ CORS configuration for Angular frontend
✅ Repository pattern with custom queries
✅ Service layer with business logic
✅ User participation tracking
✅ Event capacity management
✅ Automatic timestamps (createdAt, updatedAt)

## Testing the API

Use tools like Postman, Insomnia, or curl to test endpoints:

```bash
# Get all events
curl http://localhost:8080/api/evenements

# Create event
curl -X POST http://localhost:8080/api/evenements \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Event","date":"2026-03-20T10:00:00","type":"WORKSHOP"}'
```

## Next Steps
- Implement user authentication & authorization
- Add role-based access control (Admin/User)
- Implement user-event relationship (many-to-many)
- Add pagination and sorting
- Implement search and filtering
- Add unit and integration tests
