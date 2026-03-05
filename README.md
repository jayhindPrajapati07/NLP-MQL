# Natural Language to MongoDB Dashboard 📊

An intelligent, AI-driven dashboard that acts as a natural language interface for MongoDB databases. Similar to Metabase, this system allows administrators to connect multiple external MongoDB databases and use Google's Gemini LLM to translate plain English questions into MongoDB aggregation pipelines, seamlessly displaying the results in tables and dynamic charts.

## 🎯 Project Aims & Objectives
- **Zero-Code Data Exploration**: Empower users to ask questions in natural language and receive data insights without knowing MQL (MongoDB Query Language).
- **Multi-Database Management**: Serve as a centralized hub to connect to and query any MongoDB database via connection strings.
- **Dynamic Visualizations**: Automatically generate optimal charts (bar, pie, line) and tabular formats based on the returned data context.
- **Self-Contained Architecture**: Maintain an internal System Database to persist users, configurations, and database connection profiles safely, completely isolated from external analytical databases.

## 🛠️ Technology Stack
- **Frontend**: Next.js (React), Tailwind CSS, Recharts (focusing on clean, minimalist, and responsive UI design)
- **Backend**: Python (FastAPI) (Architected adhering to SOLID principles)
- **Database**: MongoDB (System DB) + Dynamic External MongoDB Connections
- **LLM Engine**: Google Gemini API
- **Infrastructure**: Docker & Docker Compose

## 🏗️ System Module Breakdown

The project is thoughtfully divided into logical modules to ensure separation of concerns and maintainability.

### 1. Authentication & System Core Module
*Manages the state of the application itself.*
- **System Database**: A dedicated MongoDB instance to store users, saved connections, query history, and dashboard layouts.
- **Auth Flow**: Admin login and session management (JWT).
- **Connection Manager**: UI and API to safely add, validate, encrypt, and store external MongoDB connection strings.

### 2. Schema Discovery Module
*Bridges the gap between the external DB and the LLM.*
- **Database Introspection**: Dynamically connects to the target database and samples collections to extract schema information (field names, data types, distinct values).
- **Context Generation**: Formats the schema metadata into a dense, optimized prompt context for the LLM.

### 3. AI & Query Generation Module (Python Backend)
*The brain of the system.*
- **NL to MQL Pipeline**: Sends the user's natural language question alongside the schema context to the Gemini API.
- **MQL Validation**: Ensures the generated query is syntactically valid and strictly read-only (`find` or `aggregate`) to prevent accidental data mutation.
- **Query Execution Engine**: Runs the validated MQL against the external database and safely parses the BSON output.

### 4. Visualization & Experience Module (Next.js Frontend)
*The user-facing presentation layer.*
- **Chat Interface**: An intuitive prompt bar where users can ask questions or modify previous queries.
- **Data Tables**: A responsive, paginated data grid for raw data viewing.
- **Chart Orchestrator**: Uses LLM feedback and data shapes to automatically select and render the appropriate chart type (e.g., temporal data -> line chart, categorical -> bar/pie chart).

## 🚀 Current Status: Phase 1 (Completed)

We have successfully built and integrated the core MVP features spanning the frontend, backend, and LLM orchestration:
- ✅ **Dockerized Environment**: The Next.js frontend, FastAPI backend, and MongoDB System Database run seamlessly in isolated containers with live hot-reloading for development (`docker-compose up`).
- ✅ **Environment Security**: Sensitive configurations like `GEMINI_API_KEY` and Fernet `ENCRYPTION_KEY` are safely loaded via `.env` files.
- ✅ **Admin Authentication**: JWT-based secure user registration and login endpoints are active.
- ✅ **Connection Vault**: Admins can register external MongoDB connection URIs. They are AES-encrypted at rest in the System Database. 
- ✅ **LLM Pipeline (Gemini 2.5 Flash)**: Natural language queries map schema attributes to output strictly deterministic, read-only **MongoDB Aggregation Pipelines**.
- ✅ **Interactive UI**: A rich Next.js Dashboard featuring a natural language Chatbox alongside Data Tables and intelligent visual Chart generation.
- ✅ **Marketing Landing Pages**: Polished, dark-mode marketing pages (`/`, `/about`, `/features`, `/contact`) with global navigation.

## 🗺️ Roadmap: Phase 2 (Advanced Analytics & RBAC)
*This is the immediate next step for development when resuming work.*

**1. Query Persistence & Dashboarding**
- Build a `SavedQuery` model in the System Database to catalog successful LLM queries.
- Add a "Save to Dashboard" UI modal so admins can persist a query alongside a locked chart visualization type.

**2. Role-Based Access Control (RBAC)**
- **User Management**: Admins can create restricted "Standard User" accounts via a new Settings interface.
- **Assigned Queries**: Admins can strictly assign specific Saved Queries to Standard Users. 
- **Restricted Dashboards**: Standard Users log in to a curated feed of pre-approved charts and execute them dynamically behind the scenes without ever seeing the raw underlying database connection credentials.

**3. Advanced Excel Export**
- Integrate `xlsx` libraries into the Next.js frontend.
- Add an "Export to Excel" button so end-users can independently download underlying JSON result sets as formatted `.xlsx` spreadsheets directly from their browser memory.

**4. Interactive Visualization Controls**
- Add on-the-fly "Group By" capabilities to charts to let users aggregate data dynamically on the frontend.
- Add "Sort" controls to data tables and charts so users can reorder their result sets visually without needing a new LLM query.

**5. Complex Aggregations & Joins**
- Upgrade the backend Schema Extraction to compile multi-collection dependency maps.
- Advance the Gemini System Prompt to enforce complex cross-collection relational querying using `$lookup`, nested arrays using `$unwind`, and temporal operators (`$dateTrunc`).

## 🛠️ Getting Started

### Prerequisites
- Docker Desktop
- Node.js (for local CLI tooling)
- `.env` file containing `GEMINI_API_KEY` and `ENCRYPTION_KEY` (See `.env.example`).

### Running Locally
```bash
# Start all containers in development mode (hot-reloading enabled)
docker-compose up --build -d
```
Access the application at `http://localhost:3000`.

## 🔒 Security Summary
- **Read-Only**: The backend query execution engine physically rejects `$out` or `$merge` mutation stages.
- **Key Safety**: The `ENCRYPTION_KEY` is completely decoupled from the container state, preventing data loss across restarts.

---
*This is a research project exploring the intersection of Generative AI, Data Engineering, and User Experience.*
