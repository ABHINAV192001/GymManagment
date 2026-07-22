/**
 * GymOS — Complete Global TypeScript Types & Rich Baseline Mock Data
 * Supporting multi-tenant scoping, high accessibility states, and all 16 core modules.
 */

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  phone: string;
  email: string;
  gstin: string;
  subscriptionTier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  is_active: boolean;
}

// Mirrors com.gymbross.usermanagement.dto.BranchDtos.BranchResponse — the backend
// does not store/return address, city, capacity, hours, etc. Keep this in sync
// with the actual API response, not a wishlist of fields.
export interface Branch {
  id: string;
  orgId: string;
  branchCode: string;
  username: string;
  name: string;
  adminEmail: string;
  isActive: boolean;
  adminUserId?: string;
}

// Mirrors com.gymbross.usermanagement.dto.AdminDashboardDtos.UserDetailDto — the actual
// shape returned by GET /api/admin/dashboard/users. Fields like gender, address, health
// conditions, plan assignment, body metrics, and activity timelines are NOT persisted by
// the backend; don't reintroduce them here without a real endpoint behind them.
export interface Member {
  id: string;
  branchId?: string;
  userCode: string;
  username: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  dob?: string;
  plan?: string | null;
  amountPaid?: number | null;
  trainerName?: string | null;
  trainerCode?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  attendanceCount?: number;
  isActive: boolean;
  isEmailVerified: boolean;
  status: string; // "Active" | "Expired" — computed server-side from isActive
  role?: string | null;
  accessibleBranchIds?: string[];
}

export interface Staff {
  id: string;
  code?: string;
  username?: string;
  orgId: string;
  branchId: string;
  accessibleBranchIds?: string[];
  role: 'BRANCH_ADMIN' | 'TRAINER' | 'RECEPTIONIST' | 'MANAGER';
  name: string;
  email: string;
  phone: string;
  profilePhotoUrl?: string;
  gender: string;
  dob: string;
  address: string;
  joiningDate: string;
  salaryType: 'FIXED' | 'COMMISSION' | 'HYBRID';
  baseSalary: number;
  commissionRate?: number;
  certifications: string[];
  specializations: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
}

export interface Plan {
  id: string;
  orgId: string;
  branchId?: string; // null = global
  name: string;
  description: string;
  durationDays: number;
  price: number;
  currency: string;
  planType: 'STANDARD' | 'PRIME_PT' | 'PREMIUM' | 'BASIC';
  features: {
    gymAccess: boolean;
    classAccess: boolean;
    ptSessions: number;
    dietPlanAccess: boolean;
    appAccess: boolean;
  };
  is_active: boolean;
}

export interface Payment {
  id: string;
  orgId: string;
  branchId: string;
  userId?: string; // member reference
  staffId?: string; // staff reference
  paymentType: 'MEMBERSHIP' | 'PT_PACKAGE' | 'SALARY' | 'UTILITY' | 'EQUIPMENT';
  amount: number;
  currency: string;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
  referenceNo?: string;
  paymentDate: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  orgId: string;
  branchId: string;
  name: string;
  category: 'CARDIO' | 'STRENGTH' | 'STUDIO' | 'FACILITY' | 'CONSUMABLE';
  brand: string;
  modelNo?: string;
  serialNo?: string;
  purchaseDate: string;
  purchasePrice: number;
  warrantyExpiry: string;
  quantity: number;
  status: 'WORKING' | 'MAINTENANCE' | 'BROKEN' | 'DISPOSED';
  lastServiceDate?: string;
  nextServiceDate?: string;
  notes?: string;
}

export interface Activity {
  id: string;
  orgId: string;
  branchId: string;
  name: string;
  type: 'ZUMBA' | 'YOGA' | 'HIIT' | 'FAT_LOSS' | 'SPINNING';
  description: string;
  durationMins: number;
  maxCapacity: number;
  instructorId: string;
  visibility: 'ALL' | 'PREMIUM' | 'PT_ONLY';
  colorHex: string;
  is_active: boolean;
}

export interface ActivitySchedule {
  id: string;
  activityId: string;
  orgId: string;
  branchId: string;
  scheduledAt: string; // ISO String
  durationMins: number;
  location: string;
  currentCount: number;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  bookings: string[]; // memberIds
}

export interface FoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  unit: string;
  isGlobal: boolean;
}

export interface DietMeal {
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  timeLabel: string;
  foods: { foodId: string; quantityG: number; notes?: string }[];
}

export interface DietPlan {
  id: string;
  name: string;
  assignedTo: string;
  createdBy: string;
  goal: string;
  meals: DietMeal[];
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  description?: string;
}

export interface WorkoutDay {
  dayNumber: number;
  dayLabel: string;
  exercises: { exerciseId: string; sets: number; reps: string; weightKg: number }[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  assignedTo: string;
  createdBy: string;
  splitType: string;
  days: WorkoutDay[];
  notes?: string;
}

export interface ChatMessage {
  id: string;
  senderType: 'USER' | 'STAFF';
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'BOTH';
  category: 'PAYMENT' | 'EXPIRY' | 'PROMOTIONAL' | 'CLASS';
  subject?: string;
  body: string;
}

export interface NotificationLog {
  id: string;
  templateName: string;
  recipientName: string;
  channel: 'WHATSAPP' | 'EMAIL';
  body: string;
  status: 'SENT' | 'FAILED';
  sentAt: string;
}

export interface RolePermissions {
  roleName: string;
  permissions: { [module: string]: string[] }; // e.g. { 'USERS': ['VIEW', 'CREATE', 'EDIT'] }
}

// Global Accessibility State
export interface AccessibilitySettings {
  theme: 'dark' | 'light' | 'high-contrast-dark' | 'high-contrast-light';
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  dyslexicFont: boolean;
      gymAccess: true,
}
