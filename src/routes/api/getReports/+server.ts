import { getDb } from '$lib/server/db';
import { report } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET({ platform, url }) {
	const pharmacyId = url.searchParams.get('pharmacyId');
	if (!pharmacyId)
		return new Response(JSON.stringify({ error: 'Missing pharmacyId' }), { status: 400 });
	const db = getDb(platform);
	const reportsData = await db.select().from(report).where(eq(report.pharmacyId, pharmacyId));
	const sortedReports = reportsData.sort((a, b) => b.time.getTime() - a.time.getTime());
	return new Response(JSON.stringify(sortedReports));
}
