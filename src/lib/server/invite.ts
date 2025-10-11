import { inviteCode } from './db/schema';
import * as schema from './db/schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1/driver';
import { eq } from 'drizzle-orm';

export async function useInviteCode(db: DrizzleD1Database<typeof schema>, code: string) {
	const codeRow = await db.select().from(inviteCode).where(eq(inviteCode.code, code));
	if (codeRow.length === 0) {
		return new Response('Invalid code', { status: 404 });
	} else {
		if (codeRow[0].used) {
			return new Response('Code already used', { status: 401 });
		}
		if (codeRow[0].expiresAt < new Date()) {
			return new Response('Code expired', { status: 401 });
		}
		await db.update(inviteCode).set({ used: true }).where(eq(inviteCode.id, codeRow[0].id));
		return new Response(JSON.stringify(codeRow));
	}
}

export async function generateCode(db: DrizzleD1Database<typeof schema>) {
	const code = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

	await db.insert(inviteCode).values({
		code,
		expiresAt
	});

	return { code, expiresAt };
}
