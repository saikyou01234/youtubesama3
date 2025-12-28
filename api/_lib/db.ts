import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../../db/schema';

// Serverless環境向けのPostgreSQL接続
const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  ssl: 'require',
  prepare: false, // Serverless環境では必須
});

export const db = drizzle(client, { schema });
