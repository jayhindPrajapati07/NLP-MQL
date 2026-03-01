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

## 🚀 Getting Started

*(Instructions will be populated once the codebase is initialized)*

### Prerequisites
- Docker and Docker Compose
- Google Gemini API Key

### Installation via Docker
1. Clone the repository.
2. Provide environment variables (`.env`).
3. Run `docker-compose up --build`.
4. Access the dashboard at `http://localhost:3000`.

## 🔒 Security Considerations
- **Read-Only Enforcement**: At the code level, only `find` and `aggregate` methods will be supported for external database connections.
- **Credential Encryption**: External connection strings must be encrypted at rest in the System Database.

---
*This is a research project exploring the intersection of Generative AI, Data Engineering, and User Experience.*
