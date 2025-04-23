CREATE TABLE `profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inventory` text DEFAULT '[]' NOT NULL,
	`mining` integer DEFAULT 0 NOT NULL,
	`smithery` integer DEFAULT 0 NOT NULL,
	`lumberjacking` integer DEFAULT 0 NOT NULL,
	`carpentry` integer DEFAULT 0 NOT NULL,
	`crafting` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_profile_relation` (
	`user_id` integer,
	`profile_id` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx` ON `user_profile_relation` (`user_id`,`profile_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `google_idx` ON `users` (`google_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `email__idx` ON `users` (`email`);