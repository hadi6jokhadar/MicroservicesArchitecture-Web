# Error Handling Flow - Frontend ↔ Backend

**Date:** January 25, 2026

---

## 🔄 Complete Error Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Angular)                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    1. User submits form / triggers action
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │   Component / Service     │
                    │   (e.g., UserService)     │
                    └───────────────────────────┘
                                    │
                    2. HTTP Request (POST, GET, PUT, DELETE)
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │   Token Interceptor       │
                    │   (Adds JWT token)        │
                    └───────────────────────────┘
                                    │
                    3. Request sent to backend
                                    │
════════════════════════════════════════════════════════════════════════════
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (.NET 8)                                 │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    4. Request received by API endpoint
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │   MediatR Handler         │
                    │   (Command/Query)         │
                    └───────────────────────────┘
                                    │
                    5. Business logic / validation
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │   Exception Occurs?       │
                    └───────────────────────────┘
                            │               │
                        Yes │               │ No
                            ▼               ▼
                ┌───────────────────┐   ┌──────────────┐
                │ GlobalException   │   │   Success    │
                │    Handler        │   │   Response   │
                │ (IExceptionHand.) │   │  (200 OK)    │
                └───────────────────┘   └──────────────┘
                            │                   │
                6. Create ProblemDetails        │
                            │                   │
                ┌───────────────────────┐       │
                │   Error Response      │       │
                │   ┌───────────────┐   │       │
                │   │ status: 400   │   │       │
                │   │ title: "..."  │   │       │
                │   │ detail: "..." │   │       │
                │   │ traceId: "..."│   │       │
                │   │ errors: {...} │   │       │
                │   └───────────────┘   │       │
                └───────────────────────┘       │
                            │                   │
                    7. HTTP Response            │
                            │                   │
════════════════════════════════════════════════════════════════════════════
                            │                   │
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Angular)                              │
└─────────────────────────────────────────────────────────────────────────┘
                            │                   │
                    8. Response received        │
                            │                   │
                            ▼                   ▼
                ┌───────────────────┐   ┌──────────────┐
                │ Error Interceptor │   │  Component   │
                │  catches error    │   │   handles    │
                └───────────────────┘   │   success    │
                            │           └──────────────┘
                9. Parse error format
                   (ProblemDetails or
                    ErrorResponse)
                            │
                            ▼
                ┌───────────────────────────────────┐
                │ Route to handler by status code:  │
                │                                    │
                │  0   → handleNetworkError()        │
                │  400 → handleBadRequest()          │
                │  401 → handleUnauthorized()        │
                │  403 → handleForbidden()           │
                │  404 → handleNotFound()            │
                │  409 → handleConflict()            │
                │  500 → handleServerError()         │
                └───────────────────────────────────┘
                            │
                    10. Execute handler
                            │
                ┌───────────┴───────────┬──────────────┐
                │                       │              │
                ▼                       ▼              ▼
    ┌───────────────────┐  ┌─────────────────┐  ┌──────────────┐
    │   Show Toast      │  │ Redirect Login  │  │ Log to       │
    │   Notification    │  │  (if 401)       │  │ Console      │
    │                   │  │                 │  │              │
    │ ┌──────────────┐  │  │ 1. Clear tokens │  │ - Type       │
    │ │🔴 Error Title│  │  │ 2. Navigate to  │  │ - Timestamp  │
    │ │              │  │  │    /auth/login  │  │ - Status     │
    │ │ Description  │  │  │ 3. returnUrl    │  │ - Message    │
    │ │              │  │  │    preserved    │  │ - TraceId    │
    │ │ Duration: 5s │  │  │                 │  │ - URL        │
    │ └──────────────┘  │  │                 │  │ - Errors     │
    └───────────────────┘  └─────────────────┘  └──────────────┘
                │                   │                  │
                └───────────────────┴──────────────────┘
                                    │
                    11. User sees error notification
                        Developer sees console log
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │   End of Flow         │
                        └───────────────────────┘
```

---

## 📊 Error Type Examples

### 1. Validation Error (400)

```
Backend:
┌────────────────────────────────────────┐
│ ValidationException thrown             │
│ ├─ Email: ["Required", "Invalid"]     │
│ └─ Password: ["Too short"]            │
└────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│ GlobalExceptionHandler                 │
│ → ProblemDetails                       │
│    {                                   │
│      status: 400,                      │
│      errors: {                         │
│        "email": ["Required", "Invalid"]│
│        "password": ["Too short"]       │
│      }                                 │
│    }                                   │
└────────────────────────────────────────┘
                │
                ▼
Frontend:
┌────────────────────────────────────────┐
│ Error Interceptor                      │
│ → handleBadRequest()                   │
│                                        │
│ Toast:                                 │
│ 🔴 Validation Failed (2 fields)        │
│ email: Required, Invalid               │
│ password: Too short                    │
└────────────────────────────────────────┘
```

---

### 2. Unauthorized (401)

```
Backend:
┌────────────────────────────────────────┐
│ UnauthorizedException thrown           │
│ "Token expired"                        │
└────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│ GlobalExceptionHandler                 │
│ → ProblemDetails                       │
│    {                                   │
│      status: 401,                      │
│      title: "Unauthorized",            │
│      detail: "Token expired"           │
│    }                                   │
└────────────────────────────────────────┘
                │
                ▼
Frontend:
┌────────────────────────────────────────┐
│ Error Interceptor                      │
│ → handleUnauthorized()                 │
│                                        │
│ Actions:                               │
│ 1. Toast: "Your session expired"      │
│ 2. localStorage.removeItem('token')   │
│ 3. router.navigate(['/auth/login'])   │
└────────────────────────────────────────┘
```

---

### 3. Server Error (500)

```
Backend:
┌────────────────────────────────────────┐
│ Unexpected Exception                   │
│ "Database connection failed"           │
│ TraceId: "00-abc123..."                │
└────────────────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────┐
│ GlobalExceptionHandler                 │
│ → ProblemDetails                       │
│    {                                   │
│      status: 500,                      │
│      title: "Internal Server Error",   │
│      detail: "Unexpected error",       │
│      traceId: "00-abc123..."           │
│    }                                   │
└────────────────────────────────────────┘
                │
                ▼
Frontend:
┌────────────────────────────────────────┐
│ Error Interceptor                      │
│ → handleServerError()                  │
│                                        │
│ Toast:                                 │
│ 🔴 Server Error                        │
│ An unexpected error occurred           │
│ (Trace ID: 00-abc123...)               │
│                                        │
│ Console Log:                           │
│ [Error Interceptor] Server Error:     │
│ { type, timestamp, status, traceId }  │
└────────────────────────────────────────┘
```

---

## 🔍 Trace ID Flow

```
Request ID: 00-abc123def456...
│
├─ Frontend
│  ├─ User Action: "Create User" button clicked
│  ├─ HTTP Request: POST /api/users
│  │  └─ Headers: { Authorization: "Bearer ...", x-tenant-id: "..." }
│  │
│  └─ Error Response Received
│     └─ Console: [Error Interceptor] { traceId: "00-abc123..." }
│
├─ Backend
│  ├─ Request Received: POST /api/users
│  ├─ MediatR Handler: CreateUserCommandHandler
│  ├─ Exception: ConflictException("Email already exists")
│  ├─ GlobalExceptionHandler
│  │  └─ Create ProblemDetails with TraceId
│  │
│  └─ Logs
│     └─ [Error] Conflict: Email exists | TraceId: 00-abc123...
│
└─ User
   └─ Sees Toast: "Conflict - Email already exists"
      └─ Reports: "I got error with Trace ID: 00-abc123..."

Developer Search:
1. Frontend Console → Find TraceId: 00-abc123...
2. Backend Logs → Search TraceId: 00-abc123...
3. Full Stack Trace → Identify root cause
```

---

## 🎯 Component Interaction

```
┌──────────────────────────────────────────────────────────────┐
│                     Angular Application                       │
│                                                               │
│  ┌─────────────────┐                                         │
│  │   Component     │                                         │
│  │ (user-form.ts)  │                                         │
│  └────────┬────────┘                                         │
│           │ onSubmit()                                       │
│           ▼                                                  │
│  ┌─────────────────┐                                         │
│  │    Service      │                                         │
│  │  (user.service) │                                         │
│  └────────┬────────┘                                         │
│           │ createUser()                                     │
│           ▼                                                  │
│  ┌─────────────────┐        ┌──────────────────┐            │
│  │  HttpClient     │───────▶│ Token Interceptor│            │
│  │                 │        └──────────────────┘            │
│  └────────┬────────┘                 │                      │
│           │                          │ Add JWT              │
│           │◄─────────────────────────┘                      │
│           │                                                  │
│           ├──────────────────────────────────┐              │
│           │                                  │              │
│           ▼                                  ▼              │
│    ┌──────────┐                      ┌─────────────┐       │
│    │ Success  │                      │    Error    │       │
│    │ Response │                      │  Response   │       │
│    └────┬─────┘                      └──────┬──────┘       │
│         │                                   │              │
│         │                                   ▼              │
│         │                           ┌──────────────────┐   │
│         │                           │ Error Interceptor│   │
│         │                           └────────┬─────────┘   │
│         │                                    │              │
│         │                                    ├─ Show Toast  │
│         │                                    ├─ Log Error   │
│         │                                    └─ Redirect?   │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                       │
│  │   Component     │                                       │
│  │   handles       │                                       │
│  │   success       │                                       │
│  └─────────────────┘                                       │
│                                                             │
│  ┌─────────────────┐                                       │
│  │   z-toaster     │ ◄─── Toast Notifications             │
│  │ (ngx-sonner)    │                                       │
│  └─────────────────┘                                       │
│                                                             │
└──────────────────────────────────────────────────────────────┘
```

---

**Last Updated:** January 25, 2026
