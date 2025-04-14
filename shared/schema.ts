import { pgTable, text, serial, integer, boolean, time, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model (from existing schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Team Member model
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  status: text("status").default("active").notNull(), // active, pto, unavailable, etc.
  userId: integer("user_id").references(() => users.id),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
});

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Shift Type model
export const shiftTypes = pgTable("shift_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  color: text("color").notNull().default("#3A86FF"),
  description: text("description"),
});

export const insertShiftTypeSchema = createInsertSchema(shiftTypes).omit({
  id: true,
});

export type InsertShiftType = z.infer<typeof insertShiftTypeSchema>;
export type ShiftType = typeof shiftTypes.$inferSelect;

// Shift model
export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  teamMemberId: integer("team_member_id").references(() => teamMembers.id),
  shiftTypeId: integer("shift_type_id").references(() => shiftTypes.id),
  notes: text("notes"),
  needsCoverage: boolean("needs_coverage").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertShiftSchema = createInsertSchema(shifts).omit({
  id: true,
  createdAt: true,
});

export type InsertShift = z.infer<typeof insertShiftSchema>;
export type Shift = typeof shifts.$inferSelect;

// Extended view types
export type ShiftWithDetails = Shift & {
  teamMember: TeamMember;
  shiftType: ShiftType;
};

export type WeekSchedule = {
  start: Date;
  end: Date;
  days: {
    date: Date;
    shifts: ShiftWithDetails[];
  }[];
};
