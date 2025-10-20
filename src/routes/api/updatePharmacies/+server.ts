import { getDb } from '$lib/server/db';
import { pharmacy } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

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

		for (const pharmacyData of data.elements) {
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
				continue;
			}

			const pharmacyRow = {
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
				url: tags.website || tags.url || null
			};
			if (pharmacyRow.name === undefined) {
				continue;
			}
			console.log(`Found pharmacy ${pharmacyRow.name} with id ${pharmacyRow.id}`);

			const existingPharmacy = await db.query.pharmacy.findFirst({
				where: eq(pharmacy.id, pharmacyRow.id)
			});
			if (existingPharmacy !== undefined) {
				console.log(`Found existing pharmacy ${existingPharmacy.name} with id ${pharmacyRow.id}`);
				try {
					await db.update(pharmacy).set(pharmacyRow).where(eq(pharmacy.id, pharmacyRow.id));
					console.log('Data updated successfully');
				} catch (error) {
					console.error(`Failed to update pharmacy with id ${pharmacyRow.id}:`, error);
					console.log(pharmacyData);
				}
			} else {
				console.log(`Adding new pharmacy ${pharmacyRow.name} with id ${pharmacyRow.id}`);
				try {
					await db.insert(pharmacy).values(pharmacyRow);
					console.log('Row added successfully');
				} catch (error) {
					console.error(`Failed to insert pharmacy with id ${pharmacyRow.id}:`, error);
					console.log(pharmacyData);
				}
			}
		}
	}

	return new Response('Success');
}
