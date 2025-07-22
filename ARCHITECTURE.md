## 🧱 Architectural Principles

This SaaS starter template follows key architectural principles to ensure maintainability, scalability and clean separation of concerns:

* **Folder-by-feature** structure
  * Organizes code by business domain/feature rather than technical type
  * Each feature module is self-contained with its own controllers, services, DTOs
  * Preferred for SaaS applications as it improves modularity and navigation
  
* **Thin controllers, fat services** pattern
  * Controllers only handle HTTP concerns (routing, request/response)
  * Business logic lives in service layer
  * Improves testability and reusability

* **Clean separation of concerns**
  * DTOs - Handle request/response validation and transformation
  * Entities - Prisma models representing database schema
  * Guards - Handle authentication and authorization
  * Interceptors - Transform responses, handle errors, logging
  * Pipes - Request validation and transformation

* **Convention over configuration**
  * Consistent naming and structure across modules
  * Standard patterns for common operations (CRUD, auth, etc)
  * Reduces cognitive load and improves maintainability

---

## 🗂️ Recommended Module Structure

```
apps/api/
├── src/
│   ├── auth/                 # Auth module: JWT, login, register
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   ├── strategies/
│   │   └── guards/
│   ├── user/                 # User module: profile, roles
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.module.ts
│   │   ├── dto/
│   │   └── interfaces/
│   ├── role/                 # Role module: management, seeding
│   │   └── role.module.ts
│   ├── subscription/         # Stripe sync, webhook handlers
│   │   └── subscription.module.ts
│   ├── common/               # Shared logic (guards, utils, constants)
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── filters/
│   ├── prisma/               # Prisma service + injectables
│   │   └── prisma.service.ts
│   ├── main.ts               # Bootstrap entry
│   └── app.module.ts         # Global imports
```

---

## 🔐 `auth` Module

Handles:

* `/auth/register`
* `/auth/login`
* `/auth/logout`
* Refresh token flow
* JWT strategy
* Guards (e.g., `JwtAuthGuard`, `RolesGuard`)

---

## 👤 `user` Module

Handles:

* `/user/me` (get profile)
* `/user/update`
* `/user/roles` (get current user’s roles)
* Optional: assign roles (admin only)

---

## 💳 `subscription` Module

Handles:

* `/billing/portal`
* Stripe webhook listener (`/webhooks/stripe`)
* Syncing subscription tiers & statuses

---

## 🔗 `role` Module

Handles:

* Role creation
* Role listing (for admin)
* Attaching/detaching roles to users

> 💡 Seed roles at startup if not present (`onModuleInit()` or CLI script)

---

## 🛠 `prisma` Module

* Singleton service wrapping Prisma Client
* Handles transaction support and lifecycle hooks

```ts
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

---

## 📂 Folder Naming Conventions

| Folder        | Purpose                             |
| ------------- | ----------------------------------- |
| `dto/`        | Input/output validation             |
| `guards/`     | Auth, RBAC                          |
| `decorators/` | Custom decorators (`@User()`)       |
| `interfaces/` | Shared interfaces or response types |
| `strategies/` | JWT, OAuth, API key strategies      |

---

## 🔌 Shared Modules

Create a `CommonModule` if needed for:

* Global pipes
* Exception filters
* Response interceptors
* Logger setup