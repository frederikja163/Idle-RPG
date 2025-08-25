CREATE TABLE `items` (
	`profile_id` text NOT NULL,
	`id` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`index` integer NOT NULL,
	PRIMARY KEY(`profile_id`, `id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`first_login` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`last_login` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`activity_id` text DEFAULT 'None' NOT NULL,
	`activity_start` integer DEFAULT NULL,
	`settings` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `name_idx` ON `profiles` (`name`);--> statement-breakpoint
CREATE TABLE `skills` (
	`profile_id` text NOT NULL,
	`id` text NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`level` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`profile_id`, `id`),
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_profile_relation` (
	`user_id` text,
	`profile_id` text,
	PRIMARY KEY(`user_id`, `profile_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`google_id` text NOT NULL,
	`email` text NOT NULL,
	`profile_picture` text NOT NULL,
	`first_login` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`last_login` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`settings` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_google_id_unique` ON `users` (`google_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `google_idx` ON `users` (`google_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `email__idx` ON `users` (`email`);