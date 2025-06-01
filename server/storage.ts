import {
  users,
  facialAnalyses,
  products,
  productCategories,
  cartItems,
  professionals,
  professionalReviews,
  bookings,
  makeupLooks,
  type User,
  type UpsertUser,
  type FacialAnalysis,
  type InsertFacialAnalysis,
  type Product,
  type ProductCategory,
  type CartItem,
  type InsertCartItem,
  type Professional,
  type InsertProfessional,
  type ProfessionalReview,
  type InsertProfessionalReview,
  type Booking,
  type InsertBooking,
  type MakeupLook,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, avg, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Facial analysis operations
  createFacialAnalysis(analysis: InsertFacialAnalysis): Promise<FacialAnalysis>;
  getFacialAnalysesByUser(userId: string): Promise<FacialAnalysis[]>;
  getLatestFacialAnalysis(userId: string): Promise<FacialAnalysis | undefined>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductCategories(): Promise<ProductCategory[]>;
  
  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<void>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Professional operations
  getProfessionals(): Promise<(Professional & { user: User })[]>;
  getProfessional(id: number): Promise<(Professional & { user: User }) | undefined>;
  createProfessional(professional: InsertProfessional): Promise<Professional>;
  updateProfessional(id: number, updates: Partial<InsertProfessional>): Promise<void>;
  
  // Review operations
  getProfessionalReviews(professionalId: number): Promise<(ProfessionalReview & { user: User })[]>;
  createProfessionalReview(review: InsertProfessionalReview): Promise<ProfessionalReview>;
  
  // Booking operations
  getBookings(userId: string): Promise<(Booking & { professional: Professional & { user: User } })[]>;
  getProfessionalBookings(professionalId: number): Promise<(Booking & { user: User })[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<void>;
  
  // Makeup looks operations
  getMakeupLooks(): Promise<MakeupLook[]>;
  getMakeupLooksByCategory(category: string): Promise<MakeupLook[]>;
  getMakeupLook(id: number): Promise<MakeupLook | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Facial analysis operations
  async createFacialAnalysis(analysis: InsertFacialAnalysis): Promise<FacialAnalysis> {
    const [result] = await db.insert(facialAnalyses).values(analysis).returning();
    return result;
  }

  async getFacialAnalysesByUser(userId: string): Promise<FacialAnalysis[]> {
    return await db
      .select()
      .from(facialAnalyses)
      .where(eq(facialAnalyses.userId, userId))
      .orderBy(desc(facialAnalyses.createdAt));
  }

  async getLatestFacialAnalysis(userId: string): Promise<FacialAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(facialAnalyses)
      .where(eq(facialAnalyses.userId, userId))
      .orderBy(desc(facialAnalyses.createdAt))
      .limit(1);
    return analysis;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt));
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
      .orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductCategories(): Promise<ProductCategory[]> {
    return await db.select().from(productCategories).orderBy(productCategories.name);
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    return await db
      .select({
        id: cartItems.id,
        userId: cartItems.userId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        product: products,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.productId, cartItem.productId)
        )
      );

    if (existingItem) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + (cartItem.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updated;
    } else {
      // Create new cart item
      const [created] = await db.insert(cartItems).values(cartItem).returning();
      return created;
    }
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<void> {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id));
  }

  async removeFromCart(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Professional operations
  async getProfessionals(): Promise<(Professional & { user: User })[]> {
    return await db
      .select({
        id: professionals.id,
        userId: professionals.userId,
        businessName: professionals.businessName,
        specialties: professionals.specialties,
        bio: professionals.bio,
        bioEn: professionals.bioEn,
        basePrice: professionals.basePrice,
        currency: professionals.currency,
        location: professionals.location,
        isVerified: professionals.isVerified,
        averageRating: professionals.averageRating,
        totalReviews: professionals.totalReviews,
        createdAt: professionals.createdAt,
        user: users,
      })
      .from(professionals)
      .innerJoin(users, eq(professionals.userId, users.id))
      .orderBy(desc(professionals.averageRating));
  }

  async getProfessional(id: number): Promise<(Professional & { user: User }) | undefined> {
    const [professional] = await db
      .select({
        id: professionals.id,
        userId: professionals.userId,
        businessName: professionals.businessName,
        specialties: professionals.specialties,
        bio: professionals.bio,
        bioEn: professionals.bioEn,
        basePrice: professionals.basePrice,
        currency: professionals.currency,
        location: professionals.location,
        isVerified: professionals.isVerified,
        averageRating: professionals.averageRating,
        totalReviews: professionals.totalReviews,
        createdAt: professionals.createdAt,
        user: users,
      })
      .from(professionals)
      .innerJoin(users, eq(professionals.userId, users.id))
      .where(eq(professionals.id, id));
    return professional;
  }

  async createProfessional(professional: InsertProfessional): Promise<Professional> {
    const [created] = await db.insert(professionals).values(professional).returning();
    return created;
  }

  async updateProfessional(id: number, updates: Partial<InsertProfessional>): Promise<void> {
    await db.update(professionals).set(updates).where(eq(professionals.id, id));
  }

  // Review operations
  async getProfessionalReviews(professionalId: number): Promise<(ProfessionalReview & { user: User })[]> {
    return await db
      .select({
        id: professionalReviews.id,
        professionalId: professionalReviews.professionalId,
        userId: professionalReviews.userId,
        rating: professionalReviews.rating,
        comment: professionalReviews.comment,
        createdAt: professionalReviews.createdAt,
        user: users,
      })
      .from(professionalReviews)
      .innerJoin(users, eq(professionalReviews.userId, users.id))
      .where(eq(professionalReviews.professionalId, professionalId))
      .orderBy(desc(professionalReviews.createdAt));
  }

  async createProfessionalReview(review: InsertProfessionalReview): Promise<ProfessionalReview> {
    const [created] = await db.insert(professionalReviews).values(review).returning();
    
    // Update professional's average rating and total reviews
    const [stats] = await db
      .select({
        avgRating: avg(professionalReviews.rating),
        totalReviews: count(professionalReviews.id),
      })
      .from(professionalReviews)
      .where(eq(professionalReviews.professionalId, review.professionalId));

    await db
      .update(professionals)
      .set({
        averageRating: stats.avgRating ? Number(stats.avgRating) : 0,
        totalReviews: stats.totalReviews,
      })
      .where(eq(professionals.id, review.professionalId));

    return created;
  }

  // Booking operations
  async getBookings(userId: string): Promise<(Booking & { professional: Professional & { user: User } })[]> {
    return await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        professionalId: bookings.professionalId,
        serviceDate: bookings.serviceDate,
        status: bookings.status,
        totalPrice: bookings.totalPrice,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        professional: {
          id: professionals.id,
          userId: professionals.userId,
          businessName: professionals.businessName,
          specialties: professionals.specialties,
          bio: professionals.bio,
          bioEn: professionals.bioEn,
          basePrice: professionals.basePrice,
          currency: professionals.currency,
          location: professionals.location,
          isVerified: professionals.isVerified,
          averageRating: professionals.averageRating,
          totalReviews: professionals.totalReviews,
          createdAt: professionals.createdAt,
          user: users,
        },
      })
      .from(bookings)
      .innerJoin(professionals, eq(bookings.professionalId, professionals.id))
      .innerJoin(users, eq(professionals.userId, users.id))
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.serviceDate));
  }

  async getProfessionalBookings(professionalId: number): Promise<(Booking & { user: User })[]> {
    return await db
      .select({
        id: bookings.id,
        userId: bookings.userId,
        professionalId: bookings.professionalId,
        serviceDate: bookings.serviceDate,
        status: bookings.status,
        totalPrice: bookings.totalPrice,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        user: users,
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.professionalId, professionalId))
      .orderBy(desc(bookings.serviceDate));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [created] = await db.insert(bookings).values(booking).returning();
    return created;
  }

  async updateBookingStatus(id: number, status: string): Promise<void> {
    await db.update(bookings).set({ status }).where(eq(bookings.id, id));
  }

  // Makeup looks operations
  async getMakeupLooks(): Promise<MakeupLook[]> {
    return await db
      .select()
      .from(makeupLooks)
      .where(eq(makeupLooks.isActive, true))
      .orderBy(makeupLooks.name);
  }

  async getMakeupLooksByCategory(category: string): Promise<MakeupLook[]> {
    return await db
      .select()
      .from(makeupLooks)
      .where(and(eq(makeupLooks.category, category), eq(makeupLooks.isActive, true)))
      .orderBy(makeupLooks.name);
  }

  async getMakeupLook(id: number): Promise<MakeupLook | undefined> {
    const [look] = await db.select().from(makeupLooks).where(eq(makeupLooks.id, id));
    return look;
  }
}

export const storage = new DatabaseStorage();
