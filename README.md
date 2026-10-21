# 🛍️ Clean Shop — NestJS Clean Architecture & DDD Showcase

A production-grade, modular e-commerce backend built with **NestJS**, adhering strictly to the principles of **Clean Architecture (Hexagonal / Ports & Adapters)**, **Domain-Driven Design (DDD)**, and **CQRS (Command Query Responsibility Segregation)** with event-driven **Sagas**.

---

## 📑 Table of Contents

- [Architectural Highlights](#-architectural-highlights)
- [Tech Stack](#-tech-stack)
- [Project Structure & Layers](#-project-structure--layers)
- [Module Breakdown](#-module-breakdown)
- [Order Fulfillment Workflow (Saga Pattern)](#-order-fulfillment-workflow-saga-pattern)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Running Infrastructure (Docker Compose)](#running-infrastructure-docker-compose)
  - [Database Migrations (Drizzle ORM)](#database-migrations-drizzle-orm)
  - [Stripe Webhook Listener](#stripe-webhook-listener)
  - [Starting the Application](#starting-the-application)
- [API Reference](#-api-reference)
  - [Customers](#1-customers-customers)
  - [Products](#2-products-products)
  - [Orders](#3-orders-orders)
  - [Payments](#4-payments-payments)
- [Scripts](#-scripts)

---

## 🏛️ Architectural Highlights

- **Clean Architecture & Hexagonal Ports & Adapters:** Complete decoupling of business logic from frameworks, ORMs, and third-party delivery mechanisms. Domain and Application layers hold no infrastructure dependencies.
- **Domain-Driven Design (DDD):**
  - **Aggregates & Entities:** Rich domain models encapsulating business invariants and state transitions (e.g., `Order`, `Payment`, `Customer`, `Product`).
  - **Value Objects:** Immutable objects with self-validation (`Money`, `Email`, `OrderId`, `OrderStatus`, `ShippingAddress`, `Sku`).
  - **Domain Events:** Decoupled event propagation for cross-boundary side-effects (`OrderPlacedEvent`, `OrderConfirmedEvent`, `OrderShippedEvent`, `PaymentCompletedEvent`).
- **CQRS (Command Query Responsibility Segregation):**
  - **Commands (`CommandBus`):** Intent-driven mutation use cases with transactional consistency.
  - **Queries (`QueryBus`):** Optimized read operations returning presentation DTOs without domain mutation overhead.
- **Saga Pattern (Reactivity with RxJS):**
  - Cross-module distributed orchestration using `@Saga()` handlers. Reacts to domain events (e.g., `PaymentCompletedEvent`) and dispatches compensating/subsequent commands (e.g., `ConfirmOrderCommand`) asynchronously.
- **Polyglot Persistence:**
  - Dynamic repository injection via dependency inversion: The `Product` module seamlessly switches between **PostgreSQL (Drizzle ORM)** and **MongoDB** based on environment configuration (`DATABASE=postgres` or `DATABASE=mongodb`).
- **Domain Exception Handling:** Custom global exception filters (`DomainExceptionFilter`, `ApplicationExceptionFilter`) mapping business rule errors to appropriate semantic HTTP status codes.

---

## 🧰 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **[NestJS 11](https://nestjs.com/)** | Extensible enterprise Node.js framework |
| **[@nestjs/cqrs](https://docs.nestjs.com/recipes/cqrs)** | CQRS buses (CommandBus, QueryBus, EventBus, Saga) |
| **[TypeScript 5.7](https://www.typescriptlang.org/)** | Strongly typed JavaScript |
| **[Drizzle ORM 0.45](https://orm.drizzle.team/)** | High-performance TypeScript ORM for PostgreSQL |
| **[PostgreSQL](https://www.postgresql.org/)** | Primary relational database |
| **[MongoDB](https://www.mongodb.com/)** | Document database for catalog polyglot persistence |
| **[Stripe SDK](https://stripe.com)** | Payment processing via Checkout Sessions & Webhooks |
| **[Nodemailer](https://nodemailer.com/)** | Transactional email notifications |
| **[Docker & Compose](https://www.docker.com/)** | Local infrastructure containerization |

---

## 📂 Project Structure & Layers

Every bounded context follows a strictly enforced 4-layer architecture:

```
src/{module-name}/
├── domain/                      # 1. Domain Layer (Pure TypeScript)
│   ├── entities/                # Aggregate Roots and Entities
│   ├── value-objects/           # Self-validating Value Objects
│   └── events/                  # Domain Events
├── application/                 # 2. Application Layer (Use Cases)
│   ├── ports/                   # Inbound & Outbound Interfaces (Repositories, Services)
│   ├── use-cases/               # Command definitions & CommandHandlers
│   ├── queries/                 # Query definitions & QueryHandlers
│   ├── events/                  # EventHandlers
│   └── sagas/                   # Reactive Sagas (cross-module coordination)
├── infrastructure/              # 3. Infrastructure Layer (Adapters)
│   └── adapters/                # Drizzle ORM, MongoDB, Stripe, Nodemailer implementations
└── presentation/                # 4. Presentation Layer (Delivery)
    ├── dtos/                    # Request & Response Data Transfer Objects
    └── {name}.controller.ts     # HTTP REST Controllers
```

---

## 📦 Module Breakdown

1. **`customers` (`/customers`):**
   - Customer registration, management, and profile lookups.
   - Dispatches transactional welcome / notification emails via `NotificationPort` adapters.
2. **`product` (`/products`):**
   - Catalog management supporting polyglot persistence (switchable between PostgreSQL and MongoDB).
3. **`order` (`/orders`):**
   - Manages order lifecycles: `PENDING` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `DELIVERED` (or `CANCELLED`).
   - Verifies customer and product existence through decoupled ports (`CustomerPort`, `ProductPort`) rather than direct database joins.
   - Houses the `OrderFulfillmentSaga` to coordinate cross-context order fulfillment.
4. **`payment` (`/payments`):**
   - Handles Stripe Checkout session creation and processes cryptographically signed Stripe webhooks (`/payments/webhook`).
   - Emits `PaymentCompletedEvent` upon successful payment verification.
5. **`shared`:**
   - Common base classes (`AggregateRoot`, `Entity`, `Money`, `UniqueId`).
   - Shared database providers (Drizzle PostgreSQL & MongoDB).
   - Global HTTP exception filters for domain exceptions.

---

## 🔄 Order Fulfillment Workflow (Saga Pattern)

The payment and fulfillment cycle is decoupled across modules through domain events and the **Saga Pattern**:

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant API as Order & Payment APIs
    participant Stripe as Stripe Gateway
    participant OrderModule as Order Module
    participant PaymentModule as Payment Module
    participant Saga as OrderFulfillmentSaga
    participant Notification as Notification Service

    Customer->>API: 1. POST /orders (Place Order)
    API->>OrderModule: PlaceOrderCommand
    OrderModule-->>Customer: Order placed (Status: PENDING)

    Customer->>API: 2. POST /payments (Initiate Checkout)
    API->>PaymentModule: CreatePaymentCommand
    PaymentModule->>Stripe: Create Checkout Session
    PaymentModule-->>Customer: Returns Stripe Checkout URL

    Customer->>Stripe: 3. Pays on Stripe Checkout
    Stripe->>API: 4. POST /payments/webhook (checkout.session.completed)
    API->>PaymentModule: ConfirmPaymentCommand
    PaymentModule->>PaymentModule: Complete Payment (Status: SUCCEEDED)
    PaymentModule--)Saga: Emits PaymentCompletedEvent

    Note over Saga: Reactive Saga intercepts event
    Saga->>OrderModule: Dispatches ConfirmOrderCommand(orderId)
    OrderModule->>OrderModule: Order.confirm() (Status: CONFIRMED)
    OrderModule--)Notification: Emits OrderConfirmedEvent
    Notification->>Customer: Sends "Order Ready to Ship" Email
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (>= 20.x recommended)
- [npm](https://www.npmjs.com/) (>= 10.x)
- [Docker](https://www.docker.com/) & Docker Compose
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (for local webhook testing)

### Environment Setup

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env
```

Key environment variables:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `POSTGRES_DATABASE_URL` | PostgreSQL connection URL | `postgresql://postgres:postgres@localhost:5432/clean_shop` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://localhost:27017` |
| `DATABASE` | Product repository provider (`postgres` or `mongodb`) | `postgres` |
| `SMTP_HOST` / `SMTP_PORT` | SMTP provider settings (e.g. Mailtrap) | `sandbox.smtp.mailtrap.io:2525` |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) | — |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) | — |

### Running Infrastructure (Docker Compose)

Spin up local PostgreSQL and MongoDB containers:

```bash
docker-compose up -d
```

### Database Migrations (Drizzle ORM)

Apply database schema migrations to PostgreSQL:

```bash
# Generate new migration files if schema changes:
npx drizzle-kit generate

# Run pending migrations:
npx drizzle-kit migrate
```

### Stripe Webhook Listener

For local testing, use the Stripe CLI to forward events directly to your local application:

```bash
stripe listen --forward-to localhost:3000/payments/webhook
```

Copy the printed webhook signing secret (`whsec_...`) into your `.env` file under `STRIPE_WEBHOOK_SECRET`.

### Starting the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production build
npm run build
npm run start:prod
```

### 📖 Interactive API Documentation (Swagger / OpenAPI)

Once the application is running, access the interactive Swagger UI documentation at:

- **Swagger UI:** [http://localhost:3000/docs](http://localhost:3000/docs)
- **OpenAPI JSON Spec:** [http://localhost:3000/docs-json](http://localhost:3000/docs-json)

---

## 📡 API Reference

### 1. Customers (`/customers`)

#### Register a Customer
- **Method:** `POST /customers`
- **Body:**
```json
{
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### List Customers
- **Method:** `GET /customers`

#### Get Customer by ID
- **Method:** `GET /customers/:id`

#### Delete Customer
- **Method:** `DELETE /customers/:id`

---

### 2. Products (`/products`)

#### Create a Product
- **Method:** `POST /products`
- **Body:**
```json
{
  "name": "Mechanical Keyboard",
  "price": 149.99,
  "currency": "USD",
  "sku": "KB-MECH-001"
}
```

#### List Products
- **Method:** `GET /products`

#### Get Product by ID
- **Method:** `GET /products/:id`

#### Delete Product
- **Method:** `DELETE /products/:id`

---

### 3. Orders (`/orders`)

#### Place an Order
- **Method:** `POST /orders`
- **Body:**
```json
{
  "customerId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "items": [
    {
      "productId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "productName": "Mechanical Keyboard",
      "unitPrice": 149.99,
      "currency": "USD",
      "quantity": 1,
      "discount": 0
    }
  ],
  "shippingStreet": "123 Main St",
  "shippingCity": "San Francisco",
  "shippingState": "CA",
  "shippingZipCode": "94101",
  "shippingCountry": "USA"
}
```

#### List Orders
- **Method:** `GET /orders` *(Optional query parameter: `?customerId=<uuid>`)*

#### Get Order by ID
- **Method:** `GET /orders/:id`

#### Ship Order
- **Method:** `PATCH /orders/:id/ship`
- **Body:**
```json
{
  "trackingNumber": "TRK-9876543210"
}
```

#### Deliver Order
- **Method:** `PATCH /orders/:id/deliver`

#### Cancel Order
- **Method:** `PATCH /orders/:id/cancel`
- **Body:**
```json
{
  "reason": "Customer requested cancellation"
}
```

---

### 4. Payments (`/payments`)

#### Create Checkout Session
- **Method:** `POST /payments`
- **Body:**
```json
{
  "orderId": "6fd56de6-e0e6-481e-947c-9029aab4f8ec",
  "successUrl": "http://localhost:3000/orders/success",
  "cancelUrl": "http://localhost:3000/orders/cancel"
}
```
- **Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

#### Stripe Webhook
- **Method:** `POST /payments/webhook`
- **Headers:** `stripe-signature: <signature>`
- **Body:** Raw payload from Stripe. Dispatches `ConfirmPaymentCommand` on `checkout.session.completed`.

---

## 🛠️ Scripts

```bash
# Code Quality
npm run format      # Prettier formatting
npm run lint        # ESLint check with auto-fix

# Testing
npm run test        # Unit tests
npm run test:watch  # Unit tests in watch mode
npm run test:cov    # Test coverage report
npm run test:e2e    # End-to-end tests

# Database (Drizzle)
npx drizzle-kit generate  # Generate migration SQL
npx drizzle-kit migrate   # Execute migrations
```

---
