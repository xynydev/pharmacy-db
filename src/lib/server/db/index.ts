import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

import { DB } from '$env/static/private';

export const db = drizzle(DB, { schema });
