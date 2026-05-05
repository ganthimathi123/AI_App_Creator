# Config-Driven AI App Generator

A production-grade mini low-code platform that dynamically generates a full-stack web application based on a JSON configuration.

## Features
- **Dynamic UI Generation**: Forms and tables are rendered on-the-fly based on the JSON config.
- **Dynamic API Factory**: Backend routes are automatically generated to handle CRUD operations for any defined entity.
- **Config Editor**: Edit the application structure in real-time using the built-in JSON editor.
- **JWT Authentication**: Secure user-scoped data handling.
- **CSV Import**: Upload data to any dynamic entity via CSV.
- **Responsive Design**: Premium UI built with Tailwind CSS and Lucide icons.

## Tech Stack
- **Frontend**: Vite + React, Tailwind CSS, Lucide Icons, Zod
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Shared**: Zod-based configuration schema

## How to Run

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database

### 2. Backend Setup
```bash
cd backend
npm install
# Update .env with your DATABASE_URL
npx prisma migrate dev --name init
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## JSON Config Example
```json
{
  "appName": "Fleet Manager",
  "entities": [
    {
      "name": "Vehicle",
      "label": "Vehicles",
      "fields": [
        { "name": "make", "label": "Make", "type": "text", "required": true },
        { "name": "model", "label": "Model", "type": "text" },
        { "name": "year", "label": "Year", "type": "number" }
      ]
    }
  ]
}
```

## Architecture
- **Dynamic Engine**: The `DynamicRouter` (backend) and `DynamicForm`/`DynamicTable` (frontend) use a shared Zod schema to ensure consistency and robustness.
- **Persistence**: Dynamic data is stored in PostgreSQL using JSONB columns, allowing for schema flexibility without migrations.
- **Validation**: All inputs are validated using Zod schemas generated from the config.
