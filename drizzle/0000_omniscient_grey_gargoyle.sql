CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`accessTokenExpiresAt` integer NOT NULL,
	`refreshTokenExpiresAt` integer NOT NULL,
	`scope` text,
	`id_token` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invite_code` (
	`id` integer PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`used` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `passkey` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`public_key` text NOT NULL,
	`user_id` text,
	`credential_id` text NOT NULL,
	`counter` integer NOT NULL,
	`device_type` text NOT NULL,
	`backedUp` integer NOT NULL,
	`transports` text NOT NULL,
	`createdAt` integer NOT NULL,
	`aaguid` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pharmacy` (
	`id` integer PRIMARY KEY NOT NULL,
	`lat` text NOT NULL,
	`lon` text NOT NULL,
	`country` text NOT NULL,
	`name` text NOT NULL,
	`brand` text,
	`description` text,
	`address` text,
	`email` text,
	`phone` text,
	`opening_hours` text,
	`url` text
);
--> statement-breakpoint
CREATE TABLE `report` (
	`id` integer PRIMARY KEY NOT NULL,
	`pharmacy_id` integer,
	`report` text NOT NULL,
	`extra_info` text,
	FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacy`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`token` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer NOT NULL,
	`image` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`isAnonymous` integer,
	`role` text DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
