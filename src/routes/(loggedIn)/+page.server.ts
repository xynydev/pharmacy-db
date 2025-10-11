import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { pharmacy } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);

	const pharmacies = await db
		.select({
			id: pharmacy.id,
			name: pharmacy.name,
			lat: pharmacy.lat,
			lon: pharmacy.lon,
			address: pharmacy.address
		})
		.from(pharmacy);

	return { pharmacies };
};
