# RoomMate

RoomMate is organized as two independent application modules:

```text
RoomMate/
├── backend/       Spring Boot API, MySQL, Flyway, JWT and OTP services
├── frontend/      React + Vite web application
├── postman/       API requests and local environment
├── Doc/           Project architecture documents
└── .vscode/       VS Code launch and task configuration
```

## Run backend

From the repository root:

```powershell
mvn -f backend\pom.xml spring-boot:run
```

Configure local database, SMTP, and MSG91 values in the ignored
`backend\.env` file. Never commit that file.

## Run frontend

From the repository root:

```powershell
cd frontend
npm install
npm run dev
```

The frontend uses `http://localhost:8080` for the API by default. To override
it, create `frontend\.env.local` with:

```text
VITE_API_BASE_URL=http://localhost:8080
```

## Verify

```powershell
cd frontend
npm run build
cd ..
mvn -f backend\pom.xml verify
```
