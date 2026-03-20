# ✦ TaskFlow — Task Manager

> A full-stack task management web application built with **React + TypeScript** (frontend) and **Spring Boot** (backend), developed collaboratively with **Claude (Anthropic)** as an agentic AI assistant.

---

## 📸 Features

- **Full CRUD** — Create, read, update, and delete tasks
- **Status management** — `TODO`, `IN_PROGRESS`, `DONE` with inline dropdown
- **Search** — Real-time full-text search across title, description, and category
- **Filter & Sort** — Filter by status/category, sort by due date or status
- **Categories** — Organize tasks into custom groups
- **Due dates** — Visual overdue indicators
- **Form validation** — Client-side + server-side validation with user-friendly error messages
- **Stats bar** — Live task counts per status
- **Responsive** — Works on desktop and mobile

---

## 🏗️ Tech Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Frontend   | React 18, TypeScript, Vite     |
| Styling    | Custom CSS (dark theme)        |
| HTTP       | Axios                          |
| Backend    | Spring Boot 3.2, Java 17       |
| ORM        | Spring Data JPA / Hibernate    |
| Database   | H2 (in-memory)                 |
| Validation | Bean Validation (Jakarta)      |
| Build      | Maven (backend), Vite (frontend)|
| Testing    | JUnit 5 + Mockito / Vitest + Testing Library |

---

## 📁 Project Structure

```
taskmanager/
├── backend/                        # Spring Boot application
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/taskmanager/
│       │   │   ├── TaskManagerApplication.java
│       │   │   ├── config/
│       │   │   │   └── CorsConfig.java
│       │   │   ├── controller/
│       │   │   │   └── TaskController.java
│       │   │   ├── exception/
│       │   │   │   ├── GlobalExceptionHandler.java
│       │   │   │   └── TaskNotFoundException.java
│       │   │   ├── model/
│       │   │   │   ├── Task.java
│       │   │   │   ├── TaskRequest.java
│       │   │   │   └── TaskStatus.java
│       │   │   ├── repository/
│       │   │   │   └── TaskRepository.java
│       │   │   └── service/
│       │   │       └── TaskService.java
│       │   └── resources/
│       │       └── application.properties
│       └── test/java/com/taskmanager/
│           ├── controller/
│           │   └── TaskControllerTest.java
│           └── service/
│               └── TaskServiceTest.java
│
├── frontend/                       # React application
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── api/
│       │   └── taskApi.ts
│       ├── hooks/
│       │   └── useTasks.ts
│       ├── types/
│       │   └── index.ts
│       └── test/
│           ├── setup.ts
│           └── App.test.tsx
│
├── README.md
└── AI_USAGE.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Java 17+** and **Maven 3.8+**
- **Node.js 18+** and **npm 9+**

---

### Backend

```bash
cd backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**.

H2 Console (dev): http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:taskdb`
- Username: `sa`, Password: *(empty)*

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at **http://localhost:5173**.

> The Vite dev server proxies `/api` → `http://localhost:8080`, so no CORS issues during development.

---

## 🔌 REST API Reference

Base URL: `http://localhost:8080/api/tasks`

| Method   | Endpoint              | Description              |
|----------|-----------------------|--------------------------|
| `GET`    | `/api/tasks`          | Get all tasks (supports `?search=`, `?status=`, `?category=`, `?sortBy=`) |
| `GET`    | `/api/tasks/{id}`     | Get a task by ID         |
| `POST`   | `/api/tasks`          | Create a new task        |
| `PUT`    | `/api/tasks/{id}`     | Update an existing task  |
| `DELETE` | `/api/tasks/{id}`     | Delete a task            |
| `GET`    | `/api/tasks/categories` | Get all unique categories |

### Task Object

```json
{
  "id": 1,
  "title": "Fix login bug",
  "description": "Users can't log in with SSO",
  "status": "IN_PROGRESS",
  "dueDate": "2026-04-15",
  "category": "Work"
}
```

### Create/Update Request Body

```json
{
  "title": "Fix login bug",
  "description": "Optional details",
  "status": "TODO",
  "dueDate": "2026-04-15",
  "category": "Work"
}
```

### Validation Rules

| Field         | Rules                             |
|---------------|-----------------------------------|
| `title`       | Required, max 100 characters      |
| `description` | Optional, max 500 characters      |
| `status`      | One of: `TODO`, `IN_PROGRESS`, `DONE` |
| `dueDate`     | Optional, ISO date format         |
| `category`    | Optional, max 50 characters       |

### Error Response

```json
{
  "timestamp": "2026-03-20T14:30:00",
  "status": 400,
  "error": "Validation Failed",
  "fieldErrors": {
    "title": "Title is required"
  }
}
```

---

## 🧪 Running Tests

### Backend Tests

```bash
cd backend
mvn test
```

Covers:
- `TaskServiceTest` — unit tests for all service methods using Mockito
- `TaskControllerTest` — integration tests for all REST endpoints using MockMvc

### Frontend Tests

```bash
cd frontend
npm test
```

Covers:
- Rendering components with mocked API
- Form validation behaviour
- Modal open/close interactions
- Create/delete API calls

---

## ⚙️ Configuration

### Switch to PostgreSQL (optional)

Replace `application.properties` with:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/taskdb
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=postgres
spring.datasource.password=your_password

spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=false
```

Add to `pom.xml`:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

---

## 🚢 Deployment

### Frontend → Vercel / Netlify

```bash
cd frontend
npm run build        # Output in /dist
```

Upload `/dist` to Vercel or Netlify. Set environment variable:

```
VITE_API_BASE_URL=https://your-backend.onrender.com
```

### Backend → Render / Fly.io

```bash
cd backend
mvn package -DskipTests    # Produces target/task-manager-1.0.0.jar
```

Deploy the JAR to Render (Web Service) or Fly.io. Set:

```
SPRING_PROFILES_ACTIVE=prod
```

---

## 📄 License

MIT
