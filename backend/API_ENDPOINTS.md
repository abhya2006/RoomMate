# RoomMate API endpoints

Base URL:

```text
http://localhost:8080
```

## Recommended Postman order

Import these files:

- `../postman/RoomMate API.postman_collection.json`
- `../postman/RoomMate Local.postman_environment.json`

Select **RoomMate Local**, then run:

1. `Health / API health`
2. `Authentication / Register`
3. `Authentication / Login`
4. `Authentication / Current user (JWT required)`
5. `DigiLocker / Start verification`

The Login request stores the returned JWT in `authToken`, so the Current user
request sends it automatically.

## Endpoint reference

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/v1/health` | Public | API health |
| GET | `/actuator/health` | Public | Spring health/readiness |
| POST | `/api/v1/auth/register` | Public | Create a user |
| POST | `/api/v1/auth/login` | Public | Login with username or email |
| GET | `/api/v1/auth/me` | Bearer JWT | Return the logged-in user |
| POST | `/api/v1/auth/digilocker/start` | Public | DigiLocker integration boundary |

## Register request

```json
{
  "username": "abhay",
  "email": "abhay@example.com",
  "password": "StrongPass@@123",
  "fullName": "Abhay Kumar",
  "phoneNumber": "9876543210",
  "aadhaarNumber": "123456789012"
}
```

Expected success: `201 Created`.

The full Aadhaar number is never returned or stored. The response exposes only
`aadhaarLastFour`. Passwords are stored as BCrypt hashes.

## Login request

```json
{
  "identifier": "abhay",
  "password": "StrongPass@@123"
}
```

Expected success: `200 OK`. Copy the `token` value only if testing manually.
In Postman, the collection test script stores it automatically.

For manual protected requests:

```text
Authorization: Bearer <token>
```

## Expected errors

- `400`: invalid or missing request fields
- `401`: invalid credentials or missing/invalid JWT
- `409`: duplicate username, email, phone, or Aadhaar
- `501`: DigiLocker credentials are not configured yet

## DigiLocker status

The endpoint is only a provider integration boundary at this stage. It must not
set `digilockerVerified` to `true` until official DigiLocker partner credentials,
OAuth state validation, consent, callback handling, and server-side verification
are implemented.
