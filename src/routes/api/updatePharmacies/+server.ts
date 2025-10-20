import { getDb } from '$lib/server/db';
import { pharmacy } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

// const overpassHost = 'https://overpass-api.de/api/interpreter';
const overpassHost = 'https://overpass.private.coffee/api/interpreter';

const overpassQuery = (area: string) =>
	encodeURIComponent(`[out:json][timeout:25];
area(${area})->.searchArea;
nwr
  ["amenity"="pharmacy"]
  (area.searchArea);
out geom;`);

const areas: Array<{ name: 'Finland'; code: string }> = [{ name: 'Finland', code: '3600054224' }];

export async function POST({ platform, locals }) {
	if (locals.user.role !== 'superadmin') {
		return new Response('Unauthorized', { status: 403 });
	}

	const db = getDb(platform);

	for (const area of areas) {
		console.log(`Fetching pharmacies in ${area.name}...`);

		const res = await fetch(`${overpassHost}?data=${overpassQuery(area.code)}`);
		if (!res.ok) throw new Error('Failed to fetch pharmacies');

		const data: {
			elements: [
				{
					id: number;
					type: string;
					lat?: string;
					lon?: string;
					bounds?: {
						minlat: string;
						minlon: string;
						maxlat: string;
						maxlon: string;
					};
					tags: {
						'addr:city'?: string;
						'addr:housenumber'?: string;
						'addr:postcode'?: string;
						'addr:street'?: string;
						name: string;
						brand?: string;
						description?: string;
						phone?: string;
						email?: string;
						opening_hours?: string;
						website?: string;
						url?: string;
					};
				}
			];
		} = await res.json();

		console.log(`Data fetched successfully`);

		console.log('Transforming data');

		const pharmacies = data.elements.flatMap((pharmacyData) => {
			const { tags } = pharmacyData;
			const { lat, lon } = (() => {
				if (pharmacyData.lat !== undefined && pharmacyData.lon !== undefined) {
					return { lat: pharmacyData.lat, lon: pharmacyData.lon };
				} else if (pharmacyData.bounds !== undefined) {
					return { lat: pharmacyData.bounds.minlat, lon: pharmacyData.bounds.minlon };
				} else {
					return { lat: null, lon: null };
				}
			})();
			if (lat === null || lon === null) {
				return [];
			}
			if (tags.name === undefined) {
				return [];
			}
			return [
				{
					id: pharmacyData.id,
					lat: lat,
					lon: lon,
					country: area.name,
					name: tags.name,
					brand: tags.brand,
					description: tags.description,
					phone: tags.phone,
					email: tags.email,
					opening_hours: tags.opening_hours,
					address: `${tags['addr:street']} ${tags['addr:housenumber']}, ${tags['addr:postcode']} ${tags['addr:city']}`,
					url: tags.website || tags.url || undefined
				}
			];
		});

		console.log(`Gathered ${pharmacies.length} pharmacies`);

		console.log('Inserting pharmacies to db');

		try {
			const chunkSize = 8;
			for (let i = 0; i < pharmacies.length; i += chunkSize) {
				await db
					.insert(pharmacy)
					.values(pharmacies.slice(i, i + chunkSize))
					.onConflictDoUpdate({
						target: pharmacy.id,
						// replace all keys in the row
						set: Object.assign(
							{},
							...Object.keys(pharmacies[0]).map((k) => ({
								[k]: sql`excluded.${sql.identifier(k)}`
							}))
						)
					});
			}
		} catch (error) {
			console.error('Error inserting pharmacies to db: ' + error);
			return new Response('Error', { status: 500 });
		}
	}

	return new Response('Success');
}
