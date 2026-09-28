import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  data: text("data").notNull(),
  active: integer("active").notNull().default(1),
});
export const orders = sqliteTable(
  "orders",
  {
    id: text("id").primaryKey(),
    customer: text("customer").notNull(),
    provider: text("provider").notNull(),
    status: text("status").notNull(),
    data: text("data").notNull(),
    version: integer("version").notNull().default(0),
    created: text("created").notNull(),
  },
  (t) => [
    index("idx_orders_customer").on(t.customer),
    index("idx_orders_provider").on(t.provider),
  ],
);
export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").notNull(),
    author: text("author").notNull(),
    body: text("body").notNull(),
    created: text("created").notNull(),
  },
  (t) => [index("idx_messages_order").on(t.orderId)],
);
export const reviews = sqliteTable(
  "reviews",
  {
    orderId: text("order_id").primaryKey(),
    provider: text("provider").notNull(),
    author: text("author").notNull(),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
  },
  (t) => [index("idx_reviews_provider").on(t.provider)],
);
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
export const interests = sqliteTable("interests", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  data: text("data").notNull(),
});
export const reports = sqliteTable("reports", {
  id: text("id").primaryKey(),
  author: text("author").notNull(),
  kind: text("kind").notNull(),
  data: text("data").notNull(),
  status: text("status").notNull().default("aberto"),
});
export const files = sqliteTable("files", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull(),
  kind: text("kind").notNull(),
  mime: text("mime").notNull(),
});
