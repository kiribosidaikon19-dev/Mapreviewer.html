import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

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
      // Force createdBy to current user
      const user = req.user as any;
      const input = api.locations.create.input.parse({
        ...req.body,
        createdBy: user.claims.sub,
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
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reviews
  app.post(api.reviews.create.path, isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const locationId = Number(req.params.locationId);
      
      if (isNaN(locationId)) return res.status(400).json({ message: "Invalid location ID" });

      const input = api.reviews.create.input.parse({
        ...req.body,
        locationId: locationId,
        userId: user.claims.sub,
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
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed Data (if empty)
  // We can do a quick check and seed if no locations exist
  // BUT we need a user ID for createdBy. 
  // Since we rely on Replit Auth, we don't have a guaranteed user ID until someone logs in.
  // We'll skip auto-seeding connected to users for now, or just seed with a placeholder if needed.
  // Actually, let's just leave it empty. The user can add locations.

  return httpServer;
}
