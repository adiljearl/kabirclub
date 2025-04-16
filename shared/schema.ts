import { pgTable, text, serial, integer, jsonb, boolean, timestamp, doublePrecision, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { createId } from '@paralleldrive/cuid2';
import { features } from "process";

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  // imageUrl: text("image_url").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  // imageUrl: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  item_id: text("item_id"),
  featured: boolean("featured").default(false),
  trending: boolean("trending").default(false),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url").notNull(),
  categoryId: integer("category_id").notNull(),
  sizes: jsonb("sizes").default([]),
  // colors: jsonb("colors").default([]),
  stockQuantity: integer("stock_quantity").default(0),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  item_id: true,
  imageUrl: true,
  // categoryId: true,
  sizes: true,
  stockQuantity: true,
  featured: true,
  trending: true,
})
.extend({
  price: z.preprocess(
    (val) => (typeof val === 'string' ? Number(val) : val),
    z.number()
  ),
  // categoryId: z.preprocess(
  //   (val) => (typeof val === 'string' ? Number(val) : val),
  //   z.number()
  // ),
  stockQuantity: z.preprocess(
    (val) => (typeof val === 'string' ? Number(val) : val),
    z.number()
  ),
  featured: z.preprocess(
    (val) => (typeof val === 'string' ? val === 'true' : val),
    z.boolean()
  ),
  trending: z.preprocess(
    (val) => (typeof val === 'string' ? val === 'true' : val),
    z.boolean()
  ),
})
.passthrough();

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Cart Items
export const cart_items = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id"),
  quantity: integer("quantity").notNull().default(1),
  user_id: integer("user_id").notNull(),
  size: text("size").notNull(),
});

export const insertCartItemSchema = createInsertSchema(cart_items).pick({
  id: true,
  quantity: true,
  product_id: true,
  user_id: true,
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cart_items.$inferSelect;

// Waitlist
export const waitlist = pgTable("waitlist", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWaitlistSchema = createInsertSchema(waitlist).pick({
  name: true,
  email: true,
});

export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type Waitlist = typeof waitlist.$inferSelect;

// Contact Messages
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// User Roles
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin'
}

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default(UserRole.CUSTOMER),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .omit({ passwordHash: true, id: true, createdAt: true })
  .extend({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required")
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
