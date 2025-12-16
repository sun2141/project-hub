import { sql } from '@vercel/postgres';

// Test connection
export async function testConnection() {
  try {
    await sql`SELECT NOW()`;
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export { sql };
