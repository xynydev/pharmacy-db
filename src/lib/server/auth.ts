import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { passkey } from 'better-auth/plugins/passkey';
import { anonymous } from 'better-auth/plugins';
import { getDb } from './db';
import * as schema from './db/schema';
import { createAuthMiddleware, APIError } from 'better-auth/api';
import { useInviteCode } from './invite';

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
		basePath: '/api/auth',
		user: {
			additionalFields: {
				role: {
					type: 'string',
					required: false,
					defaultValue: 'user',
					input: false
				}
			}
		},
		hooks: {
			before: createAuthMiddleware(async (ctx) => {
				if (ctx.path === '/sign-in/anonymous') {
					const code = JSON.parse(ctx.body).inviteCode;
					const res = await useInviteCode(db, code);
					if (res.ok) {
						const inviteCode = await res.json();
						console.log(inviteCode);
					} else {
						const error = await res.text();
						console.log(res);
						throw new APIError('UNAUTHORIZED', {
							message: 'Error validating code: ' + error
						});
					}
				}
			})
		}
	});
}
