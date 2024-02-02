CREATE TABLE `birthdayNotifQueue` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`firstname` text NOT NULL,
	`lastname` text,
	`dob` text NOT NULL,
	`pob` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);