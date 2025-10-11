import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const pharmacy = sqliteTable('pharmacy', {
	id: integer('id').primaryKey(),
	lat: text('lat').notNull(),
	lon: text('lon').notNull(),
	country: text({ enum: ['Finland'] }).notNull(),
	name: text('name').notNull(),
	brand: text('brand'),
	description: text('description'),
	address: text('address'),
	email: text('email'),
	phone: text('phone'),
	opening_hours: text('opening_hours'),
	url: text('url')
});

export const report = sqliteTable('report', {
	id: integer('id').primaryKey(),
	pharmacyId: integer('pharmacy_id').references(() => pharmacy.id),
	report: text({ enum: ['++', '+', '-'] }).notNull(),
	extraInfo: text('extra_info')
});

export const inviteCode = sqliteTable('invite_code', {
	id: integer('id').primaryKey(),
	code: text('code').notNull(),
	expiresAt: integer({ mode: 'timestamp' }).notNull(),
	used: integer({ mode: 'boolean' }).notNull().default(false)
});

// ---
// https://www.better-auth.com/docs/concepts/database

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull(),
	emailVerified: integer({ mode: 'boolean' }).notNull(),
	image: text('image'),
	createdAt: integer({ mode: 'timestamp' }).notNull(),
	updatedAt: integer({ mode: 'timestamp' }).notNull(),
	isAnonymous: integer({ mode: 'boolean' }),
	role: text({ enum: ['user', 'admin', 'superadmin'] })
		.notNull()
		.default('user')
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id),
	token: text('token').notNull(),
	expiresAt: integer({ mode: 'timestamp' }).notNull(),
	createdAt: integer({ mode: 'timestamp' }).notNull(),
	updatedAt: integer({ mode: 'timestamp' }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent')
});

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	accessTokenExpiresAt: integer({ mode: 'timestamp' }).notNull(),
	refreshTokenExpiresAt: integer({ mode: 'timestamp' }).notNull(),
	scope: text('scope'),
	idToken: text('id_token'),
	password: text('password'),
	createdAt: integer({ mode: 'timestamp' }).notNull(),
	updatedAt: integer({ mode: 'timestamp' }).notNull()
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer({ mode: 'timestamp' }).notNull(),
	createdAt: integer({ mode: 'timestamp' }).notNull(),
	updatedAt: integer({ mode: 'timestamp' }).notNull()
});

// https://www.better-auth.com/docs/plugins/passkey#schema

export const passkey = sqliteTable('passkey', {
	id: text('id').primaryKey(),
	name: text('name'),
	publicKey: text('public_key').notNull(),
	userId: text('user_id').references(() => user.id),
	credentialID: text('credential_id').notNull(),
	counter: integer('counter').notNull(),
	deviceType: text('device_type').notNull(),
	backedUp: integer({ mode: 'boolean' }).notNull(),
	transports: text('transports').notNull(),
	createdAt: integer({ mode: 'timestamp' }).notNull(),
	aaguid: text('aaguid')
});
