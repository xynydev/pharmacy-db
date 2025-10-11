import { getDb } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ platform, locals, request }) {
	const db = getDb(platform);

	if (locals.user.role === 'superadmin') {
		const { userID, role } = await request.json();
		if (role === 'user' || role === 'admin' || role === 'superadmin') {
			const userCheck = await db
				.select({ id: user.id, role: user.role })
				.from(user)
				.where(eq(user.id, userID));
			if (userCheck.length === 0) {
				return new Response(`No such user: "${userID}"`, { status: 400 });
			}
			try {
				await db.update(user).set({ role: role }).where(eq(user.id, userID));
				return new Response(
					`User role updated successfully (changed ${userID} from ${userCheck[0].role} to ${role})`,
					{ status: 200 }
				);
			} catch (error) {
				return new Response('Failed to update user role: ' + error, { status: 500 });
			}
		} else {
			return new Response(`No such role: "${role}"`, { status: 400 });
		}
	} else {
		return new Response('Unauthorized', { status: 403 });
	}
}
