import { pgTable, text, timestamp, varchar, jsonb, uuid } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  variant: varchar("variant", { length: 20 }).notNull(),
  pages: varchar("pages", { length: 10 }).notNull(),
  photos: jsonb("photos").$type<string[]>().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  stripeSessionId: text("stripe_session_id").notNull(),
  status: varchar("status", { length: 30 }).notNull(), // created/paid/failed
  amount: varchar("amount", { length: 20 }).notNull(),
  projectId: uuid("project_id"),
  customerEmail: varchar("customer_email", { length: 200 }),
  shippingName: varchar("shipping_name", { length: 200 }),
  shippingAddress: jsonb("shipping_address").$type<any>(),
});