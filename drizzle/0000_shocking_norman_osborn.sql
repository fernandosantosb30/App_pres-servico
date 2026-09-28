CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`kind` text NOT NULL,
	`mime` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `interests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`author` text NOT NULL,
	`body` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_messages_order` ON `messages` (`order_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer` text NOT NULL,
	`provider` text NOT NULL,
	`status` text NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_orders_customer` ON `orders` (`customer`);--> statement-breakpoint
CREATE INDEX `idx_orders_provider` ON `orders` (`provider`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`data` text NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`author` text NOT NULL,
	`kind` text NOT NULL,
	`data` text NOT NULL,
	`status` text DEFAULT 'aberto' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`order_id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`author` text NOT NULL,
	`rating` integer NOT NULL,
	`body` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_reviews_provider` ON `reviews` (`provider`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
