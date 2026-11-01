# RoomMate API

Spring Boot backend for RoomMate. The module is intentionally isolated from the existing Next.js app in `web/`.

## Prerequisites

- Java 21
- Maven 3.9+
- MySQL 8+

## Local setup

1. Copy `.env.example` to `.env` and set your local MySQL credentials. The `.env` file is ignored by Git.
2. Start the API:

   ```powershell
   mvn spring-boot:run
   ```

In VS Code, do not use **Run Code** on `RoomMateApplication.java`; that invokes
`javac` on one file and cannot load Maven dependencies. Use the `RoomMate API`
launch configuration in `.vscode/launch.json`, or run the `RoomMate API: Maven run`
task from **Terminal > Run Task**.

3. Verify:

   ```powershell
   Invoke-RestMethod http://localhost:8080/api/v1/health
   Invoke-RestMethod http://localhost:8080/actuator/health
   ```

Flyway owns schema creation. Keep `spring.jpa.hibernate.ddl-auto=validate`; add a new `V<version>__<description>.sql` migration for every schema change.

## Authentication

The ready-to-import Postman collection is at `../postman/RoomMate API.postman_collection.json`.
Import it into Postman, select the `RoomMate Local` environment, then run `Health`,
`Register`, and `Login` in that order. The login script stores the JWT automatically.
For the complete endpoint list, request bodies, auth requirements and expected
status codes, see [`API_ENDPOINTS.md`](./API_ENDPOINTS.md).

Create an account manually:

```powershell
Invoke-RestMethod -Method Post http://localhost:8080/api/v1/auth/register `
  -ContentType 'application/json' `
  -Body '{"username":"abhay","email":"abhay@example.com","password":"strong-password","fullName":"Abhay Kumar","phoneNumber":"9876543210","aadhaarNumber":"123456789012"}'
```

Login with username or email:

```powershell
Invoke-RestMethod -Method Post http://localhost:8080/api/v1/auth/login `
  -ContentType 'application/json' `
  -Body '{"identifier":"abhay","password":"strong-password"}'
```

The response contains a short-lived JWT bearer token. Use a strong random `JWT_SECRET` in every non-local environment; never commit it.

Use the token on the protected current-user endpoint:

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/auth/me `
  -Headers @{ Authorization = "Bearer <token-from-login-response>" }
```

Registration also collects the user's full name, Indian mobile number and Aadhaar number.
The API never stores the full Aadhaar number: it stores a keyed SHA-256 digest for
duplicate detection and only the last four digits for display. Send it only over HTTPS
in deployed environments.

## DigiLocker verification

DigiLocker verification must use the official partner OAuth/consent flow. It cannot be
implemented or marked verified using only an Aadhaar number. The current backend exposes
`POST /api/v1/auth/digilocker/start` as the integration boundary. Until official
partner credentials and the approved authorization URL are configured, it returns
`501 Not Implemented` rather than claiming a false verification.

Configure these values through the ignored local `.env` file after DigiLocker partner
onboarding:

```text
DIGILOCKER_CLIENT_ID=
DIGILOCKER_CLIENT_SECRET=
DIGILOCKER_AUTHORIZATION_URL=
```

The eventual callback must validate the provider's state and token response, request
only user-consented documents, and set `digilocker_verified` only after successful
server-side verification. Do not accept a client-supplied "verified" flag.

## Verification

```powershell
mvn test
mvn verify
```

The test suite uses Spring Boot's test support. Integration tests should use a dedicated local MySQL test database or a CI-managed MySQL service.

## Structure

```text
backend/
├── pom.xml
├── .env.example
├── README.md
└── src/
    ├── main/
    │   ├── java/com/roommate/api/
    │   │   ├── controllers/  # HTTP endpoints
    │   │   ├── common/       # API errors and shared web concerns
    │   │   ├── dto/          # request and response models
    │   │   ├── entity/       # JPA entities
    │   │   ├── repository/   # persistence interfaces
    │   │   ├── security/     # JWT and Spring Security
    │   │   └── services/     # business logic
    │   │   └── RoomMateApplication.java
    │   └── resources/
    │       ├── db/migration/ # forward-only Flyway migrations
    │       └── application.yml
    └── test/

postman/
├── RoomMate API.postman_collection.json
└── RoomMate Local.postman_environment.json
```

The backend uses feature-based layering: `auth` contains authentication
controllers, services, repositories, entities and security concerns; `common`
contains shared API error handling; and `health` contains the health controller.
Keep future features in the same pattern instead of putting business logic in
controllers.
