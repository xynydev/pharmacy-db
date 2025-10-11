import { getDb } from '$lib/server/db';
import { generateCode } from '$lib/server/invite';

export async function POST({ platform, locals }) {
	const db = getDb(platform);

	if (locals.user.role === 'admin' || locals.user.role === 'superadmin') {
		const { code, expiresAt } = await generateCode(db);
		return new Response(JSON.stringify({ code, expiresAt }));
	} else {
		return new Response('Unauthorized', { status: 403 });
	}
}
