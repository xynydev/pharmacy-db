import { getDb } from '$lib/server/db';
import { report as reportTable } from '$lib/server/db/schema';

export async function POST({ request, platform, locals }) {
	if (!locals.session) {
		return new Response('Unauthorized', { status: 403 });
	}

	const { pharmacyId, report, extraInfo, date } = await request.json();
	if (!pharmacyId || !report) {
		return new Response('Missing required fields', { status: 400 });
	}
	if (!['++', '+', '-'].includes(report)) {
		return new Response('Invalid report type', { status: 400 });
	}

	const db = getDb(platform);

	const reportData = {
		pharmacyId: pharmacyId,
		userId: locals.session.userId,
		time: locals.user.role === 'superadmin' && date ? new Date(date) : new Date(),
		report: report,
		extraInfo: extraInfo ?? undefined
	};

	try {
		await db.insert(reportTable).values(reportData);
	} catch (error) {
		return new Response('Error inserting report: ' + error.message, { status: 500 });
	}

	return new Response('Success');
}
