import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id")
        .primaryKey()
        .defaultRandom()
        .notNull(),

    createdAt: timestamp("created_at")
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
        
    name: text("name")
        .notNull()
        .unique(),
});

export const feeds = pgTable("feeds", {
    id: uuid("id")
        .primaryKey()
        .defaultRandom()
        .notNull(),

    createdAt: timestamp("created_at")
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),

    lastFetchedAt: timestamp("last_fetched_at"),

    name: text("name")
        .notNull(),

    url: text("url")
        .notNull()
        .unique(),

    userId: uuid()
        .references(() => users.id, {onDelete: "cascade"})
        .notNull(),
});

export const feedFollows = pgTable("feed_follows", {
    id: uuid("id")
        .primaryKey()
        .defaultRandom()
        .notNull(),

    createdAt: timestamp("created_at")
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),

    userId: uuid()
        .references(() => users.id, {onDelete: "cascade"})
        .notNull(),

    feedId: uuid()
        .references(() => feeds.id, {onDelete: "cascade"})
        .notNull(),
}, (table) => [
    unique().on(table.userId, table.feedId)
]);

export const posts = pgTable("posts", {
    id: uuid("id")
        .primaryKey()
        .defaultRandom()
        .notNull(),
    
    createdAt: timestamp("created_at")
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
        
    title: text("title")
        .notNull(),

    url: text("url")
        .notNull()
        .unique(),

    description: text("description"),

    publishedAt: timestamp("published_at")
        .notNull(),

    feedId: uuid("feed_id")
        .references(() => feeds.id, {onDelete: "cascade"})
        .notNull(),
})

export type User = typeof users.$inferSelect;
export type Feed = typeof feeds.$inferSelect;
export type FeedFollow = typeof feedFollows.$inferSelect;
export type Post = typeof posts.$inferSelect;