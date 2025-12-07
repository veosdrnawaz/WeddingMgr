
export enum RSVPStatus {
  Invited = 'Invited',
  Accepted = 'Accepted',
  Declined = 'Declined',
  Maybe = 'Maybe',
  Suggested = 'Suggested' // New status for family suggestions
}

export enum MealChoice {
  Chicken = 'Chicken',
  Beef = 'Beef',
  Veg = 'Veg',
  Kids = 'Kids',
  None = 'None'
}

export interface Guest {
  id: string;
  weddingId: string; // Multi-tenancy
  fullName: string;
  relation: 'Family' | 'Friend' | 'VIP' | 'Colleague';
  rsvpStatus: RSVPStatus;
  partySize: number; // Total count
  menCount: number;
  womenCount: number;
  childrenCount: number;
  mealChoice: MealChoice;
  tableId?: string;
  email?: string;
  phone?: string;
  description?: string;
  dietaryNotes?: string;
  checkedIn?: boolean;
  notes?: string;
  addedBy?: string; // Name of the user who suggested this guest
  village?: string; // Added village field
}

export interface Table {
  id: string;
  weddingId: string;
  name: string;
  capacity: number;
  shape: 'Round' | 'Rectangular';
}

export interface Vendor {
  id: string;
  weddingId: string;
  name: string;
  category: 'Venue' | 'Catering' | 'Photo' | 'Music' | 'Decor' | 'Other';
  status: 'Draft' | 'Signed' | 'Paid';
  cost: number;
  paid: number;
  dueDate: string;
  contactName?: string;
  phone?: string;
  email?: string;
}

export interface Task {
  id: string;
  weddingId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  assignedTo: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface Viewer {
  weddingId: string;
  name: string;
  timestamp: string;
}

export interface WeddingStats {
  totalGuests: number;
  confirmedGuests: number;
  totalMen: number;
  totalWomen: number;
  totalChildren: number;
  totalBudget: number;
  spentBudget: number;
  daysToGo: number;
  completedTasks: number;
  totalTasks: number;
}