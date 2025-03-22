# Postgres Edge Proxy

![Postgres Edge Proxy](https://img.shields.io/badge/Postgres-Edge%20Proxy-blue?style=for-the-badge&logo=postgresql)

A secure API proxy for PostgreSQL databases that allows you to access your own Postgres database from edge functions, serverless environments, and other contexts where direct PostgreSQL connections are not supported.

## 🌟 The Problem This Solves

Many modern deployment environments (Cloudflare Workers, Vercel Edge Functions, etc.) **cannot connect directly to PostgreSQL** due to network or runtime constraints. This proxy bridges that gap by providing a simple HTTP API to execute SQL queries against your database.

## 🚀 Key Features

- **Self-hosted PostgreSQL proxy** - run close to your database for optimal performance
- **Secure access** with API key authentication
- **HTTP API** for executing SQL queries from anywhere
- **Edge & serverless compatible** - works where TCP database connections aren't possible
- **Simple fetch API** with JSON responses
- **TypeScript support** with full type safety

## 🔐 Why Use This?

- **Keep database control**: Host your own database proxy instead of using third-party services
- **Edge deployment**: Connect to your PostgreSQL from environments that don't support direct connections
- **Security layer**: Add API-key authentication in front of your database
- **Connection pooling**: Efficiently manage database connections

## 📋 Prerequisites

- Node.js 18+
- A PostgreSQL database (any provider, including self-hosted)

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/postgres-edge-proxy.git
cd postgres-edge-proxy

# Install dependencies
npm install

# Create your .env.local file with your database credentials and API key
cp .env .env.local

# Start the development server
npm run dev

# For production
npm run build
npm run start
```

## 🔧 Configuration

Create a `.env.local` file with your configuration:

```bash
# Required
API_KEY="your-secure-api-key"
DATABASE_URL="postgres://username:password@hostname:port/database"

# Optional
PORT=3001
NODE_ENV=production
LOG_LEVEL=info
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=30000
```

## 🌐 Usage Examples

### Simple Client

```typescript
// Basic client example
async function queryDatabase(sql, params = []) {
  const response = await fetch('https://your-proxy-url/db-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    },
    body: JSON.stringify({ query: sql, params })
  });
  
  if (!response.ok) {
    throw new Error(`Query failed: ${await response.text()}`);
  }
  
  return response.json();
}

// Usage
const users = await queryDatabase('SELECT * FROM users WHERE id = $1', [123]);
console.log(users.rows);
```

### Integration with ORMs

This proxy can be used with any ORM that supports custom database adapters. Here's how you could integrate it with Drizzle ORM:

```typescript
// db-client.ts
export async function proxyQueryFn(sql: string, params: any[] = []) {
  const response = await fetch('https://your-proxy-url/db-proxy', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-API-Key': process.env.DB_API_KEY || '',
    },
    body: JSON.stringify({
      query: sql,
      params: params
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Database query failed: ${await response.text()}`);
  }
  
  return response.json();
}

// Then integrate with your ORM of choice
// For Drizzle example:
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const db = drizzle(proxyQueryFn, { schema });
```

## 🚢 Deployment Strategies

For optimal performance, deploy the proxy close to your database:

- **Self-hosted**: Run on the same network as your PostgreSQL server
- **Cloud VMs**: Use a small VM in the same region as your database
- **Kubernetes**: Deploy as a service in your cluster
- **PaaS**: Use services like Railway, Render, or Fly.io

## 📝 API Reference

### POST /db-proxy

Execute a SQL query against the database.

**Request Headers:**
- `Content-Type: application/json`
- `X-API-Key: <your-api-key>`

**Request Body:**
```json
{
  "query": "SELECT * FROM users WHERE id = $1",
  "params": [123]
}
```

**Response:**
```json
{
  "rows": [{"id": 123, "name": "John Doe"}],
  "rowCount": 1,
  "command": "SELECT",
  "fields": [{"name": "id"}, {"name": "name"}]
}
```

### GET /health

Check the health of the service.

**Response:**
```json
{
  "status": "ok"
}
```

## 📄 License

MIT

---

*Built with TypeScript, Express, and PostgreSQL*