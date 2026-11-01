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
6. `Authentication / Forgot password`
7. `Authentication / Reset password`
8. `Authentication / Register verify OTP`
9. `Authentication / Login verify OTP`
10. `Authentication / Forgot password request OTP`
11. `Authentication / Forgot password verify OTP`

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

| POST | `/api/v1/auth/forgot-password` | Public | Send email and phone reset OTPs |
| POST | `/api/v1/auth/reset-password` | Public | Legacy token reset endpoint |

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

## Forgot password

Request:

```json
{
  "email": "abhay@example.com"
}
```

The endpoint returns `202 Accepted`. Configure `MAIL_HOST`, `MAIL_PORT`,
`MAIL_USERNAME`, and `MAIL_PASSWORD` in the ignored `backend/.env` before
testing with a real email account. Reset tokens are stored only as SHA-256
hashes, expire after 15 minutes by default, and can be used once.

Reset request:

```json
{
  "token": "token-from-the-reset-email",
  "newPassword": "NewStrongPass@@123"
}
```

Expected success: `204 No Content`. Without mail configuration, an existing
user's forgot-password request returns `503 Service Unavailable`; no token is
returned in the API response.

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
