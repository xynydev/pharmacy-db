import { sqliteTable, integer, numeric, text } from 'drizzle-orm/sqlite-core';

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
