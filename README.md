# RoomMate

RoomMate is a room-rental and co-living platform with a Spring Boot API and a
React frontend. The project is organized as two independent application
modules:

```text
RoomMate/
├── backend/       Spring Boot API, MySQL, Flyway, JWT and OTP services
├── frontend/      React + Vite web application
├── postman/       API requests and local environment
├── Doc/           Project architecture documents
└── .vscode/       VS Code launch and task configuration
```

## Requirements

- Java 21 or newer
- Maven 3.9+
- MySQL 8+
- Node.js 20+
- Postman (optional, for API testing)

## Configure backend

Copy the example environment file:

```powershell
Copy-Item backend\.env.example backend\.env
```

Set the local MySQL credentials in `backend\.env`. For email OTP, configure
Gmail SMTP with a Google App Password (not your normal account password):

```text
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-google-app-password
MAIL_FROM=your-email@gmail.com
APP_OTP_DELIVERY_MODE=email
```

The `email` mode sends and verifies the OTP by email. To require a separate SMS
code as well, set `APP_OTP_DELIVERY_MODE=email-sms` and configure the approved
MSG91 credentials shown in `backend\.env.example`.

`backend\.env` is ignored by Git. Never commit credentials.

## Run the complete project

Open two PowerShell terminals from the repository root.

### Terminal 1: backend API

Use Maven, not raw `javac`:

```powershell
& "C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2024.3.1\plugins\maven\lib\maven3\bin\mvn.cmd" -f backend\pom.xml spring-boot:run
```

If Maven is available on PATH, this shorter command also works:

```powershell
mvn -f backend\pom.xml spring-boot:run
```

Wait for `Tomcat started on port 8080`, then verify:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/health
Invoke-RestMethod http://localhost:8080/actuator/health
```

Both responses should report `UP`.

### Terminal 2: frontend web app

Keep the backend terminal running, then:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

The frontend uses `http://localhost:8080` for the API by default. To override it,
create `frontend\.env.local`:

```text
VITE_API_BASE_URL=http://localhost:8080
```

## Test OTP authentication

1. Open the frontend or import the requests from `postman\`.
2. Register with a real email address and Indian mobile number.
3. The backend returns a `challengeId` and sends one OTP by email and one by SMS.
4. Submit both OTPs using the register verification request.
5. Login uses username/email and password directly; it does not require OTP.
6. Forgot password uses both OTPs before changing the password.

Without valid SMTP and MSG91 credentials, OTP delivery returns an explicit
configuration error.

## Postman

Import the requests under:

```text
postman\RoomMate API\
```

Use `postman\RoomMate Local.environment.yaml` and run requests in this order:

1. Health
2. Register
3. Register verify OTP
4. Login
5. Current user

## Deploy with Vercel and Render

Deploy `frontend/` as a Vercel project with the framework preset `Vite`.
Set `VITE_API_BASE_URL` to the public Render API URL before deploying.

Deploy the `backend/` service on Render using the included Dockerfile and
`render.yaml`. Render needs a reachable external MySQL 8 database because the
backend persists users, OTP challenges, and room listings in MySQL.
Configure `CORS_ALLOWED_ORIGINS` on Render with the exact Vercel domain.
Set real production secrets and provider credentials in Render environment
variables; never copy local `.env` values into source control.

## Verify builds

From the repository root:

```powershell
cd frontend
npm install
npm run build
cd ..
mvn -f backend\pom.xml verify
```

## Stop the applications

Press `Ctrl+C` in each terminal running the backend and frontend.
