// Simple test runner to insert a department using the project's db abstraction
import fs from 'fs';

// Load .env into process.env if present
try {
  const env = fs.readFileSync('.env', 'utf8');
  env.split(/\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/i);
    if (m) {
      const key = m[1];
      let val = m[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  });
} catch (e) {
  // ignore
}

async function run() {
  try {
    const { query } = await import('../src/lib/db.js');
    const slug = 'test-dept-' + Date.now();
    const rows = await query(
      'INSERT INTO departments (slug, name, code, description) VALUES ($1, $2, $3, $4) RETURNING id, slug, name',
      [slug, 'Test Dept', 'TD' + Math.floor(Math.random() * 1000), 'Inserted by try_insert.js']
    );
    console.log('Inserted:', rows[0]);
  } catch (err) {
    console.error('Error running insert:');
    console.error(err);
    if (err && err.message) console.error('message:', err.message);
    if (err && err.details) console.error('details:', err.details);
    process.exit(1);
  }
}

run();
