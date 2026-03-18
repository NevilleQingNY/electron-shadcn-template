CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`x` real DEFAULT 50 NOT NULL,
	`y` real DEFAULT 50 NOT NULL,
	`width` integer,
	`height` integer,
	`z_index` integer DEFAULT 0 NOT NULL,
	`is_pinned` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`sort_order` text NOT NULL,
	`created_at` integer NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_items_is_deleted` ON `items` (`is_deleted`);