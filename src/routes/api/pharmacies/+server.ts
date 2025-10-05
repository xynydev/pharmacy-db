import { getDb } from '$lib/server/db';
import { pharmacy } from '$lib/server/db/schema';

export async function GET({ platform }) {
	const db = getDb(platform);
	const pharmacies = await db.select().from(pharmacy);
	return new Response(JSON.stringify(pharmacies));
}
