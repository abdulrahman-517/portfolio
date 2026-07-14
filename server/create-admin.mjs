import { randomBytes, scryptSync } from 'node:crypto';
import pg from 'pg';

const email = process.env.STUDIO_ADMIN_EMAIL || 'abdulrahmanalmushajari@gmail.com';
const password = process.env.STUDIO_ADMIN_PASSWORD;
if (!password || password.length < 16) throw new Error('STUDIO_ADMIN_PASSWORD must be at least 16 characters.');
const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, salt, 64).toString('hex');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
await pool.query('insert into studio_users (email,password_hash) values ($1,$2) on conflict (email) do update set password_hash = excluded.password_hash, updated_at = now()', [email.toLowerCase(), `${salt}:${hash}`]);
await pool.end();
