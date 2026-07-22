# GymOS — A to Z Implementation Plan

### Multi-Tenant Gym Management Platform | Spring Boot + Next.js (JSX)

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Project Structure](#2-project-structure)
3. [Database Schema](#3-database-schema)
4. [Auth & Security Layer](#4-auth--security-layer)
5. [API Standards & Common Patterns](#5-api-standards--common-patterns)
6. [Module 1 — Organization & Super Admin](#6-module-1--organization--super-admin)
7. [Module 2 — Branch Management](#7-module-2--branch-management)
8. [Module 3 — Users (Members)](#8-module-3--users-members)
9. [Module 4 — Staff Management](#9-module-4--staff-management)
10. [Module 5 — Plans & Subscriptions](#10-module-5--plans--subscriptions)
11. [Module 6 — Accounts & Finance](#11-module-6--accounts--finance)
12. [Module 7 — Inventory](#12-module-7--inventory)
13. [Module 8 — Activity & Classes](#13-module-8--activity--classes)
14. [Module 9 — Workout Plans](#14-module-9--workout-plans)
15. [Module 10 — Diet Plans](#15-module-10--diet-plans)
16. [Module 11 — Attendance](#16-module-11--attendance)
17. [Module 12 — Notifications (WhatsApp + Email)](#17-module-12--notifications-whatsapp--email)
18. [Module 13 — Chat (Trainer ↔ Member)](#18-module-13--chat-trainer--member)
19. [Module 14 — Access Control (RBAC)](#19-module-14--access-control-rbac)
20. [Module 15 — Dashboard & Analytics](#20-module-15--dashboard--analytics)
21. [Module 16 — Settings](#21-module-16--settings)
22. [Frontend Architecture & UI Prompts](#22-frontend-architecture--ui-prompts)
23. [Common Bug Fixes & Hardening Checklist](#23-common-bug-fixes--hardening-checklist)
24. [Deployment Checklist](#24-deployment-checklist)

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENTS                              │
│  Next.js Web App (JSX)  │  Mobile (future PWA)           │
└──────────────┬───────────────────────────────────────────┘
               │ HTTPS / WSS
┌──────────────▼───────────────────────────────────────────┐
│              Spring Boot Application                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │Auth/JWT  │ │REST APIs │ │WebSocket │ │Schedulers  │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
│  ┌──────────────────────────────────────────────────┐    │
│  │      Domain Services (one per module)            │    │
│  └──────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────┐    │
│  │      Repository Layer (Spring Data JPA)          │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────┬───────────────────────────────────────────┘
               │
   ┌───────────┼───────────────────────────┐
   │           │                           │
┌──▼───┐  ┌───▼──┐  ┌─────────┐  ┌────────▼──────┐
│  PG  │  │Redis │  │Cloudinary│  │Twilio/SendGrid│
└──────┘  └──────┘  └─────────┘  └───────────────┘
```

### Role Hierarchy

```
SuperAdmin (Anthropic/Platform level)
    └── OrgOwner (Gym Business Owner)
            └── BranchAdmin (Per-Branch Manager)
                    ├── Trainer
                    ├── Receptionist
                    └── Member
```

### Multi-Tenancy Rule

Every DB query MUST be scoped by `org_id`. Branch-level queries additionally scoped by `branch_id`. Enforced via Spring interceptor + `@TenantContext` annotation on all repository methods.

---

## 2. Project Structure

### Backend (Spring Boot)

```
gymOS-backend/
├── src/main/java/com/gymos/
│   ├── GymOsApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── JwtConfig.java
│   │   ├── RedisConfig.java
│   │   ├── WebSocketConfig.java
│   │   ├── CloudinaryConfig.java
│   │   ├── TwilioConfig.java
│   │   └── AuditConfig.java
│   ├── common/
│   │   ├── ApiResponse.java           # Standard envelope
│   │   ├── PageResponse.java          # Paginated envelope
│   │   ├── BaseEntity.java            # id, createdAt, updatedAt, deletedAt
│   │   ├── TenantContext.java         # ThreadLocal org/branch context
│   │   ├── TenantInterceptor.java
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ErrorCodes.java
│   │   └── SoftDeleteRepository.java
│   ├── auth/
│   │   ├── AuthController.java
│   │   ├── AuthService.java
│   │   ├── JwtService.java
│   │   ├── RefreshTokenService.java
│   │   └── dto/
│   ├── organization/
│   │   ├── OrganizationController.java
│   │   ├── OrganizationService.java
│   │   ├── OrganizationRepository.java
│   │   ├── Organization.java
│   │   └── dto/
│   ├── branch/
│   ├── user/
│   ├── staff/
│   ├── plan/
│   ├── accounts/
│   ├── inventory/
│   ├── activity/
│   ├── workout/
│   ├── diet/
│   ├── attendance/
│   ├── notification/
│   ├── chat/
│   ├── rbac/
│   ├── dashboard/
│   └── settings/
└── src/main/resources/
    ├── application.yml
    ├── application-dev.yml
    └── application-prod.yml
```

### Frontend (Next.js JSX)

```
gymOS-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.jsx
│   │   └── forgot-password/page.jsx
│   ├── (dashboard)/
│   │   ├── layout.jsx                 # Shell with sidebar
│   │   ├── dashboard/page.jsx
│   │   ├── branches/
│   │   │   ├── page.jsx               # List
│   │   │   ├── [id]/page.jsx          # Detail
│   │   │   └── create/page.jsx
│   │   ├── users/
│   │   ├── staff/
│   │   ├── plans/
│   │   ├── accounts/
│   │   ├── inventory/
│   │   ├── activity/
│   │   ├── workout/
│   │   ├── diet/
│   │   ├── attendance/
│   │   ├── notifications/
│   │   ├── chat/
│   │   ├── access-control/
│   │   └── settings/
│   └── (member)/                      # Member-facing portal
│       ├── layout.jsx
│       ├── home/page.jsx
│       ├── workout/page.jsx
│       ├── diet/page.jsx
│       ├── classes/page.jsx
│       └── profile/page.jsx
├── components/
│   ├── ui/                            # Shadcn base components
│   ├── shared/
│   │   ├── DataTable.jsx              # Universal table with filters
│   │   ├── FilterBar.jsx
│   │   ├── DateRangePicker.jsx
│   │   ├── SearchInput.jsx
│   │   ├── StatCard.jsx
│   │   ├── PageHeader.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── FileUpload.jsx
│   │   └── BranchSelector.jsx
│   └── modules/                       # Module-specific components
├── lib/
│   ├── api.js                         # Axios instance + interceptors
│   ├── auth.js
│   └── utils.js
├── hooks/
│   ├── useAuth.js
│   ├── usePagination.js
│   └── useDebounce.js
└── store/
    ├── authStore.js                   # Zustand
    └── uiStore.js
```

---

## 3. Database Schema

### Core Tables

```sql
-- ORGANIZATIONS
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  logo_url      TEXT,
  phone         VARCHAR(20),
  email         VARCHAR(255),
  address       TEXT,
  gstin         VARCHAR(20),
  subscription_tier  VARCHAR(50) DEFAULT 'BASIC',
  subscription_end   DATE,
  is_active     BOOLEAN DEFAULT true,
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- BRANCHES
CREATE TABLE branches (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id),
  name          VARCHAR(255) NOT NULL,
  code          VARCHAR(50),
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  pincode       VARCHAR(10),
  lat           DECIMAL(10,8),
  lng           DECIMAL(11,8),
  phone         VARCHAR(20),
  email         VARCHAR(255),
  capacity      INT DEFAULT 0,
  open_time     TIME,
  close_time    TIME,
  working_days  VARCHAR(20) DEFAULT 'MON-SAT',
  status        VARCHAR(20) DEFAULT 'ACTIVE',  -- ACTIVE, INACTIVE, CLOSED
  settings      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- USERS (Members)
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id),
  branch_id         UUID NOT NULL REFERENCES branches(id),
  name              VARCHAR(255) NOT NULL,
  email             VARCHAR(255),
  phone             VARCHAR(20) NOT NULL,
  alt_phone         VARCHAR(20),
  gender            VARCHAR(10),
  dob               DATE,
  profile_photo_url TEXT,
  address           TEXT,
  emergency_contact_name  VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  health_conditions TEXT,
  blood_group       VARCHAR(5),
  height_cm         DECIMAL(5,2),
  weight_kg         DECIMAL(5,2),
  goal              VARCHAR(100),
  assigned_trainer_id UUID,
  plan_id           UUID,
  plan_start_date   DATE,
  plan_end_date     DATE,
  membership_status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, EXPIRED, PAUSED, CANCELLED
  join_date         DATE DEFAULT CURRENT_DATE,
  last_checkin      TIMESTAMPTZ,
  source            VARCHAR(50),  -- WALK_IN, REFERRAL, ONLINE, CAMPAIGN
  referred_by       UUID,
  notes             TEXT,
  status            VARCHAR(20) DEFAULT 'ACTIVE',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

-- STAFF
CREATE TABLE staff (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id),
  branch_id         UUID NOT NULL REFERENCES branches(id),
  role              VARCHAR(50) NOT NULL,  -- BRANCH_ADMIN, TRAINER, RECEPTIONIST, MANAGER
  name              VARCHAR(255) NOT NULL,
  email             VARCHAR(255) UNIQUE NOT NULL,
  phone             VARCHAR(20),
  profile_photo_url TEXT,
  gender            VARCHAR(10),
  dob               DATE,
  address           TEXT,
  joining_date      DATE,
  salary_type       VARCHAR(20) DEFAULT 'FIXED',  -- FIXED, COMMISSION, HYBRID
  base_salary       DECIMAL(10,2),
  commission_rate   DECIMAL(5,2),
  certifications    JSONB DEFAULT '[]',
  specializations   JSONB DEFAULT '[]',
  max_members       INT DEFAULT 30,
  status            VARCHAR(20) DEFAULT 'ACTIVE',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

-- STAFF_AUTH (login credentials, separate from profile)
CREATE TABLE staff_auth (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id      UUID NOT NULL REFERENCES staff(id),
  password_hash VARCHAR(255) NOT NULL,
  last_login    TIMESTAMPTZ,
  failed_attempts INT DEFAULT 0,
  locked_until  TIMESTAMPTZ,
  reset_token   VARCHAR(255),
  reset_token_expiry TIMESTAMPTZ
);

-- PLANS
CREATE TABLE plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id),
  branch_id     UUID,  -- NULL = org-wide template
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  duration_days INT NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  currency      VARCHAR(5) DEFAULT 'INR',
  plan_type     VARCHAR(50) DEFAULT 'STANDARD', -- STANDARD, PRIME_PT, PREMIUM, BASIC
  features      JSONB DEFAULT '{}',  -- {gym_access, classes, pt_sessions, diet_access}
  max_members   INT,
  is_active     BOOLEAN DEFAULT true,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- PAYMENTS
CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL,
  branch_id         UUID NOT NULL,
  user_id           UUID REFERENCES users(id),
  staff_id          UUID REFERENCES staff(id),
  payment_type      VARCHAR(50) NOT NULL,  -- MEMBERSHIP, PT_PACKAGE, SALARY, UTILITY, EQUIPMENT
  amount            DECIMAL(10,2) NOT NULL,
  currency          VARCHAR(5) DEFAULT 'INR',
  payment_mode      VARCHAR(50),  -- CASH, UPI, CARD, BANK_TRANSFER, GATEWAY
  gateway_txn_id    VARCHAR(255),
  reference_no      VARCHAR(255),
  payment_date      DATE NOT NULL,
  period_start      DATE,
  period_end        DATE,
  status            VARCHAR(20) DEFAULT 'COMPLETED',  -- COMPLETED, PENDING, FAILED, REFUNDED
  notes             TEXT,
  invoice_url       TEXT,
  created_by        UUID,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- INVENTORY
CREATE TABLE inventory_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  branch_id       UUID NOT NULL,
  name            VARCHAR(255) NOT NULL,
  category        VARCHAR(100),  -- CARDIO, STRENGTH, STUDIO, FACILITY, CONSUMABLE
  brand           VARCHAR(100),
  model_no        VARCHAR(100),
  serial_no       VARCHAR(100),
  purchase_date   DATE,
  purchase_price  DECIMAL(10,2),
  warranty_expiry DATE,
  quantity        INT DEFAULT 1,
  unit            VARCHAR(20),
  status          VARCHAR(30) DEFAULT 'WORKING',  -- WORKING, MAINTENANCE, BROKEN, DISPOSED
  location        VARCHAR(100),
  last_service    DATE,
  next_service    DATE,
  qr_code         VARCHAR(255),
  photo_url       TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

-- ACTIVITIES (Class definitions)
CREATE TABLE activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL,
  branch_id     UUID NOT NULL,
  name          VARCHAR(255) NOT NULL,
  type          VARCHAR(100),  -- ZUMBA, YOGA, HIIT, FAT_LOSS, SPINNING, KICKBOXING
  description   TEXT,
  duration_mins INT,
  max_capacity  INT,
  instructor_id UUID REFERENCES staff(id),
  visibility    VARCHAR(50) DEFAULT 'ALL',  -- ALL, PREMIUM, PRIME_PT, STAFF_ONLY
  color_hex     VARCHAR(7),
  photo_url     TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY_SCHEDULES
CREATE TABLE activity_schedules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id   UUID NOT NULL REFERENCES activities(id),
  org_id        UUID NOT NULL,
  branch_id     UUID NOT NULL,
  scheduled_at  TIMESTAMPTZ NOT NULL,
  duration_mins INT,
  location      VARCHAR(100),
  current_count INT DEFAULT 0,
  status        VARCHAR(20) DEFAULT 'SCHEDULED', -- SCHEDULED, ONGOING, COMPLETED, CANCELLED
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- WORKOUT_PLANS
CREATE TABLE workout_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL,
  branch_id     UUID,
  created_by    UUID REFERENCES staff(id),
  assigned_to   UUID REFERENCES users(id),  -- NULL = template
  name          VARCHAR(255) NOT NULL,
  split_type    VARCHAR(100),  -- PPL, UPPER_LOWER, FULL_BODY, SPORT_SPECIFIC, CUSTOM
  goal          VARCHAR(100),  -- FAT_LOSS, MUSCLE_GAIN, ENDURANCE, MAINTENANCE
  level         VARCHAR(30),   -- BEGINNER, INTERMEDIATE, ADVANCED
  duration_weeks INT,
  is_template   BOOLEAN DEFAULT false,
  is_active     BOOLEAN DEFAULT true,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- WORKOUT_DAYS
CREATE TABLE workout_days (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id         UUID NOT NULL REFERENCES workout_plans(id),
  day_number      INT NOT NULL,
  day_label       VARCHAR(50),  -- "Day 1", "Push Day", "Monday"
  muscle_groups   JSONB DEFAULT '[]',
  notes           TEXT
);

-- EXERCISES
CREATE TABLE exercises (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID,
  name          VARCHAR(255) NOT NULL,
  muscle_group  VARCHAR(100),
  equipment     VARCHAR(100),
  description   TEXT,
  video_url     TEXT,
  photo_url     TEXT,
  is_global     BOOLEAN DEFAULT false,  -- true = available to all orgs
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- WORKOUT_DAY_EXERCISES
CREATE TABLE workout_day_exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id          UUID NOT NULL REFERENCES workout_days(id),
  exercise_id     UUID NOT NULL REFERENCES exercises(id),
  sets            INT,
  reps            VARCHAR(50),  -- "12" or "8-12" or "AMRAP"
  duration_secs   INT,
  rest_secs       INT,
  weight_kg       DECIMAL(5,2),
  notes           TEXT,
  sort_order      INT DEFAULT 0
);

-- DIET_PLANS
CREATE TABLE diet_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL,
  branch_id     UUID,
  created_by    UUID REFERENCES staff(id),
  assigned_to   UUID REFERENCES users(id),
  name          VARCHAR(255) NOT NULL,
  goal          VARCHAR(100),
  total_calories INT,
  total_protein  DECIMAL(5,2),
  total_carbs    DECIMAL(5,2),
  total_fat      DECIMAL(5,2),
  is_template    BOOLEAN DEFAULT false,
  is_active      BOOLEAN DEFAULT true,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- DIET_MEALS
CREATE TABLE diet_meals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id     UUID NOT NULL REFERENCES diet_plans(id),
  meal_type   VARCHAR(50),  -- BREAKFAST, LUNCH, DINNER, SNACK, PRE_WORKOUT, POST_WORKOUT
  time_label  VARCHAR(20),
  notes       TEXT,
  sort_order  INT DEFAULT 0
);

-- FOOD_ITEMS
CREATE TABLE food_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID,
  name            VARCHAR(255) NOT NULL,
  calories_per_100g DECIMAL(7,2),
  protein_per_100g  DECIMAL(5,2),
  carbs_per_100g    DECIMAL(5,2),
  fat_per_100g      DECIMAL(5,2),
  fiber_per_100g    DECIMAL(5,2),
  unit            VARCHAR(20) DEFAULT 'g',
  is_global       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- DIET_MEAL_FOODS
CREATE TABLE diet_meal_foods (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id     UUID NOT NULL REFERENCES diet_meals(id),
  food_id     UUID NOT NULL REFERENCES food_items(id),
  quantity_g  DECIMAL(7,2),
  notes       TEXT
);

-- ATTENDANCE
CREATE TABLE attendance (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL,
  branch_id     UUID NOT NULL,
  entity_type   VARCHAR(20) NOT NULL,  -- USER, STAFF
  entity_id     UUID NOT NULL,
  check_in      TIMESTAMPTZ NOT NULL,
  check_out     TIMESTAMPTZ,
  method        VARCHAR(30) DEFAULT 'QR',  -- QR, MANUAL, BIOMETRIC
  marked_by     UUID,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATION_TEMPLATES
CREATE TABLE notification_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL,
  name          VARCHAR(255) NOT NULL,
  channel       VARCHAR(20) NOT NULL,  -- WHATSAPP, EMAIL, BOTH
  category      VARCHAR(50),  -- PAYMENT, EXPIRY, PROMOTIONAL, CLASS, GENERAL
  subject       VARCHAR(255),
  body          TEXT NOT NULL,
  variables     JSONB DEFAULT '[]',  -- [{name, description}]
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATION_LOGS
CREATE TABLE notification_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  branch_id       UUID,
  template_id     UUID,
  channel         VARCHAR(20),
  recipient_type  VARCHAR(30),  -- USER, STAFF, ALL_BRANCH, SELECTED
  recipient_id    UUID,
  recipient_phone VARCHAR(20),
  recipient_email VARCHAR(255),
  subject         TEXT,
  body            TEXT,
  status          VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SENT, DELIVERED, READ, FAILED
  sent_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CHAT_MESSAGES
CREATE TABLE chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL,
  branch_id   UUID NOT NULL,
  sender_type VARCHAR(20),  -- USER, STAFF
  sender_id   UUID NOT NULL,
  receiver_type VARCHAR(20),
  receiver_id UUID NOT NULL,
  message     TEXT NOT NULL,
  media_url   TEXT,
  media_type  VARCHAR(20),
  is_read     BOOLEAN DEFAULT false,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ROLES (RBAC)
CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  is_system   BOOLEAN DEFAULT false,  -- cannot be deleted
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- PERMISSIONS
CREATE TABLE permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module      VARCHAR(100) NOT NULL,  -- BRANCHES, USERS, STAFF, ACCOUNTS, etc.
  action      VARCHAR(50) NOT NULL,   -- VIEW, CREATE, EDIT, DELETE, EXPORT, NOTIFY
  description TEXT
);

-- ROLE_PERMISSIONS
CREATE TABLE role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- STAFF_ROLES
CREATE TABLE staff_roles (
  staff_id    UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, role_id)
);

-- AUDIT_LOGS
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL,
  branch_id   UUID,
  actor_type  VARCHAR(20),  -- STAFF, USER, SYSTEM
  actor_id    UUID,
  action      VARCHAR(100) NOT NULL,
  module      VARCHAR(100),
  entity_type VARCHAR(100),
  entity_id   UUID,
  old_value   JSONB,
  new_value   JSONB,
  ip_address  VARCHAR(45),
  user_agent  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_users_org_branch ON users(org_id, branch_id);
CREATE INDEX idx_users_membership_status ON users(membership_status);
CREATE INDEX idx_users_plan_end ON users(plan_end_date);
CREATE INDEX idx_staff_org_branch ON staff(org_id, branch_id);
CREATE INDEX idx_payments_org_branch ON payments(org_id, branch_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_attendance_entity ON attendance(entity_type, entity_id);
CREATE INDEX idx_attendance_date ON attendance(check_in);
CREATE INDEX idx_notif_logs_status ON notification_logs(status, created_at);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

---

## 4. Auth & Security Layer

### JWT Token Structure

```json
{
  "sub": "staff-uuid",
  "orgId": "org-uuid",
  "branchId": "branch-uuid",
  "role": "BRANCH_ADMIN",
  "permissions": ["USERS:VIEW", "USERS:CREATE", "ACCOUNTS:VIEW"],
  "iat": 1700000000,
  "exp": 1700086400
}
```

### Auth APIs

| Method | Endpoint                       | Description                            |
| ------ | ------------------------------ | -------------------------------------- |
| POST   | `/api/v1/auth/login`           | Login → returns access + refresh token |
| POST   | `/api/v1/auth/refresh`         | Refresh access token                   |
| POST   | `/api/v1/auth/logout`          | Invalidate refresh token (Redis)       |
| POST   | `/api/v1/auth/forgot-password` | Send reset OTP to email/phone          |
| POST   | `/api/v1/auth/reset-password`  | Reset with OTP + new password          |
| GET    | `/api/v1/auth/me`              | Get current user profile               |
| PUT    | `/api/v1/auth/change-password` | Change own password                    |

### Login Request/Response

```json
// POST /api/v1/auth/login
// Request
{
  "email": "admin@gymname.com",
  "password": "securePass123",
  "branchCode": "BRN001"  // optional, branch-scoped login
}

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "uuid-v4",
    "expiresIn": 86400,
    "staff": {
      "id": "uuid",
      "name": "Rahul Admin",
      "role": "BRANCH_ADMIN",
      "orgId": "uuid",
      "branchId": "uuid",
      "branchName": "Andheri West",
      "profilePhoto": "https://..."
    }
  }
}
```

### Security Fixes Checklist

- [ ] Rate limit `/auth/login` → max 5 attempts per IP per 10 minutes via Redis
- [ ] Lock account after 10 consecutive failures
- [ ] Refresh tokens stored in Redis with TTL = 30 days
- [ ] Revoke ALL refresh tokens on password change
- [ ] Validate `branchId` in JWT against DB on every request (prevent stale token attacks)
- [ ] CORS configured to allowed frontend origins only
- [ ] Passwords hashed with BCrypt strength 12
- [ ] Audit log every login attempt (success + failure)

---

## 5. API Standards & Common Patterns

### Standard Response Envelope

```json
// Success
{
  "success": true,
  "message": "Branch created successfully",
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "uuid"
  }
}

// Paginated list
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "size": 20,
    "totalElements": 340,
    "totalPages": 17,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "search": "john",
    "status": "ACTIVE",
    "dateFrom": "2024-01-01",
    "dateTo": "2024-01-31"
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with ID xyz not found",
    "field": null,
    "details": null
  },
  "meta": { "timestamp": "...", "requestId": "..." }
}
```

### Universal Query Parameters (all list endpoints)

| Param      | Type   | Description                                         |
| ---------- | ------ | --------------------------------------------------- |
| `page`     | int    | Page number (0-indexed, default 0)                  |
| `size`     | int    | Items per page (default 20, max 100)                |
| `sort`     | string | Field name (e.g. `createdAt`)                       |
| `dir`      | string | `asc` or `desc` (default `desc`)                    |
| `search`   | string | Full-text search across name, email, phone          |
| `status`   | string | Filter by status                                    |
| `dateFrom` | date   | Filter by created/event date range start (ISO 8601) |
| `dateTo`   | date   | Filter by created/event date range end              |
| `branchId` | uuid   | Filter by branch (OrgAdmin only)                    |
| `q`        | string | Alias for search                                    |

### Java: Pageable + Specification pattern

```java
// Generic Specification builder (fixes N+1 and dynamic filter bugs)
public class UserSpecification {
    public static Specification<User> withFilters(UserFilterDTO filters) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Tenant scope — ALWAYS first
            predicates.add(cb.equal(root.get("orgId"), filters.getOrgId()));

            if (filters.getBranchId() != null)
                predicates.add(cb.equal(root.get("branchId"), filters.getBranchId()));

            if (StringUtils.hasText(filters.getSearch())) {
                String like = "%" + filters.getSearch().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("email")), like),
                    cb.like(root.get("phone"), like)
                ));
            }

            if (filters.getStatus() != null)
                predicates.add(cb.equal(root.get("status"), filters.getStatus()));

            if (filters.getDateFrom() != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"),
                    filters.getDateFrom().atStartOfDay(ZoneId.systemDefault()).toInstant()));

            if (filters.getDateTo() != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"),
                    filters.getDateTo().plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant()));

            // Soft delete filter
            predicates.add(cb.isNull(root.get("deletedAt")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
```

### Soft Delete Pattern (Java)

```java
// BaseEntity.java
@MappedSuperclass
public abstract class BaseEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public boolean isDeleted() { return deletedAt != null; }

    public void softDelete() {
        this.deletedAt = Instant.now();
    }
}

// Repository
public interface UserRepository extends JpaRepository<User, UUID>,
    JpaSpecificationExecutor<User> {

    @Query("SELECT u FROM User u WHERE u.id = :id AND u.orgId = :orgId AND u.deletedAt IS NULL")
    Optional<User> findActiveById(UUID id, UUID orgId);
}
```

---

## 6. Module 1 — Organization & Super Admin

### APIs

| Method | Endpoint                  | Auth                   | Description            |
| ------ | ------------------------- | ---------------------- | ---------------------- |
| GET    | `/api/v1/orgs`            | SUPER_ADMIN            | List all organizations |
| POST   | `/api/v1/orgs`            | SUPER_ADMIN            | Create organization    |
| GET    | `/api/v1/orgs/{id}`       | SUPER_ADMIN, ORG_OWNER | Get org detail         |
| PUT    | `/api/v1/orgs/{id}`       | ORG_OWNER              | Update org profile     |
| DELETE | `/api/v1/orgs/{id}`       | SUPER_ADMIN            | Soft delete org        |
| PUT    | `/api/v1/orgs/{id}/logo`  | ORG_OWNER              | Upload/replace logo    |
| GET    | `/api/v1/orgs/{id}/stats` | ORG_OWNER              | Org-wide stats         |

### Query Params for GET /api/v1/orgs

`?search=&status=ACTIVE&subscriptionTier=PRO&dateFrom=&dateTo=&page=0&size=20&sort=createdAt&dir=desc`

### Create Org Request

```json
{
  "name": "FitLife Gyms",
  "slug": "fitlife",
  "phone": "9999999999",
  "email": "owner@fitlife.com",
  "address": "MG Road, Pune",
  "gstin": "27XXXXX",
  "ownerName": "Suresh Sharma",
  "ownerEmail": "suresh@fitlife.com",
  "ownerPassword": "tempPass@123",
  "subscriptionTier": "PRO"
}
```

---

## 7. Module 2 — Branch Management

### APIs

| Method | Endpoint                             | Auth                    | Description            |
| ------ | ------------------------------------ | ----------------------- | ---------------------- |
| GET    | `/api/v1/branches`                   | ORG_OWNER, SUPER_ADMIN  | List branches          |
| POST   | `/api/v1/branches`                   | ORG_OWNER               | Create branch          |
| GET    | `/api/v1/branches/{id}`              | ORG_OWNER, BRANCH_ADMIN | Get branch detail      |
| PUT    | `/api/v1/branches/{id}`              | ORG_OWNER, BRANCH_ADMIN | Update branch          |
| DELETE | `/api/v1/branches/{id}`              | ORG_OWNER               | Soft delete branch     |
| PUT    | `/api/v1/branches/{id}/status`       | ORG_OWNER               | Activate/Deactivate    |
| GET    | `/api/v1/branches/{id}/summary`      | ORG_OWNER, BRANCH_ADMIN | Branch dashboard stats |
| POST   | `/api/v1/branches/{id}/assign-admin` | ORG_OWNER               | Assign branch admin    |

### Query Params for GET /api/v1/branches

`?search=&status=ACTIVE&city=&state=&dateFrom=&dateTo=&page=0&size=20&sort=name&dir=asc`

### Branch Summary Response

```json
{
  "branchId": "uuid",
  "branchName": "Andheri West",
  "totalMembers": 145,
  "activeMembers": 132,
  "expiringSoon": 12,
  "totalTrainers": 6,
  "activeTrainers": 5,
  "todayCheckins": 38,
  "monthRevenue": 285000,
  "pendingPayments": 42000,
  "equipmentAlerts": 2,
  "upcomingClasses": 3
}
```

### Create Branch Request

```json
{
  "name": "FitLife Andheri West",
  "code": "FLA001",
  "address": "123 Linking Road",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400058",
  "lat": 19.1136,
  "lng": 72.8697,
  "phone": "9888888888",
  "email": "andheri@fitlife.com",
  "capacity": 200,
  "openTime": "05:30",
  "closeTime": "23:00",
  "workingDays": "MON-SUN"
}
```

---

## 8. Module 3 — Users (Members)

### APIs

| Method | Endpoint                            | Auth                               | Description                   |
| ------ | ----------------------------------- | ---------------------------------- | ----------------------------- |
| GET    | `/api/v1/users`                     | ORG_OWNER, BRANCH_ADMIN, TRAINER\* | List members                  |
| POST   | `/api/v1/users`                     | BRANCH_ADMIN                       | Create member                 |
| GET    | `/api/v1/users/{id}`                | BRANCH_ADMIN, TRAINER\*            | Get member detail             |
| PUT    | `/api/v1/users/{id}`                | BRANCH_ADMIN                       | Update member                 |
| DELETE | `/api/v1/users/{id}`                | BRANCH_ADMIN                       | Soft delete (archive)         |
| PUT    | `/api/v1/users/{id}/photo`          | BRANCH_ADMIN                       | Upload profile photo          |
| PUT    | `/api/v1/users/{id}/assign-trainer` | BRANCH_ADMIN                       | Assign/change trainer         |
| PUT    | `/api/v1/users/{id}/assign-plan`    | BRANCH_ADMIN                       | Assign membership plan        |
| PUT    | `/api/v1/users/{id}/pause`          | BRANCH_ADMIN                       | Pause membership              |
| PUT    | `/api/v1/users/{id}/renew`          | BRANCH_ADMIN                       | Renew membership              |
| GET    | `/api/v1/users/{id}/metrics`        | BRANCH_ADMIN, TRAINER              | Body metrics history          |
| POST   | `/api/v1/users/{id}/metrics`        | BRANCH_ADMIN, TRAINER              | Log body metrics              |
| GET    | `/api/v1/users/{id}/timeline`       | BRANCH_ADMIN, TRAINER              | Full member activity timeline |
| GET    | `/api/v1/users/expiring`            | BRANCH_ADMIN                       | Members expiring in N days    |
| GET    | `/api/v1/users/export`              | ORG_OWNER, BRANCH_ADMIN            | Export CSV                    |

> \*Trainers see only their assigned members

### Rich Query Params for GET /api/v1/users

```
?search=rahul
&status=ACTIVE                 // ACTIVE, EXPIRED, PAUSED, CANCELLED
&membershipStatus=ACTIVE
&planId=uuid
&trainerId=uuid
&branchId=uuid
&gender=MALE
&goal=FAT_LOSS
&joinDateFrom=2024-01-01
&joinDateTo=2024-12-31
&planExpiryFrom=2024-01-01
&planExpiryTo=2024-01-31
&source=REFERRAL
&page=0&size=20&sort=name&dir=asc
```

### Create Member Request

```json
{
  "name": "Priya Sharma",
  "email": "priya@email.com",
  "phone": "9111111111",
  "gender": "FEMALE",
  "dob": "1995-06-15",
  "address": "Flat 4B, Rose Apartments, Andheri",
  "emergencyContactName": "Amit Sharma",
  "emergencyContactPhone": "9222222222",
  "healthConditions": "None",
  "bloodGroup": "B+",
  "heightCm": 163.5,
  "weightKg": 68.0,
  "goal": "FAT_LOSS",
  "trainerId": "uuid",
  "planId": "uuid",
  "planStartDate": "2024-01-15",
  "source": "WALK_IN",
  "notes": "Referred by Rahul"
}
```

### Member Timeline Response

```json
{
  "userId": "uuid",
  "timeline": [
    {
      "date": "2024-01-15",
      "type": "JOINED",
      "description": "Joined with Premium Plan"
    },
    {
      "date": "2024-01-16",
      "type": "CHECKIN",
      "description": "Check-in 7:32 AM, Check-out 9:15 AM"
    },
    {
      "date": "2024-01-17",
      "type": "WORKOUT_LOGGED",
      "description": "Push Day — 8 exercises logged"
    },
    {
      "date": "2024-01-20",
      "type": "PAYMENT",
      "description": "₹4500 received — UPI"
    },
    {
      "date": "2024-02-01",
      "type": "METRIC_LOG",
      "description": "Weight: 67.2 kg (-0.8 kg), Body Fat: 28.1%"
    }
  ]
}
```

---

## 9. Module 4 — Staff Management

### APIs

| Method | Endpoint                            | Auth                    | Description                   |
| ------ | ----------------------------------- | ----------------------- | ----------------------------- |
| GET    | `/api/v1/staff`                     | ORG_OWNER, BRANCH_ADMIN | List staff                    |
| POST   | `/api/v1/staff`                     | ORG_OWNER, BRANCH_ADMIN | Create staff                  |
| GET    | `/api/v1/staff/{id}`                | ORG_OWNER, BRANCH_ADMIN | Get staff detail              |
| PUT    | `/api/v1/staff/{id}`                | ORG_OWNER, BRANCH_ADMIN | Update staff                  |
| DELETE | `/api/v1/staff/{id}`                | ORG_OWNER               | Terminate (soft delete)       |
| PUT    | `/api/v1/staff/{id}/photo`          | BRANCH_ADMIN            | Upload photo                  |
| PUT    | `/api/v1/staff/{id}/transfer`       | ORG_OWNER               | Transfer to another branch    |
| GET    | `/api/v1/staff/{id}/members`        | BRANCH_ADMIN            | Trainer's assigned members    |
| GET    | `/api/v1/staff/{id}/salary-history` | ORG_OWNER, BRANCH_ADMIN | Salary payment records        |
| POST   | `/api/v1/staff/{id}/salary-pay`     | BRANCH_ADMIN            | Process salary payment        |
| GET    | `/api/v1/staff/trainers`            | BRANCH_ADMIN            | List trainers only (shortcut) |
| GET    | `/api/v1/staff/export`              | ORG_OWNER, BRANCH_ADMIN | Export CSV                    |

### Query Params for GET /api/v1/staff

```
?search=
&role=TRAINER                  // TRAINER, BRANCH_ADMIN, RECEPTIONIST, MANAGER
&branchId=uuid
&status=ACTIVE
&joinDateFrom=
&joinDateTo=
&specialization=WEIGHT_LOSS
&page=0&size=20&sort=name&dir=asc
```

---

## 10. Module 5 — Plans & Subscriptions

### APIs

| Method | Endpoint                         | Auth                    | Description                     |
| ------ | -------------------------------- | ----------------------- | ------------------------------- |
| GET    | `/api/v1/plans`                  | ORG_OWNER, BRANCH_ADMIN | List plans                      |
| POST   | `/api/v1/plans`                  | ORG_OWNER               | Create plan template            |
| GET    | `/api/v1/plans/{id}`             | ORG_OWNER, BRANCH_ADMIN | Get plan detail                 |
| PUT    | `/api/v1/plans/{id}`             | ORG_OWNER               | Update plan                     |
| DELETE | `/api/v1/plans/{id}`             | ORG_OWNER               | Soft delete plan                |
| PUT    | `/api/v1/plans/{id}/activate`    | ORG_OWNER               | Activate/deactivate             |
| GET    | `/api/v1/plans/{id}/subscribers` | ORG_OWNER, BRANCH_ADMIN | Members on this plan            |
| GET    | `/api/v1/plans/stats`            | ORG_OWNER               | Plan revenue + subscriber stats |

### Create Plan Request

```json
{
  "name": "Prime PT - 3 Months",
  "description": "Personal training with dedicated trainer",
  "durationDays": 90,
  "price": 12000,
  "planType": "PRIME_PT",
  "branchId": null,
  "features": {
    "gymAccess": true,
    "classAccess": true,
    "ptSessions": 24,
    "dietPlanAccess": true,
    "appAccess": true,
    "guestPasses": 2
  },
  "maxMembers": 50,
  "sortOrder": 1
}
```

---

## 11. Module 6 — Accounts & Finance

### APIs

| Method | Endpoint                                 | Auth                    | Description                 |
| ------ | ---------------------------------------- | ----------------------- | --------------------------- |
| GET    | `/api/v1/accounts/summary`               | ORG_OWNER, BRANCH_ADMIN | Financial summary           |
| GET    | `/api/v1/accounts/payments`              | ORG_OWNER, BRANCH_ADMIN | All payment records         |
| POST   | `/api/v1/accounts/payments`              | BRANCH_ADMIN            | Record payment              |
| GET    | `/api/v1/accounts/payments/{id}`         | BRANCH_ADMIN            | Payment detail              |
| PUT    | `/api/v1/accounts/payments/{id}`         | BRANCH_ADMIN            | Update payment              |
| DELETE | `/api/v1/accounts/payments/{id}`         | ORG_OWNER               | Void payment                |
| GET    | `/api/v1/accounts/income`                | ORG_OWNER, BRANCH_ADMIN | Income ledger               |
| GET    | `/api/v1/accounts/expenses`              | ORG_OWNER, BRANCH_ADMIN | Expense ledger              |
| POST   | `/api/v1/accounts/expenses`              | BRANCH_ADMIN            | Record expense              |
| GET    | `/api/v1/accounts/salary`                | ORG_OWNER, BRANCH_ADMIN | Salary records              |
| GET    | `/api/v1/accounts/pl-report`             | ORG_OWNER, BRANCH_ADMIN | P&L report                  |
| GET    | `/api/v1/accounts/cashflow`              | ORG_OWNER               | Cash flow report            |
| GET    | `/api/v1/accounts/pending`               | BRANCH_ADMIN            | Pending/overdue payments    |
| GET    | `/api/v1/accounts/export`                | ORG_OWNER               | Export all transactions CSV |
| POST   | `/api/v1/accounts/payments/{id}/invoice` | BRANCH_ADMIN            | Generate invoice PDF        |

### Rich Query Params for GET /api/v1/accounts/payments

```
?paymentType=MEMBERSHIP          // MEMBERSHIP, PT_PACKAGE, SALARY, UTILITY, EQUIPMENT
&status=COMPLETED                // COMPLETED, PENDING, FAILED, REFUNDED
&paymentMode=UPI
&userId=uuid
&staffId=uuid
&branchId=uuid
&dateFrom=2024-01-01
&dateTo=2024-01-31
&minAmount=1000
&maxAmount=50000
&page=0&size=20&sort=paymentDate&dir=desc
```

### Accounts Summary Response

```json
{
  "period": { "from": "2024-01-01", "to": "2024-01-31" },
  "income": {
    "total": 850000,
    "memberships": 680000,
    "ptPackages": 145000,
    "other": 25000
  },
  "expenses": {
    "total": 285000,
    "salaries": 180000,
    "electricity": 35000,
    "maintenance": 25000,
    "consumables": 15000,
    "other": 30000
  },
  "netProfit": 565000,
  "profitMargin": 66.47,
  "pendingCollections": 78000,
  "overdueCount": 12,
  "byBranch": [
    { "branchName": "Andheri West", "income": 450000, "expenses": 155000 },
    { "branchName": "Bandra", "income": 400000, "expenses": 130000 }
  ]
}
```

---

## 12. Module 7 — Inventory

### APIs

| Method | Endpoint                             | Auth                    | Description                       |
| ------ | ------------------------------------ | ----------------------- | --------------------------------- |
| GET    | `/api/v1/inventory`                  | ORG_OWNER, BRANCH_ADMIN | List equipment                    |
| POST   | `/api/v1/inventory`                  | BRANCH_ADMIN            | Add equipment                     |
| GET    | `/api/v1/inventory/{id}`             | BRANCH_ADMIN            | Equipment detail                  |
| PUT    | `/api/v1/inventory/{id}`             | BRANCH_ADMIN            | Update equipment                  |
| DELETE | `/api/v1/inventory/{id}`             | ORG_OWNER, BRANCH_ADMIN | Soft delete                       |
| PUT    | `/api/v1/inventory/{id}/status`      | BRANCH_ADMIN            | Update status                     |
| POST   | `/api/v1/inventory/{id}/service-log` | BRANCH_ADMIN            | Log maintenance                   |
| GET    | `/api/v1/inventory/{id}/service-log` | BRANCH_ADMIN            | Get service history               |
| GET    | `/api/v1/inventory/{id}/qr`          | BRANCH_ADMIN            | Get/generate QR code              |
| GET    | `/api/v1/inventory/alerts`           | BRANCH_ADMIN            | Warranty expiry + maintenance due |
| GET    | `/api/v1/inventory/export`           | ORG_OWNER, BRANCH_ADMIN | Export CSV                        |

### Query Params for GET /api/v1/inventory

```
?search=treadmill
&category=CARDIO                // CARDIO, STRENGTH, STUDIO, FACILITY, CONSUMABLE
&status=WORKING                 // WORKING, MAINTENANCE, BROKEN, DISPOSED
&branchId=uuid
&warrantyExpireBefore=2024-06-30
&serviceDueBefore=2024-03-31
&page=0&size=20&sort=name&dir=asc
```

---

## 13. Module 8 — Activity & Classes

### APIs

| Method | Endpoint                                       | Auth                    | Description                  |
| ------ | ---------------------------------------------- | ----------------------- | ---------------------------- |
| GET    | `/api/v1/activities`                           | All                     | List activity types          |
| POST   | `/api/v1/activities`                           | ORG_OWNER, BRANCH_ADMIN | Create activity type         |
| GET    | `/api/v1/activities/{id}`                      | All                     | Activity detail              |
| PUT    | `/api/v1/activities/{id}`                      | ORG_OWNER, BRANCH_ADMIN | Update                       |
| DELETE | `/api/v1/activities/{id}`                      | ORG_OWNER               | Soft delete                  |
| GET    | `/api/v1/activities/schedules`                 | All                     | List scheduled sessions      |
| POST   | `/api/v1/activities/schedules`                 | BRANCH_ADMIN            | Schedule a session           |
| GET    | `/api/v1/activities/schedules/{id}`            | All                     | Session detail               |
| PUT    | `/api/v1/activities/schedules/{id}`            | BRANCH_ADMIN            | Update session               |
| DELETE | `/api/v1/activities/schedules/{id}`            | BRANCH_ADMIN            | Cancel session               |
| POST   | `/api/v1/activities/schedules/{id}/book`       | MEMBER                  | Book a spot                  |
| DELETE | `/api/v1/activities/schedules/{id}/book`       | MEMBER                  | Cancel booking               |
| POST   | `/api/v1/activities/schedules/{id}/attendance` | TRAINER, BRANCH_ADMIN   | Mark attendance              |
| GET    | `/api/v1/activities/schedules/{id}/bookings`   | BRANCH_ADMIN, TRAINER   | Get booking list             |
| GET    | `/api/v1/activities/calendar`                  | All                     | Weekly/monthly calendar view |

### Query Params for GET /api/v1/activities/schedules

```
?activityId=uuid
&instructorId=uuid
&branchId=uuid
&dateFrom=2024-01-15
&dateTo=2024-01-21
&status=SCHEDULED              // SCHEDULED, ONGOING, COMPLETED, CANCELLED
&visibility=ALL
&page=0&size=20
```

---

## 14. Module 9 — Workout Plans

### APIs

| Method | Endpoint                                              | Auth                  | Description                       |
| ------ | ----------------------------------------------------- | --------------------- | --------------------------------- |
| GET    | `/api/v1/workouts`                                    | TRAINER, BRANCH_ADMIN | List workout plans                |
| POST   | `/api/v1/workouts`                                    | TRAINER, BRANCH_ADMIN | Create plan                       |
| GET    | `/api/v1/workouts/{id}`                               | TRAINER, MEMBER\*     | Plan detail with days + exercises |
| PUT    | `/api/v1/workouts/{id}`                               | TRAINER               | Update plan                       |
| DELETE | `/api/v1/workouts/{id}`                               | TRAINER, BRANCH_ADMIN | Soft delete                       |
| POST   | `/api/v1/workouts/{id}/assign`                        | TRAINER, BRANCH_ADMIN | Assign to member                  |
| POST   | `/api/v1/workouts/{id}/days`                          | TRAINER               | Add workout day                   |
| PUT    | `/api/v1/workouts/{id}/days/{dayId}`                  | TRAINER               | Update day                        |
| DELETE | `/api/v1/workouts/{id}/days/{dayId}`                  | TRAINER               | Delete day                        |
| POST   | `/api/v1/workouts/{id}/days/{dayId}/exercises`        | TRAINER               | Add exercise to day               |
| PUT    | `/api/v1/workouts/{id}/days/{dayId}/exercises/{exId}` | TRAINER               | Update exercise entry             |
| DELETE | `/api/v1/workouts/{id}/days/{dayId}/exercises/{exId}` | TRAINER               | Remove exercise                   |
| POST   | `/api/v1/workouts/{id}/log`                           | MEMBER                | Log workout session               |
| GET    | `/api/v1/workouts/{id}/logs`                          | TRAINER               | Member's workout logs             |
| GET    | `/api/v1/exercises`                                   | TRAINER               | Exercise library                  |
| POST   | `/api/v1/exercises`                                   | TRAINER, BRANCH_ADMIN | Add exercise to library           |

### Query Params for GET /api/v1/workouts

```
?search=
&splitType=PPL                 // PPL, UPPER_LOWER, FULL_BODY, CUSTOM
&goal=FAT_LOSS                 // FAT_LOSS, MUSCLE_GAIN, ENDURANCE, MAINTENANCE
&level=BEGINNER
&isTemplate=true
&assignedTo=uuid               // filter by member
&createdBy=uuid                // filter by trainer
&page=0&size=20
```

---

## 15. Module 10 — Diet Plans

### APIs

| Method | Endpoint                                       | Auth                  | Description                  |
| ------ | ---------------------------------------------- | --------------------- | ---------------------------- |
| GET    | `/api/v1/diet`                                 | TRAINER, BRANCH_ADMIN | List diet plans              |
| POST   | `/api/v1/diet`                                 | TRAINER, BRANCH_ADMIN | Create diet plan             |
| GET    | `/api/v1/diet/{id}`                            | TRAINER, MEMBER\*     | Full plan with meals + foods |
| PUT    | `/api/v1/diet/{id}`                            | TRAINER               | Update plan                  |
| DELETE | `/api/v1/diet/{id}`                            | TRAINER, BRANCH_ADMIN | Soft delete                  |
| POST   | `/api/v1/diet/{id}/assign`                     | TRAINER               | Assign to member             |
| POST   | `/api/v1/diet/{id}/meals`                      | TRAINER               | Add meal                     |
| PUT    | `/api/v1/diet/{id}/meals/{mealId}`             | TRAINER               | Update meal                  |
| DELETE | `/api/v1/diet/{id}/meals/{mealId}`             | TRAINER               | Delete meal                  |
| POST   | `/api/v1/diet/{id}/meals/{mealId}/foods`       | TRAINER               | Add food to meal             |
| PUT    | `/api/v1/diet/{id}/meals/{mealId}/foods/{fId}` | TRAINER               | Update food entry            |
| DELETE | `/api/v1/diet/{id}/meals/{mealId}/foods/{fId}` | TRAINER               | Remove food                  |
| POST   | `/api/v1/diet/{id}/log`                        | MEMBER                | Log daily intake             |
| GET    | `/api/v1/diet/{id}/logs`                       | TRAINER               | Member's diet logs           |
| GET    | `/api/v1/foods`                                | TRAINER               | Food database search         |
| POST   | `/api/v1/foods`                                | TRAINER, BRANCH_ADMIN | Add food item                |
| PUT    | `/api/v1/foods/{id}`                           | TRAINER               | Update food item             |

### Query Params for GET /api/v1/foods

```
?search=chicken
&category=PROTEIN              // PROTEIN, CARBS, FAT, VEGETABLE, FRUIT, DAIRY
&isGlobal=true
&page=0&size=50
```

---

## 16. Module 11 — Attendance

### APIs

| Method | Endpoint                             | Auth                       | Description                  |
| ------ | ------------------------------------ | -------------------------- | ---------------------------- |
| POST   | `/api/v1/attendance/checkin`         | RECEPTIONIST, BRANCH_ADMIN | Member/staff check-in        |
| POST   | `/api/v1/attendance/checkout`        | RECEPTIONIST, BRANCH_ADMIN | Manual check-out             |
| GET    | `/api/v1/attendance`                 | BRANCH_ADMIN, TRAINER      | Attendance records           |
| GET    | `/api/v1/attendance/today`           | BRANCH_ADMIN               | Today's check-ins (live)     |
| GET    | `/api/v1/attendance/user/{userId}`   | BRANCH_ADMIN, TRAINER      | User attendance history      |
| GET    | `/api/v1/attendance/staff/{staffId}` | BRANCH_ADMIN               | Staff attendance             |
| GET    | `/api/v1/attendance/report`          | BRANCH_ADMIN               | Attendance report with stats |
| POST   | `/api/v1/attendance/bulk-checkout`   | BRANCH_ADMIN               | End-of-day bulk checkout     |
| GET    | `/api/v1/attendance/export`          | BRANCH_ADMIN               | Export CSV                   |

### Query Params for GET /api/v1/attendance

```
?entityType=USER               // USER, STAFF
&entityId=uuid
&branchId=uuid
&dateFrom=2024-01-01
&dateTo=2024-01-31
&method=QR                     // QR, MANUAL, BIOMETRIC
&page=0&size=50&sort=checkIn&dir=desc
```

### Check-in Request

```json
{
  "entityType": "USER",
  "entityId": "user-uuid",
  "branchId": "branch-uuid",
  "method": "QR",
  "qrToken": "scanned-qr-data"
}
```

### Check-in Response

```json
{
  "success": true,
  "data": {
    "attendanceId": "uuid",
    "memberName": "Priya Sharma",
    "profilePhoto": "https://...",
    "membershipStatus": "ACTIVE",
    "planName": "Prime PT",
    "planExpiryDate": "2024-03-15",
    "daysRemaining": 58,
    "checkInTime": "07:32:15",
    "trainerName": "Rahul Kumar",
    "todayWorkout": "Push Day",
    "warnings": []
  }
}
```

---

## 17. Module 12 — Notifications (WhatsApp + Email)

### APIs

| Method | Endpoint                               | Auth                    | Description          |
| ------ | -------------------------------------- | ----------------------- | -------------------- |
| GET    | `/api/v1/notifications/templates`      | ORG_OWNER, BRANCH_ADMIN | List templates       |
| POST   | `/api/v1/notifications/templates`      | ORG_OWNER               | Create template      |
| GET    | `/api/v1/notifications/templates/{id}` | ORG_OWNER               | Template detail      |
| PUT    | `/api/v1/notifications/templates/{id}` | ORG_OWNER               | Update template      |
| DELETE | `/api/v1/notifications/templates/{id}` | ORG_OWNER               | Delete template      |
| POST   | `/api/v1/notifications/send`           | ORG_OWNER, BRANCH_ADMIN | Send notification    |
| POST   | `/api/v1/notifications/schedule`       | ORG_OWNER, BRANCH_ADMIN | Schedule future send |
| GET    | `/api/v1/notifications/logs`           | ORG_OWNER, BRANCH_ADMIN | Delivery logs        |
| GET    | `/api/v1/notifications/logs/{id}`      | BRANCH_ADMIN            | Log detail           |
| GET    | `/api/v1/notifications/stats`          | ORG_OWNER               | Delivery stats       |
| POST   | `/api/v1/notifications/test`           | ORG_OWNER               | Test send to self    |

### Send Notification Request

```json
{
  "templateId": "uuid",
  "channel": "WHATSAPP", // WHATSAPP, EMAIL, BOTH
  "audience": {
    "type": "FILTERED", // ALL_BRANCH, FILTERED, SPECIFIC, STAFF_ALL
    "branchId": "uuid",
    "filters": {
      "planType": "PREMIUM",
      "membershipStatus": "ACTIVE",
      "planExpiryBefore": "2024-02-15"
    }
  },
  "variables": {
    "offer_name": "Republic Day Offer",
    "discount": "20%",
    "expiry_date": "26 Jan 2024"
  },
  "scheduledAt": null // null = send immediately
}
```

### Query Params for GET /api/v1/notifications/logs

```
?channel=WHATSAPP
&status=FAILED                 // PENDING, SENT, DELIVERED, READ, FAILED
&templateId=uuid
&branchId=uuid
&dateFrom=
&dateTo=
&page=0&size=20&sort=createdAt&dir=desc
```

---

## 18. Module 13 — Chat (Trainer ↔ Member)

### REST APIs

| Method | Endpoint                          | Auth            | Description                  |
| ------ | --------------------------------- | --------------- | ---------------------------- |
| GET    | `/api/v1/chat/conversations`      | TRAINER, MEMBER | List my conversations        |
| GET    | `/api/v1/chat/conversations/{id}` | TRAINER, MEMBER | Conversation detail          |
| GET    | `/api/v1/chat/messages`           | TRAINER, MEMBER | Messages in a conversation   |
| POST   | `/api/v1/chat/messages`           | TRAINER, MEMBER | Send message (REST fallback) |
| PUT    | `/api/v1/chat/messages/{id}/read` | TRAINER, MEMBER | Mark as read                 |
| GET    | `/api/v1/chat/unread-count`       | TRAINER, MEMBER | Unread message count         |

### WebSocket (STOMP)

```
Connect:   /ws
Subscribe: /user/queue/messages       (personal messages)
Subscribe: /topic/branch/{branchId}   (broadcast events)

Send to:   /app/chat.send
Payload: {
  "receiverId": "uuid",
  "receiverType": "USER",
  "message": "Your workout for today...",
  "mediaUrl": null
}
```

---

## 19. Module 14 — Access Control (RBAC)

### APIs

| Method | Endpoint                                      | Auth                    | Description                     |
| ------ | --------------------------------------------- | ----------------------- | ------------------------------- |
| GET    | `/api/v1/rbac/roles`                          | ORG_OWNER               | List roles                      |
| POST   | `/api/v1/rbac/roles`                          | ORG_OWNER               | Create role                     |
| GET    | `/api/v1/rbac/roles/{id}`                     | ORG_OWNER               | Role detail + permissions       |
| PUT    | `/api/v1/rbac/roles/{id}`                     | ORG_OWNER               | Update role                     |
| DELETE | `/api/v1/rbac/roles/{id}`                     | ORG_OWNER               | Delete role (not system roles)  |
| PUT    | `/api/v1/rbac/roles/{id}/permissions`         | ORG_OWNER               | Set permissions for role        |
| GET    | `/api/v1/rbac/permissions`                    | ORG_OWNER               | List all available permissions  |
| POST   | `/api/v1/rbac/staff/{staffId}/roles`          | ORG_OWNER, BRANCH_ADMIN | Assign role to staff            |
| DELETE | `/api/v1/rbac/staff/{staffId}/roles/{roleId}` | ORG_OWNER               | Remove role from staff          |
| GET    | `/api/v1/rbac/staff/{staffId}/permissions`    | ORG_OWNER               | Effective permissions for staff |

### Permission Matrix (seed data)

```
MODULE          ACTIONS
─────────────── ──────────────────────────────────────────────
DASHBOARD       VIEW
BRANCHES        VIEW, CREATE, EDIT, DELETE, EXPORT
USERS           VIEW, CREATE, EDIT, DELETE, EXPORT
PLANS           VIEW, CREATE, EDIT, DELETE
ACCOUNTS        VIEW, CREATE, EDIT, DELETE, EXPORT
INVENTORY       VIEW, CREATE, EDIT, DELETE, EXPORT
ACTIVITY        VIEW, CREATE, EDIT, DELETE
WORKOUT         VIEW, CREATE, EDIT, DELETE, ASSIGN
DIET            VIEW, CREATE, EDIT, DELETE, ASSIGN
ATTENDANCE      VIEW, CREATE, EDIT, EXPORT
NOTIFICATIONS   VIEW, CREATE, SEND
CHAT            VIEW, SEND
RBAC            VIEW, CREATE, EDIT, DELETE
SETTINGS        VIEW, EDIT
```

---

## 20. Module 15 — Dashboard & Analytics

### APIs

| Method | Endpoint                               | Auth                    | Description                   |
| ------ | -------------------------------------- | ----------------------- | ----------------------------- |
| GET    | `/api/v1/dashboard/overview`           | ORG_OWNER, BRANCH_ADMIN | Main KPIs                     |
| GET    | `/api/v1/dashboard/revenue-chart`      | ORG_OWNER, BRANCH_ADMIN | Revenue trend chart data      |
| GET    | `/api/v1/dashboard/member-growth`      | ORG_OWNER, BRANCH_ADMIN | Member growth chart           |
| GET    | `/api/v1/dashboard/attendance-heatmap` | BRANCH_ADMIN            | Hourly attendance heatmap     |
| GET    | `/api/v1/dashboard/plan-distribution`  | ORG_OWNER, BRANCH_ADMIN | Plan breakdown pie data       |
| GET    | `/api/v1/dashboard/expiring-members`   | BRANCH_ADMIN            | Expiring in 7/15/30 days      |
| GET    | `/api/v1/dashboard/today-schedule`     | BRANCH_ADMIN            | Today's classes + PT sessions |
| GET    | `/api/v1/dashboard/alerts`             | BRANCH_ADMIN            | All system alerts             |
| GET    | `/api/v1/dashboard/trainer-stats`      | TRAINER                 | Trainer's own dashboard       |

### Query Params for dashboard charts

```
?branchId=uuid
&period=MONTHLY               // DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
&dateFrom=2024-01-01
&dateTo=2024-12-31
&compareWith=PREV_PERIOD      // optional comparison
```

### Dashboard Overview Response

```json
{
  "period": "January 2024",
  "members": {
    "total": 1245,
    "active": 1102,
    "new": 87,
    "expired": 65,
    "expiringSoon": 34,
    "growthRate": 7.2
  },
  "revenue": {
    "thisMonth": 1250000,
    "lastMonth": 1180000,
    "growth": 5.9,
    "pending": 145000,
    "collected": 1105000
  },
  "attendance": {
    "todayCheckins": 212,
    "avgPerDay": 198,
    "peakHour": "07:00-08:00"
  },
  "staff": {
    "total": 28,
    "trainers": 18,
    "presentToday": 24
  },
  "inventory": {
    "totalItems": 145,
    "maintenance": 4,
    "warrantyExpiring": 6
  },
  "upcomingClasses": 5,
  "unreadNotifications": 12
}
```

---

## 21. Module 16 — Settings

### APIs

| Method | Endpoint                                 | Auth                    | Description               |
| ------ | ---------------------------------------- | ----------------------- | ------------------------- |
| GET    | `/api/v1/settings/org`                   | ORG_OWNER               | Org settings              |
| PUT    | `/api/v1/settings/org`                   | ORG_OWNER               | Update org settings       |
| GET    | `/api/v1/settings/branch/{id}`           | ORG_OWNER, BRANCH_ADMIN | Branch settings           |
| PUT    | `/api/v1/settings/branch/{id}`           | ORG_OWNER, BRANCH_ADMIN | Update branch settings    |
| GET    | `/api/v1/settings/reminders`             | ORG_OWNER               | Reminder configurations   |
| PUT    | `/api/v1/settings/reminders`             | ORG_OWNER               | Update reminder configs   |
| GET    | `/api/v1/settings/integrations`          | ORG_OWNER               | Integration status        |
| PUT    | `/api/v1/settings/integrations/whatsapp` | ORG_OWNER               | Configure WhatsApp        |
| PUT    | `/api/v1/settings/integrations/email`    | ORG_OWNER               | Configure email SMTP      |
| PUT    | `/api/v1/settings/integrations/payment`  | ORG_OWNER               | Configure payment gateway |
| GET    | `/api/v1/settings/audit-log`             | ORG_OWNER               | Audit trail               |

### Org Settings Structure (JSONB)

```json
{
  "brand": {
    "primaryColor": "#1a73e8",
    "logoUrl": "https://...",
    "appName": "FitLife"
  },
  "payments": {
    "gracePeriodDays": 7,
    "salaryDate": 1,
    "currency": "INR",
    "gstPercent": 18
  },
  "attendance": {
    "checkInMethod": "QR",
    "autoCheckoutHour": 23,
    "lateArrivalMinutes": 15
  },
  "reminders": {
    "memberExpiryDays": [7, 3, 1],
    "paymentDueDays": [3, 1, -3],
    "maintenanceDays": 7,
    "birthdayGreeting": true
  },
  "features": {
    "chatEnabled": true,
    "memberPortalEnabled": true,
    "onlinePaymentEnabled": true
  }
}
```

---

## 22. Frontend Architecture & UI Prompts

### Layout Shell (app/(dashboard)/layout.jsx)

**UI Prompt:**

> Build a responsive dashboard shell with a fixed left sidebar (240px wide, collapses to icon-only on mobile). Sidebar has the gym logo at top, navigation items grouped by section (Overview, Members, Operations, Finance, Communication, System). Each nav item has an icon + label. Active item has a highlighted background with accent color. Bottom of sidebar shows logged-in user avatar + name + role badge + logout button. Main content area has a top bar with: breadcrumb, branch selector dropdown (for OrgAdmin, hidden for BranchAdmin), global search, notification bell with badge count, and user avatar. Content area scrolls independently. Design should feel modern, clean, and professional — dark sidebar with white/light content area. Use Inter font throughout.

### DataTable Component (components/shared/DataTable.jsx)

**UI Prompt:**

> Create a universal data table component that accepts columns config, data array, and filter config as props. Features: sticky header, column sorting with click, responsive horizontal scroll on mobile, row hover highlight, bulk checkbox selection, action menu per row (3-dot icon), empty state with illustration + message, loading skeleton rows (not spinner), pagination control at bottom showing current range + total + page navigation. Filter bar above table with search input, status dropdown, date range picker, and any additional filters passed via config. Export button in top-right. All filters are URL-synced via query params.

### Dashboard Page (app/(dashboard)/dashboard/page.jsx)

**UI Prompt:**

> Dashboard with responsive card grid at top showing 6 KPI cards: Total Members, Revenue This Month, Today's Check-ins, Active Trainers, Expiring Memberships, Equipment Alerts. Each card has icon, value, label, and trend arrow (up/down with % change vs last period). Below: two-column layout — left column has revenue trend line chart (last 12 months), right column has member growth bar chart. Second row: attendance heatmap (7-day hourly grid, darker = more checkins), plan distribution donut chart. Third row: scrollable "Today's Schedule" list (upcoming classes + PT sessions) and "Alerts & Actions" list (expiring members, overdue payments, maintenance due). All data auto-refreshes every 60 seconds. Branch selector at top filters all widgets. Skeleton loading state on initial load.

### Branches Page (app/(dashboard)/branches/page.jsx)

**UI Prompt:**

> Branch listing page with toggle between card view and table view. Card view shows each branch as a card with: branch photo/map thumbnail, name, city, status badge, 4 key metrics (members, trainers, revenue, check-ins today), quick action buttons (View, Edit, Assign Admin). Table view has all sortable columns + filters (status, city, date created). Create Branch button opens a multi-step wizard slide-over panel: Step 1 — Basic info (name, code, contact), Step 2 — Location (address + map pin picker), Step 3 — Operations (hours, capacity, working days), Step 4 — Assign Admin (search existing staff or create new). Filter bar with status filter, city search, date range.

### Members Page (app/(dashboard)/users/page.jsx)

**UI Prompt:**

> Members list with advanced filter bar (search by name/phone/email, status dropdown, plan filter, trainer filter, expiry date range, join date range, branch selector). Table columns: avatar + name, phone, plan badge (color-coded by type), status badge, trainer name, plan expiry with urgency color (red = 7 days, orange = 15 days), last check-in. Clicking row opens a full-screen slide-over member profile. Member profile has tabbed sections: Overview (photo, key details, stats), Attendance (heatmap + log), Workout (current plan), Diet (current plan), Payments (history + record new), Timeline (all events). Quick actions: Renew, Pause, Change Trainer, Send Message, Print Card. Bulk actions on table: Send Notification, Assign Plan, Export Selected.

### Accounts Page (app/(dashboard)/accounts/page.jsx)

**UI Prompt:**

> Finance page with top summary strip: Total Income, Total Expenses, Net Profit, Pending Collections — all for the selected period. Period selector with presets (Today, This Week, This Month, This Quarter, Custom Range). Main tabs: Transactions, Income, Expenses, Salary, Reports. Transactions tab is a full ledger table with all payment records, advanced filters, export. Income tab breaks down by type with a bar chart. Expenses tab same pattern. Salary tab lists all staff salary records for the month with status (Paid/Pending) and bulk pay action. Reports tab generates P&L and cash flow reports. Add Transaction floating button opens a form: type (income/expense/salary), amount, date, mode, reference, linked member/staff.

### Notifications Page (app/(dashboard)/notifications/page.jsx)

**UI Prompt:**

> Two-panel layout. Left panel: template library with list of templates grouped by category. Each template shows name, channel icons (WhatsApp/Email), category badge, last used date. Create Template button at top. Right panel: template detail + send flow. Clicking a template shows the body with variable placeholders highlighted. "Send Now" button opens a 3-step send flow: Step 1 — Choose Audience (All Branch / Filtered / Specific members — with filter builder showing plan type, status, expiry range); Step 2 — Preview (rendered message with sample data, recipient count, estimated cost); Step 3 — Schedule or Send. Delivery Logs tab below shows all past sends with status indicators, open rates, and failure details.

### Access Control Page (app/(dashboard)/access-control/page.jsx)

**UI Prompt:**

> Split-pane RBAC management page. Left pane: list of roles with system roles (Trainer, BranchAdmin, Receptionist) marked with a lock icon and custom roles below. Create Role button. Right pane: role editor with role name, description, and a permissions matrix organized by module. Matrix has module names as rows and actions (View, Create, Edit, Delete, Export, Send, Assign) as columns — each cell is a toggle checkbox. Bulk toggle per row (module) and per column (action). Changes auto-highlight with a save button that appears when dirty. Bottom section shows which staff members have this role assigned.

---

## 23. Common Bug Fixes & Hardening Checklist

### API Layer Bugs (Spring Boot)

- [ ] **Tenant scope missing**: Every `findAll()` must be `findAllByOrgId()`. Audit all repository methods. Never use raw `findAll()` in a multi-tenant app.
- [ ] **Soft delete not applied**: Ensure all list queries have `AND deleted_at IS NULL`. Use `@Where(clause = "deleted_at IS NULL")` on entity, but disable it explicitly when you NEED to query deleted records.
- [ ] **N+1 query on lists**: Use `@EntityGraph` or `JOIN FETCH` for associations loaded in list views. Use DTOs with `@Query` projections, not full entities.
- [ ] **Pagination off-by-one**: Spring Pageable is 0-indexed. Frontend must send `page=0` for first page. Document this clearly.
- [ ] **Date range inclusive**: `dateFrom` should be `>= dateFrom 00:00:00`, `dateTo` should be `< dateTo+1 00:00:00`. Missing timezone handling causes off-by-one day bugs.
- [ ] **Search case sensitivity**: Always apply `LOWER()` on both sides of LIKE query. Index with `lower()` function index in Postgres.
- [ ] **Null pointer on soft-deleted references**: When loading a User, their `assignedTrainer` might be soft-deleted. Handle nulls on all FK joins.
- [ ] **File upload size limit**: Configure `spring.servlet.multipart.max-file-size=10MB` and `max-request-size=10MB` explicitly.
- [ ] **Concurrent check-in race**: Use pessimistic lock or Redis distributed lock when recording check-in to prevent double check-in.
- [ ] **Salary calculation edge case**: Handle pro-rated salary for mid-month joiners/leavers. Never use integer division for money — use `BigDecimal`.
- [ ] **JWT branch scope validation**: Validate that the `branchId` in the JWT actually belongs to the `orgId` in the JWT on every request.
- [ ] **Circular Jackson serialization**: Bidirectional JPA relationships cause infinite loop in JSON serialization. Always use DTOs, never serialize entities directly.
- [ ] **Transaction boundary**: Mark service methods `@Transactional` correctly. `@Transactional(readOnly = true)` for all reads. Never call `@Transactional` methods from within the same bean (proxy bypass).

### Frontend Bugs (Next.js)

- [ ] **Stale JWT in client**: Axios interceptor must check token expiry BEFORE sending request and refresh proactively, not reactively on 401.
- [ ] **Search debounce missing**: All search inputs must debounce 300ms before firing API call.
- [ ] **URL-synced filters**: Use `useSearchParams` to sync all filter state to URL. Prevents losing filter state on navigation.
- [ ] **Table sort state**: Sort state must be part of query params, not local state, so sharing a URL preserves sort.
- [ ] **Optimistic UI on delete**: Show deletion immediately, revert on API failure with toast error.
- [ ] **Error boundary missing**: Wrap each major section in an error boundary to prevent full page crash.
- [ ] **Image upload preview**: Always show preview before upload. Validate file type and size client-side first.
- [ ] **Mobile responsiveness**: Test all tables on 375px width. Use horizontal scroll containers, never overflow-x hidden on page.
- [ ] **Empty states**: Every list view needs a designed empty state (no data illustration + clear call to action).
- [ ] **Loading skeleton**: Never use a spinner for list/table loading. Use skeleton rows that match the real content height.
- [ ] **Form validation**: Use react-hook-form + zod schema on all forms. Show inline field errors, not alert popups.
- [ ] **Branch context persistence**: Store selected branch in Zustand + localStorage. Don't lose it on page refresh.

---

## 24. Deployment Checklist

### Environment Variables (application.yml structure)

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USER}
    password: ${DB_PASS}
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        default_schema: public
  redis:
    host: ${REDIS_HOST}
    port: 6379
    password: ${REDIS_PASS}

jwt:
  secret: ${JWT_SECRET} # min 256-bit key
  access-token-expiry: 86400 # 24 hours
  refresh-token-expiry: 2592000 # 30 days

cloudinary:
  cloud-name: ${CLOUDINARY_NAME}
  api-key: ${CLOUDINARY_KEY}
  api-secret: ${CLOUDINARY_SECRET}

twilio:
  account-sid: ${TWILIO_SID}
  auth-token: ${TWILIO_TOKEN}
  whatsapp-from: ${TWILIO_WA_FROM}

sendgrid:
  api-key: ${SENDGRID_KEY}
  from-email: ${SENDGRID_FROM}

app:
  base-url: ${APP_BASE_URL}
  cors-origins: ${CORS_ORIGINS}
```

### Pre-production Checklist

- [ ] Database migrations via Flyway (not `ddl-auto: create`)
- [ ] All secrets in environment variables, never in code
- [ ] Redis persistence enabled for refresh token store
- [ ] HTTPS enforced, HTTP redirects to HTTPS
- [ ] API rate limiting: 100 req/min per IP globally, 5 req/min on auth endpoints
- [ ] Database connection pool configured (HikariCP: min=5, max=20)
- [ ] Cloudinary folder per org for isolation
- [ ] Logs shipping to centralized log service (ELK / Datadog)
- [ ] Health check endpoint: `GET /actuator/health`
- [ ] Seed default data: permissions matrix, system roles, global exercise library, global food database
- [ ] Flyway baseline migration runs on first deploy
- [ ] Backup schedule: DB backup every 6 hours, retained 30 days

---

_GymOS Implementation Plan v1.0 — Spring Boot + Next.js (JSX)_
_All APIs versioned under `/api/v1/`. All list endpoints support pagination, search, sort, date range filtering, and CSV export._

# GymOS — Complete System Overview

## Vision & Architecture Philosophy

This is an **enterprise-grade multi-tenant SaaS platform** for gym chain management. Think of it as the intersection of Notion's flexibility, Stripe's financial rigor, and WhatsApp Business's communication reach — purpose-built for fitness businesses.

The architecture follows a **hierarchical authority model**: SuperAdmin → OrgOwner → BranchAdmin → Trainer → Member. Every piece of data, every action, every notification is scoped to this hierarchy. Nothing bleeds across tenant boundaries.

---

## Tech Stack Decisions

**Backend — Spring Boot**
The monolith-first, modular approach. A single deployable Spring Boot application broken into domain packages rather than microservices. This gives you the simplicity of one deployment with the clean boundaries of services. PostgreSQL as the primary database with Redis for sessions, caching, and real-time presence. JWT-based auth with refresh tokens, role-scoped claims baked directly into the token payload so every request carries its own authorization context.

**Frontend — Next.js (App Router, all JSX)**
Server components for data-heavy pages like dashboards and reports, client components for interactive surfaces like chat and live attendance. Shadcn/UI as the component foundation — not because it's trendy but because it gives you unstyled primitives you can brand completely. Zustand for client state, TanStack Query for server state and cache invalidation.

**Infrastructure Layer**
Twilio for WhatsApp Business API, SendGrid for transactional email, Cloudinary for media (profile photos, equipment images, diet plan attachments), WebSockets via STOMP over Spring's messaging layer for real-time chat and notifications.

---

## Data Architecture — The Core Entities

The entire system revolves around a small number of foundational entities that everything else hangs off of.

**Organization** sits at the top. One record per gym business. It owns a subscription tier, billing info, and global settings. Every other entity traces back to this.

**Branch** belongs to an Organization. Has its own address, operating hours, capacity limits, equipment inventory, and its own admin. This is the operational unit — most day-to-day work happens at this level.

**User** (Member) always belongs to a Branch. Carries their membership plan, assigned trainer, payment history, attendance log, body metrics, and communication preferences. Soft-deleted on leave, never hard-deleted because financial records must persist.

**Staff** is a polymorphic entity — a single table with a role discriminator covering BranchAdmin, Trainer, Receptionist, and future roles. Staff have branch-scoped logins meaning a trainer at Branch A literally cannot see Branch B data even if they try.

**Plan** is the product catalog. An OrgOwner defines plans (Basic, Premium, Prime PT) and assigns them to specific branches with branch-specific pricing. Plans carry what's included — gym access, classes, PT sessions, diet plan access — and this drives what each member can see in their app.

**Inventory Item** belongs to a Branch. Tracks equipment type, purchase date, warranty expiry, maintenance schedule, and current status. The accounts module pulls from this for depreciation.

---

## Module Deep Dives

**Dashboard**
Not a static page — a real-time operational nerve center. Revenue today vs. yesterday vs. same day last month. Active members in gym right now (via check-in events). Expiring memberships in the next 7 days with one-click renewal nudge. Trainer utilization rates. Equipment under maintenance. Pending approvals. Overdue payments. Everything is drill-down — click any metric and you're in the relevant module filtered to that context.

**Accounts**
Double-entry inspired ledger at the branch level, rolled up to org level. Income streams: membership fees, PT packages, merchandise, guest passes. Expense streams: trainer salaries, electricity, equipment purchases/maintenance, rent if you choose to track it. Every financial event — payment received, salary processed, invoice generated — creates an immutable ledger entry. Reports: P&L by branch, cash flow, member payment aging, salary disbursement history. Payment gateway integration (Razorpay/Stripe) so online payments auto-reconcile. Manual cash/UPI entry for in-person payments. WhatsApp payment reminders fire automatically before due date, on due date, and 3 days after — all configurable in Settings.

**Branches**
Full CRUD with soft delete. Each branch card shows: live member count, active trainers today, revenue this month, equipment alerts. Branch creation wizard walks through address, geolocation pin (for members to find it), operating hours per day, capacity, and initial admin assignment. Branch-level settings inherit from org but can override — e.g., org default grace period is 7 days but this branch runs 3 days.

**Users (Members)**
The richest module. Member profile carries everything: personal details, emergency contact, health conditions (used to flag trainer assignments), current plan, payment history, attendance heatmap, body metric progression (weight, body fat%, measurements over time), assigned workouts, diet plans, class bookings, and chat thread with trainer. Filters: by branch, plan tier, payment status, join date, trainer, activity level. Bulk actions: send notification, assign plan, flag for renewal.

**Staff Management**
Trainer profiles include their certification details, specializations, assigned member list (with capacity indicator — don't over-assign), salary structure (fixed + per-PT-session commission), attendance, and performance metrics (member retention rate, average member progress). BranchAdmin has a simpler profile. Attendance for all staff tracked via QR code check-in or manual entry. Monthly salary processing pulls attendance + session counts and generates payslip — exportable as PDF, sendable via WhatsApp.

**Inventory**
Each piece of equipment has a full lifecycle record. QR code generation per item for quick status updates. Maintenance scheduling with reminder notifications to branch admin. Breakdown reporting creates a ticket visible to org owner. Depreciation calculator for accounting integration. Low-stock tracking for consumables like towels, sanitizer, protein supplements if the gym retails them.

**Plans & Assign Plan**
Two-layer system. OrgOwner defines Plan Templates (what's included, pricing tiers). BranchAdmin then instantiates those templates for their branch with local pricing adjustments. A plan defines: duration, access times (24/7 vs. peak hours only), included classes, PT sessions per month, diet plan access, app features unlocked. Members see only what their plan unlocks — a Basic member cannot see Prime PT workout content.

**Activity**
The class and event management system. Create activity types: Zumba, HIIT, Fat Loss Circuit, Yoga, Spinning. For each scheduled session: instructor, capacity, time, location within branch (Studio A vs. Main Floor), and crucially — who can book it. Visibility rules: All Members / Plan-gated (Premium only) / PT-only / Staff-only. Booking system with waitlist. Attendance marking by instructor. Activity analytics: fill rates, popular slots, instructor ratings.

**Notifications (WhatsApp + Email)**
Template library with variable substitution — `{member_name}`, `{due_date}`, `{branch_name}`, `{amount}`. Template categories: Payment reminder, Membership expiry, Class booking confirmation, Promotional (new class launch, offer), Trainer message, Bulk announcement. Audience targeting: specific members by filter (expiring this week, plan tier, trainer assignment), all branch members, specific staff, cross-branch blast (org owner only). Scheduling: send now, schedule for date/time, recurring (every Monday 8am). Delivery tracking: sent, delivered, read (WhatsApp gives read receipts). All sends logged for audit.

**Workout Plans**
Template library managed by OrgOwner and Trainers. Push/Pull/Legs, Upper/Lower splits, Full Body, Sport-Specific, Beginner/Intermediate/Advanced variants. Each plan is a structured week — Day 1: Chest + Triceps, here are the exercises, sets, reps, rest periods, video links, form cues. Trainer assigns a plan to a member, member sees it in their app. Trainer can fork a template and customize for a specific member. Progress tracking: member logs actual sets/reps/weight, trainer sees the log and can adjust.

**Diet Plans**
Food database (can seed from open nutrition databases). Meal plan builder: specify meals per day, food items with quantities, macros auto-calculated. Plans tagged by goal: Fat Loss, Muscle Gain, Maintenance, Medical (diabetic-friendly, etc.). Trainer assigns to member. Member logs actual food intake. Weekly check-in prompts member to log weight + photos. Trainer reviews and adjusts plan accordingly.

**Access Control (RBAC)**
Module-level permission matrix. Every module (Accounts, Members, Staff, Inventory, etc.) has granular permissions: View, Create, Edit, Delete, Export, Send Notification. Roles are not hardcoded — OrgOwner creates roles ("Senior Trainer", "Front Desk", "Area Manager") and assigns permission sets. Then assigns roles to staff. This means a Receptionist can have View access to Members and Create access to Attendance but zero access to Accounts. An Area Manager might have read-only access across all branches. The system ships with sensible defaults but everything is overridable.

**Settings**
The control room. Org-level: business details, logo, brand colors (white-label the member app). Billing & subscription management. Default notification templates. Global grace period for payments. Branch-level settings override: operating hours, capacity rules, check-in method. Attendance settings: QR-based, biometric integration ready, manual override rules. Reminder cadences: how many days before membership expiry to send first/second/final reminder. Salary disbursement date. Data retention policies.

---

## Cross-Cutting Concerns

**Multi-Tenancy Isolation**
Every database query is org-scoped at the repository layer via a TenantContext that's populated from the JWT on every request. It's impossible to accidentally query across org boundaries. Branch scoping is the same pattern one level down.

**Audit Trail**
Every create, update, delete, and notable action (payment processed, plan changed, staff terminated) writes to an audit log with actor, timestamp, before/after state. Non-deletable. Exportable for compliance.

**Soft Delete Pattern**
No gym data is ever hard deleted. Members get `deleted_at` timestamp, staff gets `status: TERMINATED`, branches get `status: CLOSED`. Financial records associated with these entities remain fully intact and queryable. The UI just filters them out by default with a "show archived" toggle.

**Real-Time Layer**
WebSocket connection maintained for: trainer-member chat, live dashboard metrics, attendance events (when a member checks in, the dashboard counter ticks up in real time), and in-app notification delivery.

**File Storage**
All media goes to Cloudinary with signed URLs. Profile photos, equipment images, exercise demonstration videos (linked, not hosted), diet plan PDFs, salary slips. Organized by org/branch/entity hierarchy in the cloud storage structure.

---

## API Design Principles

RESTful with consistent patterns. Every list endpoint supports: pagination (cursor-based for large datasets), filtering (field-level query params), sorting, and field selection. Standard response envelope: `{ success, data, meta, errors }`. Error responses carry machine-readable error codes alongside human messages so the frontend can handle them programmatically. Versioned from day one — `/api/v1/` — so you can iterate without breaking mobile clients.

---

## The Member-Facing Experience

Everything above is the management layer. Members get their own scoped view: their profile, their plan details, their workout for today, their diet plan, their trainer chat, class booking, payment history, and attendance record. This is the same Next.js app — different routing group, different layout, plan-gated content. No separate app to maintain.

---

## Scale Considerations

The architecture is built to scale vertically first (bigger server) and horizontally later (multiple instances behind a load balancer). PostgreSQL connection pooling via PgBouncer. Redis for distributed session storage so any instance can serve any request. Background jobs (payment reminders, report generation, salary processing) via Spring's `@Scheduled` with a distributed lock via Redis so only one instance runs each job. When you're ready to extract microservices — Accounts is always the first candidate — the domain boundaries are already drawn cleanly.

---

This is a serious system. Done right, it's not just a gym management tool — it's the operating system for a fitness business. Every feature listed feeds every other feature: the plan module gates the activity module, the accounts module consumes the staff module's attendance data, the notification module touches every other module as a cross-cutting service. The architecture respects those dependencies while keeping the boundaries clean enough to build, test, and scale each part independently.
