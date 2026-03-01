# Running the Application 🚀

This document outlines how to spin up the entire Natural Language to MongoDB dashboard, including the frontend, backend, and the MongoDB system database.

## Prerequisites

Before you start, ensure you have the following installed on your machine:
- **Docker** and **Docker Compose**
- A **Google Gemini API Key** (Get one from [Google AI Studio](https://aistudio.google.com/app/apikey))

---

## Quick Start (Automated Scripts)

We have provided ready-to-use executable scripts that will check for your environment configuration and start up Docker automatically.

### For Windows Users (CMD/PowerShell)
Double-click the `run.bat` file, or run it via terminal:
```cmd
.\run.bat
```

### For Mac/Linux/Git Bash Users
Ensure the script is executable, then run it:
```bash
chmod +x run.sh
./run.sh
```

**What the scripts do:**
1. Check if a `.env` file exists. If it doesn't, it creates one from `.env.example` and pauses to let you insert your API Key.
2. Runs the Docker Compose build logic out of the box (`docker-compose up -d --build`).
3. Outputs the URLs where the system is accessible.

---

## Manual Start

If you prefer applying the commands manually without the wrapper scripts:

1. **Setup Environment**: Copy `.env.example` to `.env`.
   ```bash
   cp .env.example .env
   ```
2. **Add API Key**: Open `.env` and add your Gemini API Key.
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. **Build and Run**: Run Docker Compose in detached mode.
   ```bash
   docker-compose up -d --build
   ```

---

## Application Access Points

Once startup completes, your containers will be exposed on the following ports:

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:3000](http://localhost:3000) | The Next.js dashboard where you log in and ask questions. |
| **Backend API** | [http://localhost:8000/docs](http://localhost:8000/docs) | The FastAPI Swagger documentation. Great for testing raw endpoints. |
| **System MongoDB** | `localhost:27017` | The internal Mongo database mapping users to connection strings. |

### Stopping the Services
To shut down the entire stack without wiping out your System Database data (since it uses a Docker cache volume):
```bash
docker-compose down
```

To entirely wipe out everything, including saved data and volumes:
```bash
docker-compose down -v
```
