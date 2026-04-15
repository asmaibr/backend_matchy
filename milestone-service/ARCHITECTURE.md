# Backend Architecture - Layered Structure

## Overview

The backend has been restructured to follow a clean, layered architecture pattern:

```
Repository → Service → Controller → Routes
```

This architecture provides:
- **Separation of Concerns**: Each layer has a specific responsibility
- **Testability**: Easy to unit test each layer independently
- **Maintainability**: Changes in one layer don't affect others
- **Scalability**: Easy to add new features following the same pattern

## Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js              # Database connection pool
│   ├── repositories/                # Data access layer
│   │   ├── project.repository.js
│   │   ├── milestone.repository.js
│   │   ├── application.repository.js
│   │   ├── interview.repository.js
│   │   ├── notification.repository.js
│   │   └── workspace.repository.js
│   ├── services/                    # Business logic layer
│   │   ├── project.service.js
│   │   ├── milestone.service.js
│   │   ├── application.service.js
│   │   ├── notification.service.js
│   │   └── workspace.service.js
│   ├── controllers/                 # Request handling layer
│   │   ├── project.controller.js
│   │   ├── milestone.controller.js
│   │   ├── application.controller.js
│   │   ├── notification.controller.js
│   │   └── workspace.controller.js
│   └── routes/                      # Route definitions
│       ├── index.js                 # Main router
│       ├── project.routes.js
│       ├── milestone.routes.js
│       └── application.routes.js
├── server-new.js                    # New server entry point
├── server.js                        # Old server (kept for reference)
├── ai-matching.service.js           # AI matching service
├── payment.service.js               # Payment service
├── advanced-search.service.js       # Advanced search service
├── email.service.js                 # Email service
└── eureka-client.js                 # Eureka registration
```

## Layer Responsibilities

### 1. Repository Layer (Data Access)
**Location**: `src/repositories/`

**Responsibility**: Direct database operations (CRUD)

**Example**:
```javascript
// project.repository.js
class ProjectRepository {
  async findAll() {
    const [projects] = await pool.query('SELECT * FROM projects');
    return projects;
  }
  
  async findById(id) {
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    return projects[0] || null;
  }
  
  async create(projectData) {
    const [result] = await pool.query('INSERT INTO projects ...', [...]);
    return result.insertId;
  }
}
```

**Rules**:
- Only contains SQL queries
- No business logic
- Returns raw data from database
- Throws errors for database issues

### 2. Service Layer (Business Logic)
**Location**: `src/services/`

**Responsibility**: Business logic, data transformation, orchestration

**Example**:
```javascript
// project.service.js
class ProjectService {
  async getAllProjects() {
    const projects = await projectRepository.findAll();
    
    // Business logic: Parse JSON fields
    projects.forEach(p => {
      p.skills = p.skills ? JSON.parse(p.skills) : [];
      p.applicationsCount = p.applications_count || 0;
    });
    
    return projects;
  }
  
  async createProject(projectData) {
    // Business logic: Validation, transformation
    const projectId = await projectRepository.create(projectData);
    
    // Could trigger notifications, logging, etc.
    return { id: projectId, message: 'Project created successfully' };
  }
}
```

**Rules**:
- Contains business logic
- Calls repositories for data
- Transforms data for presentation
- Handles cross-cutting concerns (notifications, logging)
- Throws business logic errors

### 3. Controller Layer (Request Handling)
**Location**: `src/controllers/`

**Responsibility**: HTTP request/response handling, error handling

**Example**:
```javascript
// project.controller.js
class ProjectController {
  async getAllProjects(req, res) {
    try {
      const projects = await projectService.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }
  
  async createProject(req, res) {
    try {
      const result = await projectService.createProject(req.body);
      res.json(result);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }
}
```

**Rules**:
- Handles HTTP requests/responses
- Extracts data from req (body, params, query)
- Calls services
- Handles errors and sends appropriate HTTP status codes
- No business logic
- No direct database access

### 4. Routes Layer (URL Mapping)
**Location**: `src/routes/`

**Responsibility**: Map URLs to controller methods

**Example**:
```javascript
// project.routes.js
import express from 'express';
import projectController from '../controllers/project.controller.js';

const router = express.Router();

router.get('/', projectController.getAllProjects.bind(projectController));
router.get('/:id', projectController.getProjectById.bind(projectController));
router.post('/', projectController.createProject.bind(projectController));
router.put('/:id', projectController.updateProject.bind(projectController));
router.delete('/:id', projectController.deleteProject.bind(projectController));

export default router;
```

**Rules**:
- Only route definitions
- No logic
- Binds routes to controller methods

## Data Flow

### Request Flow (Top to Bottom):
```
HTTP Request
    ↓
Routes (URL mapping)
    ↓
Controller (Request handling)
    ↓
Service (Business logic)
    ↓
Repository (Database access)
    ↓
Database
```

### Response Flow (Bottom to Top):
```
Database
    ↓
Repository (Raw data)
    ↓
Service (Transformed data)
    ↓
Controller (HTTP response)
    ↓
Routes
    ↓
HTTP Response
```

## Example: Complete Flow

### Creating a Project

1. **Client sends request**:
```http
POST /api/projects
Content-Type: application/json

{
  "company_name": "TechCorp",
  "project_title": "E-commerce Platform",
  "budget": 15000,
  "skills": ["Angular", "Node.js"]
}
```

2. **Route** (`project.routes.js`):
```javascript
router.post('/', projectController.createProject.bind(projectController));
```

3. **Controller** (`project.controller.js`):
```javascript
async createProject(req, res) {
  try {
    const result = await projectService.createProject(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
}
```

4. **Service** (`project.service.js`):
```javascript
async createProject(projectData) {
  // Business logic: Set defaults, validate
  const projectId = await projectRepository.create(projectData);
  
  // Could send notifications here
  return { id: projectId, message: 'Project created successfully' };
}
```

5. **Repository** (`project.repository.js`):
```javascript
async create(projectData) {
  const [result] = await pool.query(
    'INSERT INTO projects (...) VALUES (...)',
    [...]
  );
  return result.insertId;
}
```

6. **Response**:
```json
{
  "id": 123,
  "message": "Project created successfully"
}
```

## Migration from Old to New

### Old Structure (server.js):
```javascript
// Everything in one file
app.get('/api/projects', async (req, res) => {
  try {
    const [projects] = await pool.query('SELECT * FROM projects');
    projects.forEach(p => {
      p.skills = JSON.parse(p.skills);
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
});
```

### New Structure:
```javascript
// Separated into layers
// Repository
async findAll() {
  const [projects] = await pool.query('SELECT * FROM projects');
  return projects;
}

// Service
async getAllProjects() {
  const projects = await projectRepository.findAll();
  projects.forEach(p => p.skills = JSON.parse(p.skills));
  return projects;
}

// Controller
async getAllProjects(req, res) {
  try {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
}

// Route
router.get('/', projectController.getAllProjects.bind(projectController));
```

## How to Use

### Option 1: Use New Architecture (Recommended)
```bash
# Update package.json
"scripts": {
  "start": "node server-new.js"
}

# Run
npm start
```

### Option 2: Keep Old Server
```bash
# Old server still works
node server.js
```

## Benefits

1. **Testability**: Each layer can be tested independently
2. **Maintainability**: Easy to find and fix bugs
3. **Scalability**: Easy to add new features
4. **Reusability**: Services can be reused by multiple controllers
5. **Separation of Concerns**: Each layer has one responsibility
6. **Clean Code**: Easier to read and understand

## Adding New Features

### Example: Add "Favorite Projects" Feature

1. **Repository** (`project.repository.js`):
```javascript
async addToFavorites(userId, projectId) {
  await pool.query(
    'INSERT INTO favorites (user_id, project_id) VALUES (?, ?)',
    [userId, projectId]
  );
}
```

2. **Service** (`project.service.js`):
```javascript
async addToFavorites(userId, projectId) {
  await projectRepository.addToFavorites(userId, projectId);
  // Business logic: Send notification
  await notificationService.create({...});
  return { message: 'Added to favorites' };
}
```

3. **Controller** (`project.controller.js`):
```javascript
async addToFavorites(req, res) {
  try {
    const { userId, projectId } = req.body;
    const result = await projectService.addToFavorites(userId, projectId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
}
```

4. **Route** (`project.routes.js`):
```javascript
router.post('/favorites', projectController.addToFavorites.bind(projectController));
```

## All Functionality Preserved

✅ All existing endpoints work exactly the same
✅ Projects CRUD
✅ Milestones CRUD
✅ Applications & Interviews
✅ Notifications
✅ Workspace (Chat, Submissions)
✅ AI Matching
✅ Payments
✅ Advanced Search
✅ Freelancer Profiles

## Testing

The new architecture makes testing much easier:

```javascript
// Test repository (mock database)
describe('ProjectRepository', () => {
  it('should find all projects', async () => {
    const projects = await projectRepository.findAll();
    expect(projects).toBeArray();
  });
});

// Test service (mock repository)
describe('ProjectService', () => {
  it('should parse skills JSON', async () => {
    const projects = await projectService.getAllProjects();
    expect(projects[0].skills).toBeArray();
  });
});

// Test controller (mock service)
describe('ProjectController', () => {
  it('should return 200 on success', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
  });
});
```

## Notes

- The old `server.js` is kept for reference
- Both servers can run simultaneously (different ports)
- All functionality is preserved
- No breaking changes to API
- Database schema unchanged
