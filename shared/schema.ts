import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Facial analysis results
export const facialAnalyses = pgTable("facial_analyses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  imageUrl: varchar("image_url").notNull(),
  skinTone: varchar("skin_tone"),
  faceShape: varchar("face_shape"),
  eyeColor: varchar("eye_color"),
  recommendations: jsonb("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product categories
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  nameEn: varchar("name_en"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  nameEn: varchar("name_en"),
  description: text("description"),
  descriptionEn: text("description_en"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("CFA"),
  imageUrl: varchar("image_url"),
  categoryId: integer("category_id").references(() => productCategories.id),
  stock: integer("stock").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shopping cart
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Professional makeup artists
export const professionals = pgTable("professionals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: varchar("business_name"),
  specialties: text("specialties").array(),
  bio: text("bio"),
  bioEn: text("bio_en"),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),
  currency: varchar("currency").default("CFA"),
  location: varchar("location"),
  isVerified: boolean("is_verified").default(false),
  averageRating: real("average_rating").default(0),
  totalReviews: integer("total_reviews").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Professional reviews
export const professionalReviews = pgTable("professional_reviews", {
  id: serial("id").primaryKey(),
  professionalId: integer("professional_id").notNull().references(() => professionals.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  professionalId: integer("professional_id").notNull().references(() => professionals.id),
  serviceDate: timestamp("service_date").notNull(),
  status: varchar("status").default("pending"), // pending, confirmed, completed, cancelled
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Makeup looks/recommendations
export const makeupLooks = pgTable("makeup_looks", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  nameEn: varchar("name_en"),
  description: text("description"),
  descriptionEn: text("description_en"),
  imageUrl: varchar("image_url"),
  category: varchar("category"), // natural, evening, professional, cultural
  suitableSkinTones: text("suitable_skin_tones").array(),
  products: jsonb("products"), // Array of product IDs and usage instructions
  difficulty: varchar("difficulty").default("beginner"), // beginner, intermediate, advanced
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  facialAnalyses: many(facialAnalyses),
  cartItems: many(cartItems),
  professionalProfile: many(professionals),
  reviews: many(professionalReviews),
  bookings: many(bookings),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  cartItems: many(cartItems),
}));

export const professionalsRelations = relations(professionals, ({ one, many }) => ({
  user: one(users, {
    fields: [professionals.userId],
    references: [users.id],
  }),
  reviews: many(professionalReviews),
  bookings: many(bookings),
}));

export const professionalReviewsRelations = relations(professionalReviews, ({ one }) => ({
  professional: one(professionals, {
    fields: [professionalReviews.professionalId],
    references: [professionals.id],
  }),
  user: one(users, {
    fields: [professionalReviews.userId],
    references: [users.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  professional: one(professionals, {
    fields: [bookings.professionalId],
    references: [professionals.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertFacialAnalysisSchema = createInsertSchema(facialAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertProfessionalSchema = createInsertSchema(professionals).omit({
  id: true,
  createdAt: true,
});

export const insertProfessionalReviewSchema = createInsertSchema(professionalReviews).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertMakeupLookSchema = createInsertSchema(makeupLooks).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type FacialAnalysis = typeof facialAnalyses.$inferSelect;
export type InsertFacialAnalysis = z.infer<typeof insertFacialAnalysisSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type ProductCategory = typeof productCategories.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type ProfessionalReview = typeof professionalReviews.$inferSelect;
export type InsertProfessionalReview = z.infer<typeof insertProfessionalReviewSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type MakeupLook = typeof makeupLooks.$inferSelect;
export type InsertMakeupLook = z.infer<typeof insertMakeupLookSchema>;
