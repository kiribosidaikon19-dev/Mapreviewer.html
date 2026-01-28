import {
  users,
  locations,
  reviews,
  type User,
  type InsertUser,
  type Location,
  type InsertLocation,
  type Review,
  type InsertReview,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Locations
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<(Location & { reviews: (Review & { user: User })[] }) | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;

  // Reviews
  createReview(review: InsertReview): Promise<Review>;
}

export class DatabaseStorage implements IStorage {
  // Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Locations
  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations).orderBy(desc(locations.createdAt));
  }

  async getLocation(id: number): Promise<(Location & { reviews: (Review & { user: User })[] }) | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));

    if (!location) return undefined;

    const locationReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.locationId, id))
      .orderBy(desc(reviews.createdAt))
      .leftJoin(users, eq(reviews.userId, users.id));

    const formattedReviews = locationReviews.map((r) => ({
      ...r.reviews,
      user: r.users!,
    }));

    return { ...location, reviews: formattedReviews };
  }

  async createLocation(insertLocation: any): Promise<Location> {
    const [location] = await db.insert(locations).values(insertLocation).returning();
    return location;
  }

  // Reviews
  async createReview(insertReview: any): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }
}

export const storage = new DatabaseStorage();
