/**
 * GymOS — Complete Global TypeScript Types & Rich Baseline Mock Data
 * Supporting multi-tenant scoping, high accessibility states, and all 16 core modules.
 */

export interface Organization {
  id: string;
  name: string;
  orgCode?: string;
  username?: string;
  ownerEmail: string;
  phone: string;
  gst?: string;
  subscriptionTier?: 'BASIC' | 'PRO' | 'ENTERPRISE';
  isActive: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  logoUrl?: string;
  password?: string;
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
  defaultPtTrainerPercentage?: number;
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
  gender?: string;
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
  orgId?: string;
  branchId?: string;
  branchName?: string;
  accessibleBranchIds?: string[];
  role?: string;
  name: string;
  email: string;
  phone: string;
  profilePhotoUrl?: string;
  gender?: string;
  dob?: string;
  address?: string;
  joiningDate?: string;
  salaryType?: 'FIXED' | 'COMMISSION' | 'HYBRID';
  baseSalary?: number;
  salary?: number;
  commissionRate?: number;
  certifications?: string[];
  specializations?: string[];
  status?: 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | string;
  isPersonalTrainer?: boolean;
  ptTrainerPercentage?: number;
  designation?: string;
}

export interface Plan {
  id: string;
  orgId?: string;
  organizationId?: string;
  branchId?: string; // null = global
  name: string;
  description: string;
  durationDays: number;
  price: number;
  currency?: string;
  planType: 'STANDARD' | 'PRIME_PT' | 'PREMIUM' | 'BASIC';
  maxMembers?: number;
  sortOrder?: number;
  createdAt?: string;
  active: boolean;   // backend field name
  is_active?: boolean; // legacy alias
  deleted?: boolean;
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
  category?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  magnesiumMg?: number;
  calciumMg?: number;
  ironMg?: number;
  potassiumMg?: number;
  sodiumMg?: number;
  vitaminCMg?: number;
  vitaminDIu?: number;
  unit?: string;
  defaultServingGrams?: number;
  isGlobal?: boolean;
  isRecipe?: boolean;
  recipeIngredients?: string[];
  recipeInstructions?: string[];
  prepTimeMins?: number;
  tags?: string[];
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
  secondaryMuscles?: string;
  mechanics?: string;
  difficultyLevel?: string;
  recommendedSets?: number;
  recommendedReps?: string;
  restInterval?: string;
  executionSteps?: string;
  safetyTips?: string;
}

export interface WorkoutExerciseItem {
  id?: string;
  exerciseId: string;
  name?: string;
  muscleGroup?: string;
  mechanics?: string;
  description?: string;
  videoUrl?: string;
  sets: number;
  reps: string;
  time?: number;
  targetDays?: string; // e.g. "Monday,Wednesday,Friday"
}

export interface WorkoutDay {
  dayNumber: number;
  dayLabel: string;
  exercises: { exerciseId: string; sets: number; reps: string; weightKg?: number; targetDays?: string }[];
}

export interface WorkoutPlan {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  badge?: string;
  difficulty?: string;
  daysPerWeek?: number;
  calories?: number;
  duration?: string;
  image?: string;
  targetDays?: string;
  createdByUserId?: string;
  assignedTo?: string;
  createdBy?: string;
  splitType?: string;
  days?: WorkoutDay[];
  exercises?: WorkoutExerciseItem[];
  notes?: string;
}

export interface ChatMessage {
  id: string;
  senderType: 'USER' | 'STAFF';
  senderId: string;
  receiverId?: string;
  message: string;
  createdAt: string;
  edited?: boolean;
  senderUsername?: string;
  receiverUsername?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  content: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'BOTH';
  isActive: boolean;
  createdAt?: string;
}

export interface NotificationLog {
  id: string;
  templateId?: string;
  recipient: string;
  targetRole?: string;
  channel: 'WHATSAPP' | 'EMAIL' | string;
  content: string;
  status: 'SENT' | 'FAILED' | string;
  createdAt: string;
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
  gymAccess?: boolean;
}
