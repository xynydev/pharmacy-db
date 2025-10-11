import { getDb } from '$lib/server/db';
import { inviteCode } from '$lib/server/db/schema';

export async function POST({ platform, locals }) {
	const db = getDb(platform);

	if (locals.user.role === 'admin' || locals.user.role === 'superadmin') {
		const code = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

		await db.insert(inviteCode).values({
			code,
			expiresAt
		});

		return new Response(JSON.stringify({ code, expiresAt }));
	} else {
		return new Response('Unauthorized', { status: 403 });
	}
}
