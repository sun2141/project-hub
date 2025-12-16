const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: 'pkj3yh.h.filess.io',
    port: 61002,
    user: 'project_hub_childrenhe',
    password: 'd02e4a9853561d0a42c631fb1acf08f7b7a2a604',
    database: 'project_hub_childrenhe',
    multipleStatements: true,
  });

  try {
    console.log('✅ Connected to Filess.io MySQL');

    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📝 Executing schema...');
    await connection.query(schema);

    console.log('✅ Schema executed successfully!');
    console.log('✅ Database initialized with tables and initial data');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

initDatabase();
