import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

// Initialize tables
export async function initDB() {
  // Migrate: drop old foreign key and convert user_id to TEXT if needed
  const colCheck = await pool.query(`
    SELECT data_type FROM information_schema.columns
    WHERE table_name = 'resumes' AND column_name = 'user_id'
  `);

  if (colCheck.rows.length > 0 && colCheck.rows[0].data_type === 'integer') {
    await pool.query(`ALTER TABLE resumes DROP CONSTRAINT IF EXISTS resumes_user_id_fkey`);
    await pool.query(`ALTER TABLE resumes ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT`);
  }

  // Drop old users table if it exists
  await pool.query(`DROP TABLE IF EXISTS users`);

  // Create resumes table if it doesn't exist (for fresh installs)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS resumes (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      data JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export default pool;
