# Postgres Edge Proxy

![Postgres Edge Proxy](https://img.shields.io/badge/Postgres-Edge%20Proxy-blue?style=for-the-badge&logo=postgresql)

A secure API proxy for PostgreSQL databases that allows controlled access to your Postgres database through a simple, authenticated REST API - similar to [Neon's serverless driver](https://neon.tech/docs/serverless/serverless-driver) but with **your own secure endpoint**.

## 🌟 Features

- **Secure access** with API key authentication
- **HTTP API** for database queries - perfect for serverless and edge environments
- **Compatible** with PostgreSQL and Neon databases
- **Type-safe** built with TypeScript
- **Drop-in replacement** for @neondatabase/serverless

## 🚀 Why Use Postgres Edge Proxy?

- **Security**: Control database access through a protected API gateway
- **Edge Compatibility**: Connect to PostgreSQL from edge functions or serverless environments
- **Flexibility**: Run the proxy close to your database for optimal performance
- **Authorization**: Add API key authentication without modifying your database

## 📋 Prerequisites

- Node.js 18+
- A PostgreSQL database (works great with [Neon](https://neon.tech))

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/postgres-edge-proxy.git
cd postgres-edge-proxy

# Install dependencies
npm install

# Create your .env.local file (see Configuration section)
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

## 🔐 Security

- **Always** use a strong, randomized API key
- Place the proxy behind a secure gateway or VPN in production
- Consider running the proxy close to your database for reduced latency

## 🌐 Client Usage

### Option 1: Direct Fetch

```typescript
// Simple client example
async function executeQuery(sql, params = []) {
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
const users = await executeQuery('SELECT * FROM users WHERE id = $1', [123]);
console.log(users.rows);
```

### Option 2: Neon Serverless Drop-in Replacement

Create a wrapper for the Neon serverless driver that uses your proxy:

```typescript
// db-client.ts
import { neon as originalNeon, NeonQueryFunction } from '@neondatabase/serverless';

// Configuration
const PROXY_URL = process.env.DB_PROXY_URL || 'http://localhost:3001/db-proxy';
const API_KEY = process.env.DB_API_KEY || '';

export function neon(connectionString: string) {
  // Keep the original client for fallback
  const originalClient = originalNeon(connectionString);
  
  // Create a proxy client
  const proxyQueryFn = async (sql: string, params: any[] = []) => {
    try {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': API_KEY 
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
    } catch (error) {
      console.error('Database proxy error:', error);
      // Fall back to original client in development
      if (process.env.NODE_ENV === 'development') {
        return originalClient(sql, params);
      }
      throw error;
    }
  };
  
  // Create the final client with transaction support
  const proxyClient = proxyQueryFn as unknown as NeonQueryFunction<false, false>;
  proxyClient.transaction = originalClient.transaction;
  
  // Copy any other properties
  const originalAny = originalClient as any;
  if (originalAny.options !== undefined) {
    (proxyClient as any).options = originalAny.options;
  }
  
  return proxyClient;
}
```

### Using with Drizzle ORM

```typescript
// db.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from './db-client';
import * as schema from './schema';

// Use your proxy client with Drizzle
const sql = neon(process.env.DATABASE_URL || '');
export const db = drizzle(sql, { schema });

// Usage in your application
import { db } from './db';
import { users } from './schema';

// Now use it like normal Drizzle
const allUsers = await db.select().from(users);
```

## 🚢 Deployment

For optimal performance, deploy the proxy close to your database:

- **AWS**: Deploy in the same region as your RDS or Aurora instance
- **Vercel/Netlify**: Use a VPC connector to securely access your database
- **Self-hosted**: Run in the same data center as your database

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
  "fields": [{"name": "id", "dataTypeID": 23}, {"name": "name", "dataTypeID": 25}]
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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

*Built with ❤️ using TypeScript, Express, and PostgreSQL*