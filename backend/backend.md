# 🏋️ Gym Management System – Backend API Documentation

**Base URL**

```http
http://localhost:8080
```

> Port is configurable via `application.properties`
> `server.port=8080`

---

## 🔐 Authentication APIs

### 1️⃣ Register Organization

**POST** `/api/auth/register-organization`

Registers a new organization along with its first branch.

#### Request Body

```json
{
  "name": "GymBross HQ",
  "ownerEmail": "owner@example.com",
  "phone": "9876543210",
  "password": "StrongPass!",
  "branches": [
    {
      "name": "Downtown",
      "adminEmail": "admin@example.com",
      "password": "AdminPass!"
    }
  ]
}
```

#### Response

```json
{
  "message": "Organization registered successfully. Please check your email for OTP verification.",
  "organizationId": 1,
  "organizationCode": "ORG-12345678"
}
```

---

### 2️⃣ Register User, Trainer, Staff, Premium User

**POST** `/api/auth/register-user`

#### Request Body (User)

```json
{
  "name": "Alice User",
  "email": "alice@example.com",
  "phone": "1234567890",
  "password": "Password123",
  "orgId": 1,
  "branchId": 1,
  "startDate": "2024-01-01",
  "dob": "1995-05-15",
  "amountPaid": 1000.00,
  "plan": "Monthly"
}
```

**POST** `/api/auth/register-trainer`

#### Request Body (Trainer)

```json
{
  "name": "Bob Trainer",
  "email": "bob@example.com",
  "phone": "0987654321",
  "password": "Password123",
  "orgId": 1,
  "branchId": 1,
  "salary": 50000.00,
  "shiftTimings": "Morning",
  "startDate": "2024-01-01",
  "isPersonalTrainer": true
}
```

**POST** `/api/auth/register-staff`

#### Request Body (Staff)

```json
{
  "name": "Charlie Staff",
  "email": "charlie@example.com",
  "phone": "1122334455",
  "password": "Password123",
  "orgId": 1,
  "branchId": 1,
  "salary": 30000.00,
  "shiftTimings": "Evening",
  "role": "Cleaner",
  "startDate": "2024-01-01"
}
```

**POST** `/api/auth/register-premium-user`

#### Request Body (Premium User)

```json
{
  "name": "Dave Premium",
  "email": "dave@example.com",
  "phone": "5566778899",
  "password": "Password123",
  "orgId": 1,
  "branchId": 1,
  "plan": "Annual VIP",
  "trainerId": 5,
  "startDate": "2024-01-01"
}
```

---

### 3️⃣ Verify OTP

**POST** `/api/auth/verify-otp`

Verifies OTP sent during registration or authentication.

#### Request Body

```json
{
  "email": "owner@example.com",
  "otpCode": "123456",
  "otpType": "REGISTER"
}
```

#### Response

```text
OTP verified successfully
```

---

### 4️⃣ Resend OTP

**POST** `/api/auth/resend-otp`

Resends OTP to email or phone.

#### Request Body

```json
{
  "email": "owner@example.com",
  "phone": "9876543210",
  "otpType": "REGISTER"
}
```

#### Response

```text
OTP sent successfully
```

---

### 5️⃣ Login

**POST** `/api/auth/login`

Authenticates user and returns JWT.

#### Request Body

```json
{
  "identifier": "owner@example.com",
  "password": "StrongPass!"
}
```

#### Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "ORG_ADMIN",
  "organizationId": 1,
  "branchId": null
}
```

> JWT is also set as **HttpOnly Cookie**.

---

## 🔑 Authorization

All protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

JWT contains:

* `organizationId`
* `branchId`

These are extracted internally via `JwtUtil`.

---

## 📊 Admin Dashboard APIs (JWT Protected)

### 👤 Users Management

#### Get All Users

**GET** `/api/admin/dashboard/users`

**Response**

```json
[
  {
    "id": 12,
    "firstName": "Alice",
    "lastName": "Smith",
    "email": "alice@example.com",
    "role": "USER",
    "dob": "1990-04-15",
    "amountPaid": 120.00,
    "attendanceCount": 45,
    "branchId": 3,
    "organizationId": 1
  }
]
```

#### Create User (Admin Action)

**POST** `/api/admin/dashboard/users`

```json
{
  "firstName": "Bob",
  "lastName": "Jones",
  "email": "bob@example.com",
  "role": "USER",
  "dob": "2001-09-30",
  "amountPaid": 3000,
  "attendanceCount": 0,
  "plan": "3months + 1month free",
  "branchId": 3,
  "organizationId": 1,
  "trainerId": null
}
```

**Response:** `200 OK`

#### Get User By ID

**GET** `/api/admin/dashboard/users/{id}`

#### Update User

**PUT** `/api/admin/dashboard/users/{id}`

#### Delete User (Soft Delete)

**DELETE** `/api/admin/dashboard/users/{id}`

#### Assign Trainer

**PUT** `/api/admin/dashboard/users/{id}/assign-trainer?trainerName=John%20Doe`

#### Update Workout Plan

**PUT** `/api/admin/dashboard/users/{id}/workout-plan`

```json
[
  "Bench Press – 3×10",
  "Squats – 4×8",
  "Deadlift – 2×5"
]
```

#### Update Diet Plan

**PUT** `/api/admin/dashboard/users/{id}/diet-plan`

```json
[
  "Breakfast – Oatmeal",
  "Lunch – Grilled Chicken",
  "Dinner – Salmon"
]
```

---

### 🏋️ Trainers Management

#### Create Trainer

**POST** `/api/admin/dashboard/trainers`

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "branchId": 3,
  "salary": 45000,
  "shiftTimings": "Morning"
}
```

#### Get Trainer

**GET** `/api/admin/dashboard/trainers/{id}`

#### Update Trainer

**PUT** `/api/admin/dashboard/trainers/{id}`

#### Delete Trainer

**DELETE** `/api/admin/dashboard/trainers/{id}`

---

### 👨‍💼 Staff Management

#### Get All Staff

**GET** `/api/admin/dashboard/staff`

#### Create Staff

**POST** `/api/admin/dashboard/staff`

```json
{
  "firstName": "Sam",
  "lastName": "Cleaner",
  "email": "sam@example.com",
  "role": "Cleaner",
  "branchId": 3,
  "salary": 25000,
  "shiftTimings": "Night"
}
```

#### Get Staff By ID

**GET** `/api/admin/dashboard/staff/{id}`

#### Update Staff

**PUT** `/api/admin/dashboard/staff/{id}`

#### Delete Staff

**DELETE** `/api/admin/dashboard/staff/{id}`

---

## 📦 Inventory Dashboard APIs (JWT Protected)

#### Get Inventory

**GET** `/api/inventory`

#### Inventory Dashboard with Filters

**GET** `/api/inventory/dashboard`

**Query Params**

* `period` → `30days`
* `condition` → `GOOD`
* `page` → default `0`
* `size` → default `10`

#### Add Inventory Item

**POST** `/api/inventory`

```json
{
  "name": "Yoga Mat",
  "description": "Eco-friendly",
  "quantity": 20,
  "condition": "NEW",
  "purchaseDate": "2024-05-01"
}
```

#### Update Inventory Item

**PUT** `/api/inventory/{id}`

#### Delete Inventory Item

**DELETE** `/api/inventory/{id}`

---

## ⚠️ Error Handling

| Status  | Meaning                                         |
| ------- | ----------------------------------------------- |
| **401** | Unauthorized (Missing / Invalid JWT)            |
| **403** | Forbidden (Cross organization or branch access) |
| **404** | Resource not found                              |
| **400** | Bad Request (Validation Errors)                 |

---

## 📝 Notes

* JWT must always be sent in the `Authorization` header.
* Branch & Organization isolation is strictly enforced.
* Pagination is supported on inventory dashboard.

---

---

## 🔑 Additional OTP APIs

### Verify OTP (Alternative)

**POST** `/api/otp/Send-verify`

Simple verification endpoint, defaults to `REGISTER` type.

**Query Params**

* `id` → Email address
* `OTP` → The OTP code

**Response**

```text
Verification Successful. User is now active.
```

---

## 🧪 Test APIs

### Send Test SMS

**POST** `/api/test/sms/send`

**Query Params**

* `to` → Phone number
* `message` → Message content

**Response**

```text
SMS sent successfully to +1234567890
```

---

📅 **Documentation Updated:** `09 December 2025`
