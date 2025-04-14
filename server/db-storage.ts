import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";
import { 
  users, type User, type InsertUser,
  teamMembers, type TeamMember, type InsertTeamMember,
  shiftTypes, type ShiftType, type InsertShiftType,
  shifts, type Shift, type InsertShift, 
  type ShiftWithDetails, type WeekSchedule
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Make sure we only include properties that exist in the InsertUser type
    const userToInsert = {
      username: insertUser.username,
      password: insertUser.password
    };
    
    const [user] = await db
      .insert(users)
      .values(userToInsert)
      .returning();
    return user;
  }

  // Team member methods
  async getTeamMembers(): Promise<TeamMember[]> {
    return db.select().from(teamMembers);
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return member;
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db
      .insert(teamMembers)
      .values(member)
      .returning();
    return newMember;
  }

  async updateTeamMember(id: number, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const [updatedMember] = await db
      .update(teamMembers)
      .set(member)
      .where(eq(teamMembers.id, id))
      .returning();
    return updatedMember;
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    const result = await db
      .delete(teamMembers)
      .where(eq(teamMembers.id, id))
      .returning({ id: teamMembers.id });
    
    return result.length > 0;
  }

  // Shift type methods
  async getShiftTypes(): Promise<ShiftType[]> {
    return db.select().from(shiftTypes);
  }

  async getShiftType(id: number): Promise<ShiftType | undefined> {
    const [shiftType] = await db.select().from(shiftTypes).where(eq(shiftTypes.id, id));
    return shiftType;
  }

  async createShiftType(shiftType: InsertShiftType): Promise<ShiftType> {
    const [newShiftType] = await db
      .insert(shiftTypes)
      .values(shiftType)
      .returning();
    return newShiftType;
  }

  async updateShiftType(id: number, shiftType: Partial<InsertShiftType>): Promise<ShiftType | undefined> {
    const [updatedShiftType] = await db
      .update(shiftTypes)
      .set(shiftType)
      .where(eq(shiftTypes.id, id))
      .returning();
    return updatedShiftType;
  }

  async deleteShiftType(id: number): Promise<boolean> {
    const result = await db
      .delete(shiftTypes)
      .where(eq(shiftTypes.id, id))
      .returning({ id: shiftTypes.id });
    
    return result.length > 0;
  }

  // Shift methods
  async getShifts(): Promise<Shift[]> {
    return db.select().from(shifts);
  }

  async getShiftById(id: number): Promise<Shift | undefined> {
    const [shift] = await db.select().from(shifts).where(eq(shifts.id, id));
    return shift;
  }

  async getShiftsByDateRange(startDate: Date, endDate: Date): Promise<ShiftWithDetails[]> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Get all shifts in the date range
    const shiftsData = await db
      .select()
      .from(shifts)
      .where(and(
        gte(shifts.date, startDateStr),
        lte(shifts.date, endDateStr)
      ));
    
    // For each shift, get the related team member and shift type
    const shiftsWithDetails: ShiftWithDetails[] = [];
    
    for (const shift of shiftsData) {
      // Default empty team member and shift type that match the required structure
      let teamMember: TeamMember | null = null;
      let shiftType: ShiftType | null = null;
      
      if (shift.teamMemberId) {
        const [tm] = await db
          .select()
          .from(teamMembers)
          .where(eq(teamMembers.id, shift.teamMemberId));
        
        if (tm) {
          teamMember = tm;
        }
      }
      
      if (shift.shiftTypeId) {
        const [st] = await db
          .select()
          .from(shiftTypes)
          .where(eq(shiftTypes.id, shift.shiftTypeId));
        
        if (st) {
          shiftType = st;
        }
      }
      
      // We need to handle the case where teamMember or shiftType might be null
      // This is a workaround to satisfy TypeScript
      if (!teamMember) {
        // Create a placeholder TeamMember that matches the required type
        teamMember = {
          id: -1,
          name: "Unassigned",
          position: "N/A",
          email: "unassigned@example.com",
          phone: null,
          avatarUrl: null,
          status: "unavailable",
          userId: null
        };
      }
      
      if (!shiftType) {
        // Create a placeholder ShiftType that matches the required type
        shiftType = {
          id: -1,
          name: "Unknown Shift",
          startTime: "00:00:00",
          endTime: "00:00:00",
          color: "#cccccc",
          description: null
        };
      }
      
      shiftsWithDetails.push({
        ...shift,
        teamMember,
        shiftType
      });
    }
    
    return shiftsWithDetails;
  }

  async createShift(shiftData: InsertShift): Promise<Shift> {
    const [newShift] = await db
      .insert(shifts)
      .values({
        ...shiftData,
        createdAt: new Date()
      })
      .returning();
    return newShift;
  }

  async updateShift(id: number, shiftData: Partial<InsertShift>): Promise<Shift | undefined> {
    const [updatedShift] = await db
      .update(shifts)
      .set(shiftData)
      .where(eq(shifts.id, id))
      .returning();
    return updatedShift;
  }

  async deleteShift(id: number): Promise<boolean> {
    const result = await db
      .delete(shifts)
      .where(eq(shifts.id, id))
      .returning({ id: shifts.id });
    
    return result.length > 0;
  }

  async getWeekSchedule(date: Date): Promise<WeekSchedule> {
    // Calculate the start and end dates of the week
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Go to Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Go to Saturday
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Get shifts for the date range
    const shiftsWithDetails = await this.getShiftsByDateRange(startOfWeek, endOfWeek);
    
    // Group shifts by date
    const dayMap = new Map<string, ShiftWithDetails[]>();
    
    // Initialize each day with an empty array
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dateStr = day.toISOString().split('T')[0];
      dayMap.set(dateStr, []);
    }
    
    // Add shifts to their respective days
    shiftsWithDetails.forEach(shift => {
      const dayShifts = dayMap.get(shift.date) || [];
      dayShifts.push(shift);
      dayMap.set(shift.date, dayShifts);
    });
    
    // Convert the map to the required format
    const days = Array.from(dayMap).map(([dateStr, shifts]) => {
      const day = new Date(dateStr);
      return {
        date: day,
        shifts
      };
    });
    
    // Sort days by date
    days.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return {
      start: startOfWeek,
      end: endOfWeek,
      days
    };
  }

  // Initialize the database with sample data
  async initializeDefaultData() {
    try {
      const usersCount = await db.select().from(users).execute();
      
      // Only insert sample data if the tables are empty
      if (usersCount.length === 0) {
        // Create a default user
        await this.createUser({
          username: "admin",
          password: "admin123"
        });
        
        // Create default team members
        const teamMember1 = await this.createTeamMember({
          name: "Sarah Chen",
          position: "Security Analyst",
          email: "sarah.chen@vilcomnetworks.com",
          phone: "555-123-4567",
          avatarUrl: "",
          status: "active",
          userId: null
        });
        
        const teamMember2 = await this.createTeamMember({
          name: "John Maxwell",
          position: "SOC Lead",
          email: "john.maxwell@vilcomnetworks.com",
          phone: "555-234-5678",
          avatarUrl: "",
          status: "active",
          userId: null
        });
        
        const teamMember3 = await this.createTeamMember({
          name: "Emily Parker",
          position: "Security Engineer",
          email: "emily.parker@vilcomnetworks.com",
          phone: "555-345-6789",
          avatarUrl: "",
          status: "pto_soon",
          userId: null
        });
        
        const teamMember4 = await this.createTeamMember({
          name: "Michael Scott",
          position: "Threat Hunter",
          email: "michael.scott@vilcomnetworks.com",
          phone: "555-456-7890",
          avatarUrl: "",
          status: "active",
          userId: null
        });
        
        const teamMember5 = await this.createTeamMember({
          name: "David Kim",
          position: "Incident Responder",
          email: "david.kim@vilcomnetworks.com",
          phone: "555-567-8901",
          avatarUrl: "",
          status: "active",
          userId: null
        });
        
        // Create default shift types
        const shiftType1 = await this.createShiftType({
          name: "Morning Shift",
          startTime: "06:00:00",
          endTime: "14:00:00",
          color: "#4CAF50",
          description: "Early morning shift for the SOC team"
        });
        
        const shiftType2 = await this.createShiftType({
          name: "Afternoon Shift",
          startTime: "14:00:00",
          endTime: "22:00:00",
          color: "#F59E0B",
          description: "Afternoon coverage for the SOC team"
        });
        
        const shiftType3 = await this.createShiftType({
          name: "Night Shift",
          startTime: "22:00:00",
          endTime: "06:00:00",
          color: "#6366F1",
          description: "Overnight coverage for the SOC team"
        });
        
        // Create some example shifts for the current week
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday

        for (let i = 0; i < 7; i++) {
          const currentDate = new Date(startOfWeek);
          currentDate.setDate(startOfWeek.getDate() + i);
          
          // Format date as YYYY-MM-DD
          const dateString = currentDate.toISOString().split('T')[0];
          
          // Assign morning shifts
          await this.createShift({
            date: dateString,
            teamMemberId: i % 2 === 0 ? teamMember1.id : teamMember2.id,
            shiftTypeId: shiftType1.id,
            notes: "",
            needsCoverage: false,
          });
          
          // Assign afternoon shifts
          await this.createShift({
            date: dateString,
            teamMemberId: i % 2 === 0 ? teamMember3.id : teamMember5.id,
            shiftTypeId: shiftType2.id,
            notes: "",
            needsCoverage: false,
          });
          
          // Assign night shifts, but make Wednesday need coverage
          if (i === 3) { // Wednesday
            await this.createShift({
              date: dateString,
              teamMemberId: null,
              shiftTypeId: shiftType3.id,
              notes: "Urgent coverage needed",
              needsCoverage: true,
            });
          } else {
            await this.createShift({
              date: dateString,
              teamMemberId: i % 2 === 0 ? teamMember4.id : teamMember5.id,
              shiftTypeId: shiftType3.id,
              notes: "",
              needsCoverage: false,
            });
          }
        }
        
        console.log("Sample data initialized successfully");
      } else {
        console.log("Database already contains data, skipping initialization");
      }
    } catch (error) {
      console.error("Error initializing sample data:", error);
    }
  }
}