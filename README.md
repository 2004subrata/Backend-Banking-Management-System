# 🏦 Backend Banking Management System

A robust, production-ready **Ledger System** backend built with **Node.js**, **Express**, and **MongoDB**. This system provides secure banking operations including cookie-based authentication, account management, and double-entry transaction processing with idempotency guarantees.

**🌐 Live API:** [https://backend-banking-management-system.onrender.com/](https://backend-banking-management-system.onrender.com/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Server](#running-the-server)
- [Authentication](#-authentication)
- [API Reference](#-api-reference)
  - [Auth APIs](#1-auth-apis)
  - [Account APIs](#2-account-apis)
  - [Transaction APIs](#3-transaction-apis)
- [Project Structure](#-project-structure)
- [Data Models](#-data-models)
- [Error Handling](#-error-handling)
- [Contributing](#-contributing)
- [Support](#-support)



---

## ✨ Features

- 🔐 **Cookie-Based Auth** — Secure JWT stored in HTTP-only cookies; token blacklisting on logout
- 🏧 **Account Management** — Create and manage multiple bank accounts per user
- 📒 **Double-Entry Ledger** — Every transaction is recorded as balanced debit/credit ledger entries
- 🔁 **Idempotency Support** — Safe retries with idempotency keys to prevent duplicate transactions
- 🏗️ **System User Funding** — Privileged system account for initial fund injection
- 🔒 **Balance Integrity** — Real-time balance checks and validation before every transfer
- 📧 **Email Notifications** — Transactional emails via Nodemailer + Google OAuth2

---

## 🛠 Tech Stack

| Layer           | Technology                        |
|-----------------|-----------------------------------|
| Runtime         | Node.js                           |
| Framework       | Express.js                        |
| Database        | MongoDB (via Mongoose)            |
| Auth            | JWT stored in HTTP-only Cookies   |
| Token Blacklist | MongoDB (`blackList` collection)  |
| Email           | Nodemailer + Google OAuth2        |
| Package Manager | pnpm                              |
| Deployment      | Render                            |

---

## 🚀 Getting Started

### Prerequisites

Ensure the following are installed on your machine:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas URI)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/2004subrata/Backend-Banking-Management-System.git
   cd Backend-Banking-Management-System
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

### Environment Variables

Create a `.env` file in the root directory by copying the provided template:

```bash
cp .env.example .env
```

Then fill in the values:

```env
# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_key

# Google OAuth2 (for Nodemailer Email Service)
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
REFRESH_TOKEN=your_google_oauth_refresh_token
EMAIL_USER=your_gmail_address
```

| Variable        | Description                                                    |
|-----------------|----------------------------------------------------------------|
| `MONGO_URI`     | MongoDB connection string (local or Atlas)                     |
| `JWT_SECRET`    | Secret key used to sign and verify JWT tokens                  |
| `CLIENT_ID`     | Google Cloud OAuth2 Client ID (for Gmail API access)           |
| `CLIENT_SECRET` | Google Cloud OAuth2 Client Secret                              |
| `REFRESH_TOKEN` | Long-lived OAuth2 refresh token for sending emails             |
| `EMAIL_USER`    | Gmail address used as the sender (`from` field in emails)      |

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

> 📌 To set up Google OAuth2 for Nodemailer, visit [Google Cloud Console](https://console.cloud.google.com/), create OAuth2 credentials, and generate a refresh token with the Gmail API scope.

### Running the Server

**Development mode** (with hot reload via `nodemon`):

```bash
pnpm run dev
```

**Production mode:**

```bash
pnpm start
```

The server runs at **`http://localhost:3000`**.

---

## 🔐 Authentication

This API uses **cookie-based authentication**. Upon a successful login, a signed JWT is stored in an **HTTP-only cookie** on the client. All protected routes read the token from this cookie automatically.

**Key behaviours:**

- **No `Authorization` header needed** — the cookie is sent automatically by the browser or HTTP client on every request.
- **Logout blacklisting** — on logout, the current token is stored in the `BlackList` collection in MongoDB. The `auth.middleware.js` checks this list on every request to reject reused tokens even before they expire.
- **Postman / API clients** — ensure the cookie jar / "Send cookies" option is enabled in your client settings.


---

## 📡 API Reference

> **Base URL (Production):** `https://backend-banking-management-system.onrender.com`
>
> **Base URL (Local):** `http://localhost:3000`

All request and response bodies use `application/json`.
Authentication is handled via **HTTP-only cookies** set automatically after login — no manual token management required.

---

### 1. Auth APIs

#### Register a New User

```
POST /api/auth/register
```

Creates a new user account in the system.

**Request Body:**

| Field      | Type   | Required | Description                      |
|------------|--------|----------|----------------------------------|
| `name`     | string | ✅       | Full name of the user            |
| `email`    | string | ✅       | Valid, unique email address      |
| `password` | string | ✅       | Minimum 6 characters             |

**Example Request:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```


---

#### Login

```
POST /api/auth/login
```

Authenticates an existing user. On success, a JWT is signed and set as an **HTTP-only cookie** in the response headers.

**Request Body:**

| Field      | Type   | Required | Description          |
|------------|--------|----------|----------------------|
| `email`    | string | ✅       | Registered email     |
| `password` | string | ✅       | Account password     |

**Example Request:**

```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```



> 🍪 The JWT is set automatically as an HTTP-only cookie (`token`). No manual token storage is needed.

---

#### Logout

```
POST /api/auth/logout
```

Logs out the currently authenticated user. The active token is **added to the blacklist** in MongoDB and the cookie is cleared from the client.



---

### 2. Account APIs

> 🔒 All account endpoints require a valid session cookie (set on login).

#### Create a New Account

```
POST /api/accounts/
```

Creates a new bank account linked to the currently authenticated user. Initial balance is `0`.

**Example Response:** `201 Created`

```json
{
  "account": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d0",
    "balance": 0,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

#### Get All Accounts

```
GET /api/accounts/
```

Retrieves all bank accounts associated with the authenticated user.

**Example Response:** `200 OK`

```json
{
  "accounts": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "userId": "64f1a2b3c4d5e6f7a8b9c0d0",
      "balance": 1500.00,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

#### Check Account Balance

```
GET /api/accounts/balance/:accountId
```

Returns the current balance of a specific account.

**URL Parameters:**

| Parameter   | Type   | Required | Description                       |
|-------------|--------|----------|-----------------------------------|
| `accountId` | string | ✅       | The MongoDB `_id` of the account  |

**Example Response:** `200 OK`

```json
{
  "accountId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "balance": 1500.00
}
```

---

### 3. Transaction APIs

> 🔒 All transaction endpoints require a valid session cookie (set on login).
>
> 🔁 **Idempotency:** Every request must include a unique `idempotencyKey`. Re-submitting the same key returns the original result without processing a duplicate — making retries completely safe.

#### Create a New Transaction

```
POST /api/transactions/
```

Transfers funds between two accounts using a **double-entry ledger model**. For each transaction, two ledger entries are created atomically — a debit from the source and a credit to the destination.

**Request Body:**

| Field            | Type   | Required | Description                                            |
|------------------|--------|----------|--------------------------------------------------------|
| `fromAccount`    | string | ✅       | Source account ID (sender)                             |
| `toAccount`      | string | ✅       | Destination account ID (receiver)                      |
| `amount`         | number | ✅       | Amount to transfer — must be greater than `0`          |
| `idempotencyKey` | string | ✅       | Unique string to prevent duplicate transaction processing |

**Example Request:**

```json
{
  "fromAccount": "64f1a2b3c4d5e6f7a8b9c0d1",
  "toAccount": "64f1a2b3c4d5e6f7a8b9c0d2",
  "amount": 250,
  "idempotencyKey": "txn_abc123_20240115"
}
```

**Example Response:** `201 Created`

```json
{
  "message": "Transaction completed successfully",
  "transaction": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
    "fromAccount": "64f1a2b3c4d5e6f7a8b9c0d1",
    "toAccount": "64f1a2b3c4d5e6f7a8b9c0d2",
    "amount": 250.00,
    "idempotencyKey": "txn_abc123_20240115",
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

#### Create Initial Funds — System User

```
POST /api/transactions/system/initial-funds
```

Credits an account with an initial balance sourced from the privileged **system account**. Designed for onboarding new users or seeding accounts in a development environment.

> ⚠️ This endpoint is restricted to authorized system-level or admin access.

**Request Body:**

| Field            | Type   | Required | Description                                              |
|------------------|--------|----------|----------------------------------------------------------|
| `toAccount`      | string | ✅       | Destination account ID to receive the initial funds      |
| `amount`         | number | ✅       | Amount to credit — must be greater than `0`              |
| `idempotencyKey` | string | ✅       | Unique string to prevent duplicate fund injections       |

**Example Request:**

```json
{
  "toAccount": "64f1a2b3c4d5e6f7a8b9c0d1",
  "amount": 1000.00,
  "idempotencyKey": "init_funds_jane_001"
}
```

**Example Response:** `201 Created`

```json
{
  "message": "Initial funds transaction completed successfully",
  "transaction": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d4",
    "fromAccount": "SYSTEM",
    "toAccount": "64f1a2b3c4d5e6f7a8b9c0d1",
    "amount": 1000.00,
    "idempotencyKey": "init_funds_jane_001",
    "createdAt": "2024-01-15T09:00:00.000Z"
  }
}
```

---

## 📁 Project Structure

```
Backend-Banking-Management-System/
│
├── src/
│   ├── config/
│   │   └── db.js                        # MongoDB connection and initialization
│   │
│   ├── controllers/
│   │   ├── account.controller.js        # Account creation, listing, balance logic
│   │   ├── auth.controller.js           # Register, login, logout logic
│   │   └── transaction.controller.js    # Fund transfer and system funding logic
│   │
│   ├── middleware/
│   │   └── auth.middleware.js           # Reads JWT from cookie; validates & checks blacklist
│   │
│   ├── models/
│   │   ├── account.model.js             # Account schema (userId, balance)
│   │   ├── blackList.model.js           # Stores invalidated JWTs after logout
│   │   ├── ledger.model.js              # Double-entry ledger schema (debit/credit entries)
│   │   ├── transaction.model.js         # Transaction schema with idempotency key
│   │   └── user.model.js               # User schema (name, email, hashed password)
│   │
│   ├── routes/
│   │   ├── account.routes.js            # Mounts /api/accounts endpoints
│   │   ├── auth.routes.js               # Mounts /api/auth endpoints
│   │   └── transaction.routes.js        # Mounts /api/transactions endpoints
│   │
│   ├── services/
│   │   └── email.service.js             # Sends emails via Nodemailer + Google OAuth2
│   │
│   └── app.js                           # Express setup: middleware, routes, error handler
│
├── .env                                 # Local environment variables (git-ignored)
├── .env.example                         # Safe template for collaborators
├── .gitignore
├── package.json
├── pnpm-lock.yaml
└── server.js                            # Entry point — connects DB and starts HTTP server
```

---

## 🗂 Data Models

| Model         | Description                                                                       |
|---------------|-----------------------------------------------------------------------------------|
| `User`        | Stores user credentials — name, email, and hashed password                       |
| `Account`     | Bank account tied to a user; tracks current balance                               |
| `Transaction` | Records a fund transfer between two accounts with idempotency key enforcement     |
| `Ledger`      | Double-entry record — every transaction generates one debit + one credit entry    |
| `BlackList`   | Stores invalidated JWTs; checked by `auth.middleware.js` on every protected route |

---

## ⚠️ Error Handling



**Common HTTP Status Codes:**

| Status | Meaning                                              |
|--------|------------------------------------------------------|
| `200`  | OK — Request succeeded                               |
| `201`  | Created — Resource successfully created              |
| `400`  | Bad Request — Missing or invalid input fields        |
| `401`  | Unauthorized — No cookie, expired, or blacklisted token |
| `403`  | Forbidden — Valid token but insufficient permissions |
| `404`  | Not Found — Resource does not exist                  |
| `409`  | Conflict — Duplicate `idempotencyKey` detected       |
| `500`  | Internal Server Error                                |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: describe your change'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

Please ensure your code is well-commented and follows the existing conventions of the project.



---

## ⭐ Support

If you like this project, please give it a ⭐ on GitHub!

---

<p align="center">Made with ❤️ using Node.js, Express & MongoDB</p>
