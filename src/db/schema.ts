import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp, real } from "drizzle-orm/pg-core";

// Define the 'users' table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID
  email: text("email").notNull(),
  displayName: text("display_name"),
  role: text("role").default("Econometric Research Fellow"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define 'fare_observations' table for high-frequency portal scrape data
export const fareObservations = pgTable("fare_observations", {
  id: serial("id").primaryKey(),
  route: text("route").notNull(),
  flightNo: text("flight_no").notNull(),
  airline: text("airline").notNull(),
  fare: integer("fare").notNull(),
  advanceDays: integer("advance_days").notNull(),
  dynamicMultiplier: real("dynamic_multiplier").notNull(),
  taxAmount: integer("tax_amount").default(0),
  source: text("source").notNull(),
  observedAt: timestamp("observed_at").defaultNow(),
});

// Define 'user_saved_routes' table
export const userSavedRoutes = pgTable("user_saved_routes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  routeId: text("route_id").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  savedRoutes: many(userSavedRoutes),
}));

export const userSavedRoutesRelations = relations(userSavedRoutes, ({ one }) => ({
  user: one(users, {
    fields: [userSavedRoutes.userId],
    references: [users.id],
  }),
}));
