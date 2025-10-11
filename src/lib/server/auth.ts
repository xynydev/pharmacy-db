import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { passkey } from 'better-auth/plugins/passkey';
import { anonymous } from 'better-auth/plugins';
import { getDb } from './db';
import schema from './db/schema';

export function getAuth(platform: Readonly<App.Platform> | undefined) {
	const db = getDb(platform);
	return betterAuth({
		database: drizzleAdapter(db, {
			provider: 'sqlite',
			schema: schema
		}),
		emailAndPassword: {
			enabled: false
		},
		plugins: [
			passkey({
				rpName: 'Pharmacy Database'
			}),
			anonymous()
		],
		basePath: '/api/auth'
	});
}
