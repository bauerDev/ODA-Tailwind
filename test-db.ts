import dotenv from 'dotenv'; // carga las variables de entorno (incluye .env.local)
dotenv.config({ path: '.env.local' });
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PG_USER!,
  host: process.env.PG_HOST!,
  database: process.env.PG_DATABASE!,
  password: process.env.PG_PASSWORD!,
  port: Number(process.env.PG_PORT || 5432),
  ssl: {
    rejectUnauthorized: false,
  },
});

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('DB conectada:', res.rows[0]);
  } catch (err) {
    console.error('Error de conexión:', err);
  } finally {
    await pool.end();
  }
}

test();
