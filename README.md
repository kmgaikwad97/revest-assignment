# Revest Assignment — Microservice-based Application

A full-stack application with two NestJS microservices (product-service & order-service) and a Next.js frontend with a JSON-driven dynamic form.

---

## Architecture

```
next-app (port 3000)
   │
   ├── calls product-service APIs (port 3001)
   └── calls order-service APIs  (port 3002)

product-service (port 3001)
   └── manages products (in-memory)

order-service (port 3002)
   ├── validates product via product-service
   ├── calculates totalPrice
   └── manages orders (in-memory)
```

---

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

---

## Running Locally

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd revest-assignment
```

---

### 2. Install all dependencies

```bash
# npm install          # installs concurrently at root
npm run install:all  # installs deps for all 3 apps
```

---

### 3. Start everything with one command

```bash
npm run dev
```

This starts all three services concurrently with colour-coded output:

| Service | URL |
|---------|-----|
| product-service | http://localhost:3001 |
| order-service | http://localhost:3002 |
| next-app (frontend) | http://localhost:3000 |

---

### Alternative: run services individually

```bash
# Terminal 1
cd backend/product-service && npm run start:dev

# Terminal 2
cd backend/order-service && npm run start:dev

# Terminal 3
cd frontend/next-app && npm run dev
```

---

## API Reference

### Product Service — http://localhost:3001

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/products` | Create a product |
| GET | `/products` | List all products |
| GET | `/products/:id` | Get product by ID |
| PATCH | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |

**Create product payload:**
```json
{
  "name": "iPhone 15",
  "price": 70000,
  "description": "Latest Apple smartphone",
  "stock": 10
}
```

---

### Order Service — http://localhost:3002

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create an order |
| GET | `/orders` | List all orders (includes product details) |
| GET | `/orders/:id` | Get order by ID |
| PATCH | `/orders/:id/cancel` | Cancel an order |

**Create order payload:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

---

## Example Test Flow

```bash
# 1. Create a product
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone 15","price":70000,"description":"Apple smartphone","stock":10}'

# 2. Create an order (order-service calls product-service internally)
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'

# 3. Get all orders with product details
curl http://localhost:3002/orders
```

---

## Frontend — Dynamic Form

The signup form at `http://localhost:3000` is **100% JSON-driven**.

### How it works

Fields are defined in `src/data/form-config.ts`. Each field has a `fieldType`:

| fieldType | Renders as |
|-----------|------------|
| `TEXT` | MUI TextField |
| `LIST` | MUI Select (dropdown) |
| `RADIO` | MUI RadioGroup |

Changing `fieldType` in the JSON automatically changes the rendered component — no code changes needed.

### Features

- Dynamic field rendering from JSON config
- React Hook Form validation (required, minLength, maxLength, email pattern)
- Material UI components & responsive layout
- localStorage persistence — data restored on page reload
- Snackbar notifications on submit/clear
- Saved data preview panel

---

## Project Structure

```
revest-assignment/
├── backend/
│   ├── product-service/
│   │   └── src/
│   │       ├── products/
│   │       │   ├── dto/
│   │       │   ├── interfaces/
│   │       │   ├── products.controller.ts
│   │       │   ├── products.service.ts
│   │       │   └── products.module.ts
│   │       ├── app.module.ts
│   │       └── main.ts
│   └── order-service/
│       └── src/
│           ├── orders/
│           │   ├── dto/
│           │   ├── interfaces/
│           │   ├── orders.controller.ts
│           │   ├── orders.service.ts
│           │   └── orders.module.ts
│           ├── app.module.ts
│           └── main.ts
├── frontend/
│   └── next-app/
│       └── src/
│           ├── app/
│           │   ├── layout.tsx
│           │   └── page.tsx
│           ├── components/
│           │   ├── DynamicForm.tsx
│           │   ├── FieldRenderer.tsx
│           │   └── MuiProvider.tsx
│           ├── data/
│           │   └── form-config.ts
│           ├── types/
│           │   └── form-field.ts
│           └── utils/
│               └── storage.ts
└── README.md
|___ package.json
|___ .gitignore

```

---

## Design Decisions

- **In-memory storage** — no database setup required; meets assignment requirements
- **REST communication** — order-service uses `@nestjs/axios` to call product-service
- **Stock reduction** — after order creation, order-service calls `PATCH /products/:id/reduce-stock`
- **PartialType DTOs** — update DTOs extend create DTOs for DRY code
- **Modular NestJS structure** — each concern (products, orders) is its own feature module
- **JSON-config-driven UI** — swapping `fieldType` in `form-config.ts` instantly changes UI rendering
