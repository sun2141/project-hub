import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function initDatabase() {
  try {
    console.log('📦 Starting database initialization...');

    // Read schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await sql.query(statement);
        console.log('✅ Executed statement successfully');
      } catch (error: any) {
        // Ignore "already exists" and "does not exist" errors during INSERT
        const ignorableErrors = [
          'already exists',
          'duplicate key',
          'does not exist'
        ];
        const shouldIgnore = ignorableErrors.some(msg =>
          error.message.toLowerCase().includes(msg.toLowerCase())
        );

        if (!shouldIgnore) {
          console.error('❌ Error executing statement:', error.message);
          throw error;
        } else {
          console.log('⚠️ Skipped statement (already exists or not needed)');
        }
      }
    }

    console.log('✅ Database initialized successfully!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initDatabase();
