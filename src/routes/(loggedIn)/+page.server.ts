import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { pharmacy, report } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ platform }) => {
	const db = getDb(platform);

	const pharmacies = await db.select().from(pharmacy);

	const reports = await db.select().from(report);

	const pharmaciesWithReports = pharmacies.map((pharmacy) => {
		const pharmacyReports = reports
			.filter((r) => r.pharmacyId === pharmacy.id)
			.map((r) => r.report);

		const excellentReports = pharmacyReports.filter((report) => report === '++');
		const goodReports = pharmacyReports.filter((report) => report === '+');
		const badReports = pharmacyReports.filter((report) => report === '-');

		return {
			...pharmacy,
			reports: {
				excellent: excellentReports.length,
				good: goodReports.length,
				bad: badReports.length
			}
		};
	});

	return { pharmacies: pharmaciesWithReports };
};
