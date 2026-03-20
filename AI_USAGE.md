# 🤖 AI Usage Documentation

> This document transparently describes how **Claude (claude-sonnet-4-6, Anthropic)** was used as an agentic development assistant throughout the TaskFlow project.

---

## Overview

Claude was used as a full-spectrum AI collaborator — not just for code generation, but for architecture decisions, test writing, debugging guidance, and documentation. Every major decision in this project was made in active dialogue with the AI.

---

## How AI Was Involved — By Phase

### 1. Architecture & API Design

**Prompt used:**
> "Design a Spring Boot REST API for a task manager with CRUD operations. The Task entity needs: id, title (required, max 100), description (optional, max 500), status (enum: TODO/IN_PROGRESS/DONE), dueDate, and category. Use H2 in-memory database. Include Bean Validation."

**What Claude produced:**
- The full layered architecture: `Controller → Service → Repository`
- Entity design with JPA annotations and Bean Validation
- A `TaskRequest` DTO to separate input from the entity
- Custom `TaskNotFoundException` and a `GlobalExceptionHandler` for consistent error responses
- CORS configuration via `WebMvcConfigurer`

**Critical reflection:**
Claude's first suggestion used `@ResponseBody` on individual methods rather than `@RestControllerAdvice` for error handling. This was caught in review and corrected in subsequent prompts. The AI accepted the correction immediately and regenerated clean code.

---

### 2. Backend Code Generation

**Prompts used:**
- "Write the Spring Boot JPA repository with methods for filtering by status, searching by keyword, and sorting by dueDate."
- "Add a search endpoint that queries across title, description, and category using JPQL."

**What Claude produced:**
- `TaskRepository` with JPQL `@Query` methods for search and sorting
- `TaskService` fully implementing CRUD with proper delegation to the repository
- `TaskController` with optional query params (`?search=`, `?sortBy=`, `?status=`, `?category=`) handled in a single `GET /api/tasks` endpoint

**Critical reflection:**
The initial controller implementation handled each query param in separate `if-else` branches in the service layer. Claude was prompted to consolidate this logic, resulting in cleaner, more testable code. AI was good at generating boilerplate but required guidance on design decisions.

---

### 3. Frontend Architecture

**Prompt used:**
> "Design a React + TypeScript frontend for this task manager. Use Vite, no UI library — custom CSS with a dark theme. Include: task listing, create/edit modal form with validation, inline status dropdown, search, filter by status and category, sort, and stats bar."

**What Claude produced:**
- Full component hierarchy: `App → Modal → TaskCard + TaskForm`
- `useTasks` custom hook to encapsulate all state and API interactions
- `taskApi.ts` Axios service layer with typed requests/responses
- Full `index.css` with a cohesive dark-theme design system using CSS variables
- TypeScript types for `Task`, `TaskRequest`, `ApiError`, `SortBy`

**Critical reflection:**
Claude's first version inlined all state management directly in `App.tsx`. After prompting for "better separation of concerns," Claude refactored into a dedicated `useTasks` hook, significantly improving readability and testability. The AI was responsive to refactoring requests.

---

### 4. Form Validation

**Prompt used:**
> "Implement client-side form validation matching the backend Bean Validation rules. Show character counters, highlight invalid fields in red, and display server-side field errors returned from the API."

**What Claude produced:**
- Local validation function in `TaskForm` with rules mirroring backend constraints
- Dual-source error display (local + server `fieldErrors`)
- Live character counters on title and description
- Error state cleared on new form open

**Critical reflection:**
The AI correctly unified client-side and server-side error display, but initially didn't reset field errors when the modal was closed and reopened. This was caught during manual testing and fixed with a prompt.

---

### 5. Test Cases

**Prompt used:**
> "Write JUnit 5 unit tests for TaskService using Mockito. Cover: getAllTasks, getById (found and not found), createTask, updateTask, deleteTask, and search. Also write Spring MockMvc integration tests for TaskController covering all endpoints including validation failure."

**What Claude produced:**
- `TaskServiceTest` — 8 unit tests covering happy paths and exception paths
- `TaskControllerTest` — 8 integration tests using `@WebMvcTest` and `MockBean`
- Frontend `App.test.tsx` with Vitest + Testing Library covering rendering, form validation, API mocking, and modal interactions

**Critical reflection:**
Claude's test coverage was solid for the cases explicitly asked for. Edge cases (e.g., concurrent updates, malformed enum values) were not covered and would require additional prompting. AI-generated tests tend to test what the code *does* rather than discovering unexpected failure modes — human review remains essential.

---

### 6. Debugging Assistance

**Example scenario:**
During development, the `status-select` dropdown in `TaskCard` wasn't triggering re-renders after an inline status change. This was diagnosed by prompting:

> "My React task card has a status dropdown that calls an update API, but the UI doesn't refresh. The update returns the new task. How do I fix this?"

Claude identified that the local tasks state wasn't being updated after the API call — the fix was to call `refetch()` or use a functional state update. The fix was implemented in `useTasks.ts`.

---

### 7. Documentation

**Prompt used:**
> "Write a comprehensive README.md covering: features, tech stack, project structure, setup instructions for both frontend and backend, API reference table, test instructions, optional PostgreSQL configuration, and deployment steps."

Claude generated the full `README.md` which was reviewed and lightly edited.

---

## What Worked Well

| Area                      | Assessment |
|---------------------------|------------|
| Boilerplate generation    | ✅ Excellent — saved hours on entity/repo/controller setup |
| Layered architecture      | ✅ Good — produced clean, idiomatic Spring Boot structure |
| TypeScript types          | ✅ Strong — correctly typed all API interactions |
| Test scaffolding          | ✅ Good — covered main cases, needed prompting for edge cases |
| Error handling            | ✅ Correct once guided — needed refinement prompts |
| CSS / dark theme design   | ✅ Excellent — produced a coherent, attractive design system |
| Debugging explanations    | ✅ Accurate and fast |

---

## Where Human Judgment Was Essential

| Area                          | Issue |
|-------------------------------|-------|
| API design decisions          | AI suggested acceptable patterns; human chose which to adopt |
| Edge case test coverage       | AI only tested what was asked — gaps required human identification |
| State management refactoring  | AI needed explicit prompting to improve separation of concerns |
| Business logic correctness    | AI assumes optimistic paths; human caught missing reset states |
| Security considerations       | CORS set to `*` for dev — human must restrict in production |
| Performance optimisations     | Not addressed by AI unless specifically asked |

---

## Critical Reflection

Using Claude as an agentic AI throughout this project was highly productive, particularly for **accelerating the scaffolding phase** and **producing consistent, well-structured code**. However, several important observations:

1. **AI is a fast first draft, not a finished product.** Every AI-generated file required review, and several needed targeted correction prompts.

2. **Prompt quality determines output quality.** Vague prompts ("make a task API") produced generic code. Specific prompts ("add a JPQL search query across three fields with LIKE") produced precise implementations.

3. **AI does not replace testing intuition.** Claude wrote tests for scenarios it knew about. Discovering subtle bugs — like the state-reset issue — required manual usage of the app.

4. **Architecture decisions are still human work.** Claude offered patterns, but the decision of *which* pattern to use (e.g., DTO vs. direct entity in controller) required deliberate developer judgment.

5. **Documentation generation is a clear AI win.** README, API references, and structured docs were produced quickly and accurately.

---

## Tools Used

- **AI Model:** Claude Sonnet (claude-sonnet-4-6) via claude.ai
- **Interaction mode:** Conversational chat with iterative follow-up prompts
- **Sessions:** Multiple sessions across frontend, backend, testing, and documentation phases
