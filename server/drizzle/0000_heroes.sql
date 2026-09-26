CREATE TABLE "heroes" (
	"id" integer PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"full_name" text,
	"publisher" text,
	"alignment" text,
	"gender" text,
	"race" text,
	"height_cm" integer,
	"weight_kg" integer,
	"occupation" text,
	"base" text,
	"place_of_birth" text,
	"first_appearance" text,
	"intelligence" smallint NOT NULL,
	"strength" smallint NOT NULL,
	"speed" smallint NOT NULL,
	"durability" smallint NOT NULL,
	"power" smallint NOT NULL,
	"combat" smallint NOT NULL,
	"image_sm" text NOT NULL,
	"image_md" text NOT NULL,
	"image_lg" text NOT NULL,
	"daily_rate" smallint NOT NULL,
	"services" text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "heroes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "heroes_name_index" ON "heroes" USING btree ("name");--> statement-breakpoint
CREATE INDEX "heroes_daily_rate_index" ON "heroes" USING btree ("daily_rate");--> statement-breakpoint
CREATE INDEX "heroes_services_index" ON "heroes" USING gin ("services");