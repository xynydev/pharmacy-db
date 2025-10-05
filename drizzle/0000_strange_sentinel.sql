CREATE TABLE `pharmacy` (
	`id` integer PRIMARY KEY NOT NULL,
	`lat` numeric NOT NULL,
	`lon` numeric NOT NULL,
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
