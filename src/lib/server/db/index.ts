import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

export interface Env {
	DB: D1Database;
}

export const db = drizzle(env.DB, { schema });
