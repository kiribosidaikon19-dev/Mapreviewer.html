import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStoreFactory from "memorystore";

const MemoryStore = MemoryStoreFactory(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Simple Session Auth
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
      resave: false,
      saveUninitialized: false,
      secret: "simple-secret",
    })
  );

  // Simple Auth Routes
  app.post("/api/login", async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: "Username is required" });

    let user = await storage.getUserByUsername(username);
    if (!user) {
      user = await storage.createUser({ username });
    }

    (req.session as any).userId = user.id;
    res.json(user);
  });

  app.get("/api/auth/user", async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    res.json(user);
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Failed to logout" });
      res.json({ message: "Logged out" });
    });
  });

  // Auth Middleware
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (!req.session.userId) return res.status(401).json({ message: "Unauthorized" });
    next();
  };

  // Locations
  app.get(api.locations.list.path, async (req, res) => {
    const locations = await storage.getLocations();
    res.json(locations);
  });

  app.get(api.locations.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(404).json({ message: "Invalid ID" });

    const location = await storage.getLocation(id);
    if (!location) return res.status(404).json({ message: "Location not found" });

    res.json(location);
  });

  app.post(api.locations.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const input = api.locations.create.input.parse({
        ...req.body,
        createdBy: userId,
      });

      const location = await storage.createLocation(input);
      res.status(201).json(location);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reviews
  app.post(api.reviews.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const locationId = Number(req.params.locationId);
      
      if (isNaN(locationId)) return res.status(400).json({ message: "Invalid location ID" });

      const input = api.reviews.create.input.parse({
        ...req.body,
        locationId: locationId,
        userId: userId,
      });

      const review = await storage.createReview(input);
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
