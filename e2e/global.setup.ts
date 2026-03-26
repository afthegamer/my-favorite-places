import { Client } from 'pg';

async function globalSetup() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'my_favorite_places',
  });

  try {
    await client.connect();
    await client.query('TRUNCATE TABLE address, "user" CASCADE');
    console.log('DB tables truncated');
  } catch {
  } finally {
    await client.end();
  }
}

export default globalSetup;
