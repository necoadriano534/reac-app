import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, uniqueIndex, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  celular: text("celular"),
  externalId: text("external_id"),
  role: text("role").notNull().default("client"), // 'admin' | 'client'
  avatar: text("avatar"),
  status: text("status").notNull().default("active"), // 'active' | 'inactive'
  lastActive: timestamp("last_active").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
}, (table) => [
  uniqueIndex("unique_external_id").on(table.externalId).where(sql`${table.externalId} IS NOT NULL AND ${table.externalId} != ''`),
]);

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastActive: true,
  resetToken: true,
  resetTokenExpiry: true,
}).extend({
  password: z.string().min(6),
  celular: z.string().optional().nullable(),
  externalId: z.string().optional().nullable(),
});

export const selectUserSchema = createSelectSchema(users);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const updateUserSchema = insertUserSchema.partial().omit({
  password: true,
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export const newPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SelectUser = Omit<User, "password" | "resetToken" | "resetTokenExpiry">;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;

// Conversations
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  protocol: text("protocol").notNull().unique(),
  clientId: varchar("client_id").references(() => users.id),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  clientPhone: text("client_phone"),
  attendantId: varchar("attendant_id").references(() => users.id),
  channel: text("channel").notNull().default("web"), // 'web' | 'whatsapp' | 'telegram' | 'email'
  status: text("status").notNull().default("open"), // 'open' | 'pending' | 'closed'
  priority: text("priority").notNull().default("normal"), // 'low' | 'normal' | 'high' | 'urgent'
  subject: text("subject"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  lastMessageAt: true,
  closedAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").references(() => users.id),
  senderType: text("sender_type").notNull().default("client"), // 'client' | 'attendant' | 'system'
  senderName: text("sender_name").notNull(),
  content: text("content").notNull(),
  contentType: text("content_type").notNull().default("text"), // 'text' | 'image' | 'file' | 'audio'
  fileUrl: text("file_url"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
