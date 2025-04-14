import { 
  users, type User, type InsertUser,
  teamMembers, type TeamMember, type InsertTeamMember,
  shiftTypes, type ShiftType, type InsertShiftType,
  shifts, type Shift, type InsertShift, 
  type ShiftWithDetails, type WeekSchedule
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Team members
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: number): Promise<boolean>;

  // Shift types
  getShiftTypes(): Promise<ShiftType[]>;
  getShiftType(id: number): Promise<ShiftType | undefined>;
  createShiftType(shiftType: InsertShiftType): Promise<ShiftType>;
  updateShiftType(id: number, shiftType: Partial<InsertShiftType>): Promise<ShiftType | undefined>;
  deleteShiftType(id: number): Promise<boolean>;

  // Shifts
  getShifts(): Promise<Shift[]>;
  getShiftById(id: number): Promise<Shift | undefined>;
  getShiftsByDateRange(startDate: Date, endDate: Date): Promise<ShiftWithDetails[]>;
  createShift(shift: InsertShift): Promise<Shift>;
  updateShift(id: number, shift: Partial<InsertShift>): Promise<Shift | undefined>;
  deleteShift(id: number): Promise<boolean>;
  getWeekSchedule(date: Date): Promise<WeekSchedule>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private teamMembers: Map<number, TeamMember>;
  private shiftTypes: Map<number, ShiftType>;
  private shifts: Map<number, Shift>;
  
  private userCurrentId: number = 1;
  private teamMemberCurrentId: number = 1;
  private shiftTypeCurrentId: number = 1;
  private shiftCurrentId: number = 1;

  constructor() {
    this.users = new Map();
    this.teamMembers = new Map();
    this.shiftTypes = new Map();
    this.shifts = new Map();
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default shift types
    const morningShift = this.createShiftType({
      name: "Morning Shift",
      startTime: "06:00:00", // Format: HH:MM:SS
      endTime: "14:00:00",
      color: "#4CAF50", // Green
      description: "Early morning shift for the SOC team"
    });

    const afternoonShift = this.createShiftType({
      name: "Afternoon Shift",
      startTime: "14:00:00",
      endTime: "22:00:00",
      color: "#F59E0B", // Amber
      description: "Afternoon coverage for the SOC team"
    });

    const nightShift = this.createShiftType({
      name: "Night Shift",
      startTime: "22:00:00",
      endTime: "06:00:00",
      color: "#6366F1", // Indigo
      description: "Overnight coverage for the SOC team"
    });

    // Create default team members
    const sarahChen = this.createTeamMember({
      name: "Sarah Chen",
      position: "Security Analyst",
      email: "sarah.chen@vilcomnetworks.com",
      phone: "555-123-4567",
      avatarUrl: "",
      status: "active",
      userId: null
    });

    const johnMaxwell = this.createTeamMember({
      name: "John Maxwell",
      position: "SOC Lead",
      email: "john.maxwell@vilcomnetworks.com",
      phone: "555-234-5678",
      avatarUrl: "",
      status: "active",
      userId: null
    });

    const emilyParker = this.createTeamMember({
      name: "Emily Parker",
      position: "Security Engineer",
      email: "emily.parker@vilcomnetworks.com",
      phone: "555-345-6789",
      avatarUrl: "",
      status: "pto_soon",
      userId: null
    });

    const michaelScott = this.createTeamMember({
      name: "Michael Scott",
      position: "Threat Hunter",
      email: "michael.scott@vilcomnetworks.com",
      phone: "555-456-7890",
      avatarUrl: "",
      status: "active",
      userId: null
    });

    const davidKim = this.createTeamMember({
      name: "David Kim",
      position: "Incident Responder",
      email: "david.kim@vilcomnetworks.com",
      phone: "555-567-8901",
      avatarUrl: "",
      status: "active",
      userId: null
    });

    // Create some default shifts for the current week
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      // Format date as YYYY-MM-DD
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Assign morning shifts
      this.createShift({
        date: dateString,
        teamMemberId: i % 2 === 0 ? sarahChen.id : johnMaxwell.id,
        shiftTypeId: morningShift.id,
        notes: "",
        needsCoverage: false,
      });
      
      // Assign afternoon shifts
      this.createShift({
        date: dateString,
        teamMemberId: i % 2 === 0 ? emilyParker.id : davidKim.id,
        shiftTypeId: afternoonShift.id,
        notes: "",
        needsCoverage: false,
      });
      
      // Assign night shifts, but make Wednesday need coverage
      this.createShift({
        date: dateString,
        teamMemberId: i === 3 ? null : (i % 2 === 0 ? michaelScott.id : davidKim.id), // Wednesday (i=3) has no assignment
        shiftTypeId: nightShift.id,
        notes: i === 3 ? "Urgent coverage needed" : "",
        needsCoverage: i === 3, // Wednesday needs coverage
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Team member methods
  async getTeamMembers(): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values());
  }

  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const id = this.teamMemberCurrentId++;
    const teamMember: TeamMember = { ...member, id };
    this.teamMembers.set(id, teamMember);
    return teamMember;
  }

  async updateTeamMember(id: number, member: Partial<InsertTeamMember>): Promise<TeamMember | undefined> {
    const existingMember = this.teamMembers.get(id);
    if (!existingMember) {
      return undefined;
    }
    
    const updatedMember = { ...existingMember, ...member };
    this.teamMembers.set(id, updatedMember);
    return updatedMember;
  }

  async deleteTeamMember(id: number): Promise<boolean> {
    return this.teamMembers.delete(id);
  }

  // Shift type methods
  async getShiftTypes(): Promise<ShiftType[]> {
    return Array.from(this.shiftTypes.values());
  }

  async getShiftType(id: number): Promise<ShiftType | undefined> {
    return this.shiftTypes.get(id);
  }

  async createShiftType(shiftType: InsertShiftType): Promise<ShiftType> {
    const id = this.shiftTypeCurrentId++;
    const newShiftType: ShiftType = { ...shiftType, id };
    this.shiftTypes.set(id, newShiftType);
    return newShiftType;
  }

  async updateShiftType(id: number, shiftType: Partial<InsertShiftType>): Promise<ShiftType | undefined> {
    const existingType = this.shiftTypes.get(id);
    if (!existingType) {
      return undefined;
    }
    
    const updatedType = { ...existingType, ...shiftType };
    this.shiftTypes.set(id, updatedType);
    return updatedType;
  }

  async deleteShiftType(id: number): Promise<boolean> {
    return this.shiftTypes.delete(id);
  }

  // Shift methods
  async getShifts(): Promise<Shift[]> {
    return Array.from(this.shifts.values());
  }

  async getShiftById(id: number): Promise<Shift | undefined> {
    return this.shifts.get(id);
  }

  async getShiftsByDateRange(startDate: Date, endDate: Date): Promise<ShiftWithDetails[]> {
    const shifts = Array.from(this.shifts.values()).filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= startDate && shiftDate <= endDate;
    });

    return Promise.all(shifts.map(async shift => {
      const teamMember = shift.teamMemberId ? await this.getTeamMember(shift.teamMemberId) : null;
      const shiftType = await this.getShiftType(shift.shiftTypeId);
      
      return {
        ...shift,
        teamMember: teamMember as TeamMember,
        shiftType: shiftType as ShiftType
      };
    }));
  }

  async createShift(shift: InsertShift): Promise<Shift> {
    const id = this.shiftCurrentId++;
    const newShift: Shift = { 
      ...shift, 
      id, 
      createdAt: new Date()
    };
    this.shifts.set(id, newShift);
    return newShift;
  }

  async updateShift(id: number, shift: Partial<InsertShift>): Promise<Shift | undefined> {
    const existingShift = this.shifts.get(id);
    if (!existingShift) {
      return undefined;
    }
    
    const updatedShift = { ...existingShift, ...shift };
    this.shifts.set(id, updatedShift);
    return updatedShift;
  }

  async deleteShift(id: number): Promise<boolean> {
    return this.shifts.delete(id);
  }

  async getWeekSchedule(date: Date): Promise<WeekSchedule> {
    // Calculate the start and end of the week (Sunday to Saturday)
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    // Get all shifts within this date range
    const shiftsInRange = await this.getShiftsByDateRange(startOfWeek, endOfWeek);
    
    // Create an array for each day of the week
    const days = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      
      // Get shifts for this day
      const shiftsForDay = shiftsInRange.filter(shift => {
        const shiftDate = new Date(shift.date);
        return shiftDate.getDate() === currentDate.getDate() 
          && shiftDate.getMonth() === currentDate.getMonth() 
          && shiftDate.getFullYear() === currentDate.getFullYear();
      });
      
      days.push({
        date: currentDate,
        shifts: shiftsForDay
      });
    }
    
    return {
      start: startOfWeek,
      end: endOfWeek,
      days
    };
  }
}

export const storage = new MemStorage();
