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
- **Drizzle ORM Compatible** - fully supports Drizzle's pg-proxy adapter

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
git clone https://github.com/novincode/postgres-edge-proxy.git
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
API_KEY="your-secure-api-key"          # This is the API key your clients will use
DATABASE_URL="postgres://username:password@hostname:port/database"

# Optional
PORT=3001
NODE_ENV=production
LOG_LEVEL=info
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=30000
```

## 🌐 Usage Examples

### Integration with Drizzle ORM

This proxy is designed to be compatible with Drizzle ORM's pg-proxy adapter. Here's how to connect:

```typescript
// db.ts
import { drizzle } from 'drizzle-orm/pg-proxy';
import * as schema from './schema';

// Environment variables
const DB_PROXY_URL = process.env.DB_PROXY_URL || 'http://localhost:3001/query';
const DB_API_KEY = process.env.DB_API_KEY || ''; // Must match API_KEY in edge-proxy

export const db = drizzle(
  async (sql, params, method) => {
    try {
      console.log(`[DB] Executing ${method}: ${sql.substring(0, 100)}...`);
      
      if (!DB_API_KEY) {
        throw new Error('DB_API_KEY is required');
      }
      if (!DB_PROXY_URL) {
        throw new Error('DB_PROXY_URL is required');
      }

      // Send request to the proxy
      const response = await fetch(DB_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': DB_API_KEY
        },
        body: JSON.stringify({ sql, params, method })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Database error (${response.status}): ${errorText}`);
      }

      // Parse the JSON response
      const data = await response.json();
      return { rows: data };
    } catch (e: any) {
      console.error('Error from pg proxy server: ', e.message);
      return { rows: [] };
    }
  },
  { schema } // Pass your schema here
);

// Usage in your app
const users = await db.select().from(schema.users);
```

### Alternative Drizzle ORM Integration (Simplified)

You can also use the built-in client from Drizzle:

```typescript
// db.ts
import { drizzle } from 'drizzle-orm/pg-proxy';
import * as schema from './schema';

// Create connection to your proxy
const client = {
  url: "https://your-proxy-url/query",
  headers: {
    "X-API-Key": process.env.DB_API_KEY // Must match API_KEY in edge-proxy
  },
  // Optional: default fetch options
  fetch: {
    cache: "no-store",
  }
};

// Create Drizzle ORM instance
export const db = drizzle(client, { schema });

// Usage in your app
const users = await db.select().from(schema.users);
```

## ⚠️ Important Notes

- The `DB_API_KEY` in your client application must match the `API_KEY` configured in your edge-proxy server
- All requests must use the `/query` endpoint format for Drizzle compatibility
- Make sure your proxy is deployed in a secure environment, ideally close to your database

## 🚢 Deployment Strategies

For optimal performance, deploy the proxy close to your database:

- **Self-hosted**: Run on the same network as your PostgreSQL server
- **Cloud VMs**: Use a small VM in the same region as your database
- **Kubernetes**: Deploy as a service in your cluster
- **PaaS**: Use services like Railway, Render, or Fly.io

## 📝 API Reference

### POST /query

Execute a SQL query against the database using the Drizzle-compatible format.

**Request Headers:**
- `Content-Type: application/json`
- `X-API-Key: <your-api-key>`

**Request Body:**
```json
{
  "sql": "SELECT * FROM users WHERE id = $1",
  "params": [123],
  "method": "all"
}
```

**Response:**
```json
[
  {"id": 123, "name": "John Doe"}
]
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