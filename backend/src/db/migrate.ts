import { getDb, closeDb } from './index.js';
import { up as initial } from './migrations/001_initial.js';

const migrations = [
  { name: '001_initial', up: initial },
];

async function migrate(): Promise<void> {
  const db = getDb();

  // Ensure migrations table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const applied = db
    .prepare('SELECT name FROM migrations')
    .all()
    .map((row: any) => row.name);

  for (const migration of migrations) {
    if (!applied.includes(migration.name)) {
      console.log(`Applying migration: ${migration.name}`);
      migration.up(db);
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration.name);
      console.log(`Migration ${migration.name} applied successfully`);
    } else {
      console.log(`Migration ${migration.name} already applied`);
    }
  }

  closeDb();
  console.log('All migrations complete');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
