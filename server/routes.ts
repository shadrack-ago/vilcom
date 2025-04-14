import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertShiftSchema, insertTeamMemberSchema, insertShiftTypeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // 1. Team Member Routes
  app.get("/api/team-members", async (req, res) => {
    try {
      const teamMembers = await storage.getTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  app.get("/api/team-members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const teamMember = await storage.getTeamMember(id);
      
      if (!teamMember) {
        return res.status(404).json({ error: "Team member not found" });
      }
      
      res.json(teamMember);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team member" });
    }
  });

  app.post("/api/team-members", async (req, res) => {
    try {
      const validatedData = insertTeamMemberSchema.parse(req.body);
      const newTeamMember = await storage.createTeamMember(validatedData);
      res.status(201).json(newTeamMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create team member" });
    }
  });

  app.patch("/api/team-members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTeamMemberSchema.partial().parse(req.body);
      
      const updatedTeamMember = await storage.updateTeamMember(id, validatedData);
      
      if (!updatedTeamMember) {
        return res.status(404).json({ error: "Team member not found" });
      }
      
      res.json(updatedTeamMember);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update team member" });
    }
  });

  app.delete("/api/team-members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTeamMember(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Team member not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete team member" });
    }
  });

  // 2. Shift Type Routes
  app.get("/api/shift-types", async (req, res) => {
    try {
      const shiftTypes = await storage.getShiftTypes();
      res.json(shiftTypes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shift types" });
    }
  });

  app.post("/api/shift-types", async (req, res) => {
    try {
      const validatedData = insertShiftTypeSchema.parse(req.body);
      const newShiftType = await storage.createShiftType(validatedData);
      res.status(201).json(newShiftType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create shift type" });
    }
  });

  // 3. Shift Routes
  app.get("/api/shifts", async (req, res) => {
    try {
      const shifts = await storage.getShifts();
      res.json(shifts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shifts" });
    }
  });

  app.get("/api/shifts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const shift = await storage.getShiftById(id);
      
      if (!shift) {
        return res.status(404).json({ error: "Shift not found" });
      }
      
      res.json(shift);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shift" });
    }
  });

  app.get("/api/schedule/week", async (req, res) => {
    try {
      // Parse the date from query string, or use current date if not provided
      let date = new Date();
      
      if (req.query.date && typeof req.query.date === 'string') {
        date = new Date(req.query.date);
        
        if (isNaN(date.getTime())) {
          return res.status(400).json({ error: "Invalid date format" });
        }
      }
      
      const weekSchedule = await storage.getWeekSchedule(date);
      res.json(weekSchedule);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch week schedule" });
    }
  });

  app.post("/api/shifts", async (req, res) => {
    try {
      const validatedData = insertShiftSchema.parse(req.body);
      const newShift = await storage.createShift(validatedData);
      res.status(201).json(newShift);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create shift" });
    }
  });

  app.patch("/api/shifts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertShiftSchema.partial().parse(req.body);
      
      const updatedShift = await storage.updateShift(id, validatedData);
      
      if (!updatedShift) {
        return res.status(404).json({ error: "Shift not found" });
      }
      
      res.json(updatedShift);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update shift" });
    }
  });

  app.delete("/api/shifts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteShift(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Shift not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete shift" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
