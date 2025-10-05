import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDb(platform: Readonly<App.Platform> | undefined) {
	return drizzle(platform?.env.DB, { schema });
}
