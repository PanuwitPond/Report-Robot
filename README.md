# Report-Robot


AI Report System with NestJS Backend, React Frontend, and Keycloak Authentication

## Table of Contents

- [Prerequisites](#prerequisites)
- [Database Requirements](#database-requirements)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Configuration Files](#configuration-files-important)
- [Starting the Application](#starting-the-application)
- [Service Endpoints](#service-endpoints)
- [Tech Stack](#tech-stack)
- [Available Commands](#available-commands)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Important: About .env Files & Sensitive Data](#important-about-env-files--sensitive-data)
- [License](#license)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager

External Services Required:
- **PostgreSQL Databases** (Multiple instances as outlined in Database Requirements section)
- **MinIO** (S3-compatible object storage)
- **Keycloak** (provided in keycloak-26.4.5 folder)
- **FFmpeg** (optional, for video processing)
- **JasperServer** (optional, for advanced report generation)

Note: Docker is not required for local development.

## Project Structure

```
Report-Robot/
├── backend/                    # NestJS API Server
│   ├── src/
│   │   ├── modules/           # Feature modules (auth, reports, robots, tasks, etc.)
│   │   ├── database/          # Database configuration
│   │   ├── config/            # Application configuration
│   │   ├── storage/           # Storage service (MinIO)
│   │   ├── app.module.ts      # Root module
│   │   └── main.ts            # Application entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React + Vite Application
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service clients
│   │   ├── contexts/         # React contexts (Auth, Domain)
│   │   ├── types/            # TypeScript type definitions
│   │   ├── config/           # Frontend configuration
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Application entry point
│   ├── package.json
│   ├── vite.config.ts        # Vite configuration
│   └── tsconfig.json
├── keycloak-26.4.5/          # Authentication Service (Keycloak)
│   ├── bin/                  # Executable scripts
│   ├── conf/                 # Configuration files
│   └── lib/                  # Libraries
└── README.md                 # This file
```

## Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/PanuwitPond/Report-Robot.git
cd Report-Robot
```

### Step 2: Install Dependencies

Install backend dependencies:

```bash
cd backend
npm install
cd ..
```

Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

## Configuration Files (IMPORTANT)

Before starting the application, you must configure the .env files to match your environment.

### backend/.env - Backend Configuration

Key configurations required:

**Database Connections:**
- DATABASE_HOST, DATABASE_PORT, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_NAME
- MIOC_DB_HOST, MIOC_DB_PORT, MIOC_DB_USERNAME, MIOC_DB_PASSWORD, MIOC_DB_NAME
- ROBOT_DB_HOST, ROBOT_DB_PORT, ROBOT_DB_USER, ROBOT_DB_PASSWORD, ROBOT_DB_NAME
- MROI_DB_HOST, MROI_DB_PORT, MROI_DB_USERNAME, MROI_DB_PASSWORD, MROI_DB_NAME
- WF_DB_HOST, WF_DB_PORT, WF_DB_USER, WF_DB_PASSWORD, WF_DB_NAME

**MinIO Configuration:**
- MINIO_ENDPOINT, MINIO_PORT, MINIO_USE_SSL
- MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_BUCKET

**Keycloak Configuration:**
- KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET
- KEYCLOAK_ADMIN_USERNAME, KEYCLOAK_ADMIN_PASSWORD

**Other Settings:**
- JWT_SECRET (change before production!)
- JWT_EXPIRATION
- PORT (default 3001)
- FFMPEG_PATH (optional, auto-detected if not set)

### frontend/.env - Frontend Configuration

```
VITE_API_BASE_URL=http://localhost:3001/api
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=METTHIER_Report
VITE_KEYCLOAK_CLIENT_ID=metthier-report-backend
```

Important: Keycloak realm and client ID must match backend configuration.

## Starting the Application

Follow these steps in order to start all services:

### Pre-startup Verification

**1. Verify Database Connectivity:**

All 5 databases must be accessible. Test with psql or your database client:
```bash
psql -h 192.168.100.125 -U kdadmin -d know_db
```

If connection fails, verify network connectivity, firewall rules, and update .env with correct connection details.

**2. Verify MinIO Accessibility:**

Test MinIO endpoint is reachable and credentials are correct.

**3. Verify Keycloak Configuration:**

Ensure Keycloak realm "METTHIER_Report" and client exist before starting backend.

### Step 1: Start Keycloak (Authentication Service)

Open a terminal and navigate to the keycloak directory:

```bash
cd keycloak-26.4.5
.\bin\kc.bat start-dev
```

Wait for Keycloak to fully start (2-5 minutes). Verify at http://localhost:8080/admin and ensure realm "METTHIER_Report" exists.

### Step 2: Start Backend API Server

Open a new terminal and navigate to the backend directory:

```bash
cd backend
npm run start:dev
```

The backend will start in watch mode and listen on port 3001. You should see:
```
Application is running on: http://localhost:3001/api
```

### Step 3: Start Frontend Application

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm run dev
```

The frontend will start on port 3000. Open your browser and navigate to:
```
http://localhost:3000
```

Note: The backend CORS configuration is set to allow requests only from `http://localhost:3000`. If you use a different frontend port, you must update the CORS origin in `backend/src/main.ts`.

### Quick Verification After Startup

After all three services are running, perform these checks:

1. **Test Keycloak**:
   - Visit http://localhost:8080 in your browser
   - You should see the Keycloak login page

2. **Test Backend**:
   - Visit http://localhost:3001/api in your browser
   - You should see a JSON response or proper HTTP status

3. **Test Frontend to Backend Communication**:
   - Open http://localhost:3000 in browser
   - Open Developer Tools (F12) and go to Network tab
   - Perform any API action and verify network calls succeed

### Verification Checklist

- [ ] Keycloak is running on http://localhost:8080
- [ ] Backend API is running on http://localhost:3001/api
- [ ] Frontend is accessible on http://localhost:3000
- [ ] Frontend can communicate with Backend API (check Network tab)
- [ ] Keycloak login page loads without CORS errors

## Service Endpoints

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main user interface |
| Backend API | http://localhost:3001/api | REST API endpoints |
| Keycloak | http://localhost:8080 | Authentication and authorization service |

## Tech Stack

### Backend
- **Framework**: NestJS 10.x
- **Runtime**: Node.js
- **Database ORM**: TypeORM
- **Authentication**: JWT + Passport + Keycloak
- **Validation**: class-validator
- **HTTP Client**: Axios
- **File Handling**: fluent-ffmpeg
- **Storage**: MinIO client

### Frontend
- **Framework**: React 18.x
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **UI Framework**: Bootstrap 5
- **Authentication Client**: keycloak-js
- **Form Handling**: React Hook Form
- **Data Visualization**: Recharts
- **HTTP Client**: Axios
- **Date Handling**: dayjs

### Authentication
- **Service**: Keycloak 26.4.5
- **Protocol**: OpenID Connect / OAuth2

## Available Commands

### Backend Commands

```bash
cd backend

# Start in development mode with watch
npm run start:dev

# Start in production mode
npm start

# Build for production
npm run build

# Format code with Prettier
npm run format

# Run ESLint and fix issues
npm run lint

# Start in debug mode with watch
npm run start:debug

# Run production build
npm run start:prod
```

### Frontend Commands

```bash
cd frontend

# Start development server with Vite
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint and report unused directives
npm run lint
```

## Changing Ports

If you need to run services on different ports:

### Change Frontend Port

1. Edit `frontend/vite.config.ts`:
   ```typescript
   server: {
     port: 5173,  // Change this to your desired port
     proxy: {
       '/api': {
         target: 'http://localhost:3001',
         changeOrigin: true,
       },
     },
   }
   ```

2. Update Backend CORS configuration in `backend/src/main.ts`:
   ```typescript
   app.enableCors({
     origin: 'http://localhost:5173',  // Change to match frontend port
     credentials: true,
   });
   ```

### Change Backend Port

1. Set environment variable when starting backend:
   ```bash
   cd backend
   set PORT=3002
   npm run start:dev
   ```

2. Update Frontend proxy target in `frontend/vite.config.ts`:
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:3002',  // Change to match backend port
       changeOrigin: true,
     },
   }
   ```

## Environment Configuration

### Keycloak Configuration (First Time Setup)

When starting Keycloak for the first time:

1. Wait for the server to fully initialize (2-5 minutes)
2. Access Keycloak admin console at http://localhost:8080/admin
3. Default credentials may need to be configured on first access
4. Create or configure the realm that matches your application settings
5. Ensure the frontend and backend use the same Keycloak URL: `http://localhost:8080`

If you encounter issues:
- Check Keycloak terminal for error messages
- Verify port 8080 is not blocked by firewall
- Ensure no other services are using port 8080
- Clear browser cookies if seeing login issues

### Backend Configuration

The backend uses environment variables for configuration. Key settings include:

- **PORT**: Backend server port (default: 3001)
- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: Secret key for JWT tokens
- **KEYCLOAK_URL**: Keycloak server URL (http://localhost:8080)
- **MINIO_***: MinIO storage configuration

Currently, there is no .env template file. Configuration can be adjusted in `backend/src/database/database.module.ts` and other module files.

### Frontend Configuration

Frontend configuration is defined in:

- **vite.config.ts**: Vite build and proxy settings
- **src/config/constants.ts**: Application constants

Default values:
- **API_BASE_URL**: http://localhost:3001/api
- **KEYCLOAK_URL**: http://localhost:8080

The frontend proxies API requests to `/api/*` which are forwarded to the backend at http://localhost:3001.

Important: Backend CORS is configured to only accept requests from `http://localhost:3000`. If you change the frontend port, update the CORS origin in `backend/src/main.ts` (see Changing Ports section).

## API Documentation

### Base URL

```
http://localhost:3001/api
```

### Main API Endpoints

The API is organized into modules:

- **Authentication** (`/auth`): Login and token management
- **Users** (`/users`): User management and profiles
- **Reports** (`/reports`): Report generation and retrieval
- **Robots** (`/robots`): Robot configuration and management
- **Tasks** (`/tasks`): Task management and scheduling
- **Images** (`/images`): Image upload and processing
- **MROI** (`/mroi`): MROI-specific operations

All endpoints require authentication with a valid JWT token obtained from Keycloak.

## Development

### Project Architecture

- **Backend**: Modular NestJS architecture with separate feature modules
- **Frontend**: Component-based React architecture with service layer
- **Authentication**: Keycloak handles all authentication and authorization

### Code Structure

Backend modules are organized by feature:
```
backend/src/modules/
├── auth/        # Authentication and authorization
├── users/       # User management
├── reports/     # Report generation
├── robots/      # Robot configuration
├── tasks/       # Task management
├── images/      # Image handling
└── mroi/        # MROI features
```

Frontend components are organized by type:
```
frontend/src/
├── components/  # Reusable UI components
├── pages/       # Page-level components
├── services/    # API client services
├── contexts/    # React context providers
├── types/       # TypeScript definitions
└── utils/       # Utility functions
```

## Troubleshooting

### Keycloak fails to start

**Problem**: `.\bin\kc.bat start-dev` returns an error

**Solution**:
1. Ensure you are in the `keycloak-26.4.5` directory
2. Check if port 8080 is not already in use: `netstat -ano | findstr :8080`
3. Delete the `data/` folder in keycloak directory and retry

### Backend fails to connect to database

**Problem**: Backend startup fails with database connection error

**Solution**:
1. Check database connection string in `backend/src/database/database.module.ts`
2. Ensure PostgreSQL is running on the configured host and port
3. Verify database name and credentials

### Frontend cannot reach backend API

**Problem**: Network error when frontend tries to call API

**Solution**:
1. Verify backend is running on http://localhost:3001
2. Check CORS configuration in `backend/src/main.ts`
3. Check frontend proxy configuration in `frontend/vite.config.ts`
4. Clear browser cache and restart frontend dev server

### Port already in use

**Problem**: "Port XXX is already in use" error

**Solution**:
- **For port 3000 (Frontend)**: Kill process on port 3000
- **For port 3001 (Backend)**: Kill process on port 3001
- **For port 8080 (Keycloak)**: Kill process on port 8080

On Windows:
```bash
# Find process using port (e.g., 3000)
netstat -ano | findstr :3000

# Kill process by PID (replace XXXX with actual PID)
taskkill /PID XXXX /F
```

### Keycloak login issues

**Problem**: Cannot login or login page not loading

**Solution**:
1. Verify Keycloak is running on http://localhost:8080
2. Check that frontend has `VITE_KEYCLOAK_URL` correctly configured
3. Ensure you are using correct realm and client credentials
4. Check browser console for detailed error messages

### Database connection timeout

**Problem**: "Database connection timeout" or "connection refused"

**Solution**:
1. Verify the database host is accessible: `ping <database-host>`
2. Check firewall allows port 5432: `telnet <database-host> 5432`
3. Verify credentials in .env are correct
4. Ensure database is actually running and accessible from your network
5. Check network connectivity and VPN if accessing remote databases

### MinIO connection failed

**Problem**: "MinIO connection failed" or "403 Forbidden" errors

**Solution**:
1. Verify MinIO endpoint is accessible: `curl -k https://<minio-endpoint>:<port>`
2. Check MinIO credentials (access key and secret key) are correct
3. Verify bucket exists and is accessible with provided credentials
4. Check if MinIO requires specific security certificates
5. Verify SSL/TLS setting matches MinIO configuration

## Important: About .env Files & Sensitive Data

The .env files contain sensitive information including passwords and credentials. Please follow these guidelines:

### Security Best Practices

1. **Never commit .env to version control:**
   - Both .env files are in .gitignore for security
   - Always keep credentials private

2. **For Zip distribution:**
   - When packaging the project, consider whether to include actual .env files
   - Option A: Include .env with template values (recommended for initial setup)
   - Option B: Include .env.example only and ask users to create .env with their values

3. **When downloading from Zip:**
   - Review all .env values and update them to match your environment
   - Never use production credentials in development environment
   - Change JWT_SECRET before deploying to production
   - Rotate Keycloak client secrets periodically

4. **Database Credentials:**
   - Ensure .env database credentials have correct host and port
   - Verify database username and password
   - Test connections before starting backend

5. **MinIO Credentials:**
   - Update MINIO_ENDPOINT and credentials to your MinIO instance
   - Verify bucket exists and is accessible
   - Consider using IAM roles instead of access keys in production

6. **Keycloak Secrets:**
   - Keep KEYCLOAK_CLIENT_SECRET confidential
   - Change admin password after initial Keycloak setup
   - Use strong passwords for Keycloak users

### Example: Updating .env for Your Environment

```bash
# Edit backend/.env
DATABASE_HOST=your-database-host
DATABASE_PORT=5432
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password

MINIO_ENDPOINT=your-minio-server.com
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key

# Edit frontend/.env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_KEYCLOAK_URL=http://localhost:8080
```

### Environment-Specific .env Files

For managing multiple environments, consider creating:
- `.env.local` - Local development
- `.env.staging` - Staging environment
- `.env.production` - Production environment

Keep only necessary credentials in each, and never share sensitive files across environments.

## License

MIT License

## Contact

For questions or issues, please contact the project maintainers.
