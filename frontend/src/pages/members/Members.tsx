import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Search, X, DollarSign, UserPlus, Printer, Mail, Phone as PhoneIcon, 
  Edit, Trash2, Calendar, User, CheckCircle2, AlertTriangle, 
  CreditCard, Eye, Award, Activity, Building2, Sparkles, ShieldCheck, AlertCircle,
  CalendarCheck, Clock, LogOut, Check, Loader2, Filter, RotateCcw,
  MessageCircle, Share2, Copy, ExternalLink, Dumbbell, Utensils, Droplets, Flame, Apple, Send, GripVertical
} from 'lucide-react';
import { Member, Branch, Staff, Payment, Plan } from '../../types';
import { getUsers, createUser, updateUser, deleteUser, getAdminBranches, getStaff, resendPasswordNotification, getWhatsAppInviteUrl } from '../../lib/api/admin';
import { getPayments, createPayment } from '../../lib/api/accounts';
import { getRoles as getRbacRoles } from '../../lib/api/rbac';
import { getPlans } from '../../lib/api/plans';
import { getUserAttendance, checkIn, checkOut } from '../../lib/api/attendance';
import { sendNotification, testAccountWelcomeWhatsApp } from '../../lib/api/notifications';
import { getUserDietPlans, assignUserDietPlan, getFoods } from '../../lib/api/diets';
import { getUserWorkoutPlan, updateUserWorkoutPlan } from '../../lib/api/workouts';
import { usePermissions } from '../../lib/usePermissions';
import { SearchableSelect } from '../../components/shared/SearchableSelect';
import { getMyOrg } from '../../lib/api/organizations';

export const MembersInternal: React.FC = () => {
  const outletContext = useOutletContext<{ selectedBranchId?: string; triggerAnnouncement?: (msg: string) => void }>() || {};
  const selectedBranchId = outletContext.selectedBranchId || 'ALL';
  const triggerAnnouncementFn = outletContext.triggerAnnouncement;

  const triggerAnnouncement = React.useCallback((msg: string) => {
    if (typeof triggerAnnouncementFn === 'function') {
      triggerAnnouncementFn(msg);
    } else {
      console.log(`[Announcement] ${msg}`);
    }
  }, [triggerAnnouncementFn]);

  const { canCreate, canEdit, canDelete } = usePermissions();

  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [availableRoles, setAvailableRoles] = useState<{ id: string; name: string }[]>([]);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [orgName, setOrgName] = useState<string>('GYMBROSS');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [staffFilter, setStaffFilter] = useState<'ALL' | 'STAFF' | 'MEMBERS'>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [startDateFrom, setStartDateFrom] = useState<string>('');
  const [startDateTo, setStartDateTo] = useState<string>('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState<{
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }>({ page: 0, size: 10, totalElements: 0, totalPages: 1, hasNext: false, hasPrev: false });

  // Modal & Drawer Component States (Declared BEFORE any useEffect hooks)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [inviteModalData, setInviteModalData] = useState<{ isOpen: boolean; memberName: string; phone: string; email: string; inviteLink: string; whatsAppUrl: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'workout_diet' | 'payments' | 'attendance' | 'card'>('overview');

  // Resizable Member Profile Drawer States & Handlers
  const [drawerWidth, setDrawerWidth] = useState<number>(640);
  const [isResizingDrawer, setIsResizingDrawer] = useState<boolean>(false);
  const isResizingRef = useRef(false);

  const startResizingDrawer = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    isResizingRef.current = true;
    setIsResizingDrawer(true);
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = window.innerWidth - e.clientX;
      const minWidth = 380;
      const maxWidth = Math.max(minWidth, window.innerWidth - 40);
      const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      setDrawerWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      setIsResizingDrawer(false);
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  const startResizingDrawerTouch = useCallback((touchStartEvent: React.TouchEvent) => {
    isResizingRef.current = true;
    setIsResizingDrawer(true);
    document.body.style.userSelect = 'none';

    const handleTouchMove = (e: TouchEvent) => {
      if (!isResizingRef.current || !e.touches[0]) return;
      const newWidth = window.innerWidth - e.touches[0].clientX;
      const minWidth = 320;
      const maxWidth = Math.max(minWidth, window.innerWidth - 20);
      const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      setDrawerWidth(clampedWidth);
    };

    const handleTouchEnd = () => {
      isResizingRef.current = false;
      setIsResizingDrawer(false);
      document.body.style.userSelect = '';
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  }, []);

  const handleDoubleClickResize = useCallback(() => {
    const defaultWidth = 640;
    const expandedWidth = Math.min(1100, Math.floor(window.innerWidth * 0.85));
    setDrawerWidth(prev => (prev > 720 ? defaultWidth : expandedWidth));
  }, []);

  // Workout & Diet Prescription & Progress States for Member Modal
  const [prescribedWorkout, setPrescribedWorkout] = useState('Push / Pull / Legs Hypertrophy (4 Days/wk)');
  const [prescribedWorkoutNotes, setPrescribedWorkoutNotes] = useState('Focus on progressive overload. 4 sets x 10-12 reps per exercise.');
  const [prescribedWaterMl, setPrescribedWaterMl] = useState(3000);
  const [prescribedCalories, setPrescribedCalories] = useState(2400);
  const [prescribedProtein, setPrescribedProtein] = useState(160);
  const [prescribedCarbs, setPrescribedCarbs] = useState(240);
  const [prescribedFat, setPrescribedFat] = useState(65);
  const [trainerAdviceNotes, setTrainerAdviceNotes] = useState('Drink 500ml water pre-workout. Ensure 8h sleep for optimal muscle recovery.');
  const [isSendingPlan, setIsSendingPlan] = useState(false);
  const [planSentSuccess, setPlanSentSuccess] = useState(false);

  // Dynamic Backend Data States
  const [backendDietPlans, setBackendDietPlans] = useState<any[]>([]);
  const [backendWorkoutPlan, setBackendWorkoutPlan] = useState<string[]>([]);
  const [backendFoods, setBackendFoods] = useState<any[]>([]);
  const [isLoadingWorkoutDietData, setIsLoadingWorkoutDietData] = useState<boolean>(false);

  const [userAttendanceLogs, setUserAttendanceLogs] = useState<any[]>([]);
  const [totalAttendanceCount, setTotalAttendanceCount] = useState<number>(0);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State & Validations
  const [newMember, setNewMember] = useState({
    role: '',
    plan: '',
    isStaff: false,
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    amountPaid: '',
    startDate: new Date().toISOString().split('T')[0],
    trainerCode: '',
    branchId: '',
    accessibleBranchIds: [] as string[],
  });

  const [formErrors, setFormErrors] = useState<{ role?: string; name?: string; phone?: string; email?: string; gender?: string; [key: string]: string | undefined }>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  // Edit & Delete States
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [editFormErrors, setEditFormErrors] = useState<{ role?: string; name?: string; phone?: string; email?: string; gender?: string }>({});
  const [editFormErrorMessage, setEditFormErrorMessage] = useState<string | null>(null);
  const [editMemberData, setEditMemberData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    startDate: '',
    endDate: '',
    plan: '',
    status: 'Active',
    amountPaid: '',
    attendanceCount: '0',
    trainerCode: '',
    branchId: '',
    role: 'USER',
  });

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER'>('UPI');

  // Top 1% High-Performance Memoized Computations (Google/Microsoft Standard)
  const branchNameMap = React.useMemo(() => {
    const map = new Map<string, string>();
    branches.forEach(b => map.set(b.id, b.name));
    return map;
  }, [branches]);

  const memberMetrics = React.useMemo(() => {
    let active = 0;
    let expired = 0;
    let totalPaid = 0;
    members.forEach(m => {
      if (m.isActive) active++;
      else expired++;
      if (m.amountPaid) totalPaid += m.amountPaid;
    });
    return { active, expired, totalPaid, total: members.length };
  }, [members]);

  const fetchMembers = React.useCallback(() => {
    let isStaffParam: boolean | undefined = undefined;
    if (staffFilter === 'STAFF') isStaffParam = true;
    if (staffFilter === 'MEMBERS') isStaffParam = false;

    getUsers({
      search: search.trim() || undefined,
      role: roleFilter !== 'ALL' ? roleFilter : undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      isStaff: isStaffParam,
      filterBranchId: branchFilter !== 'ALL' ? branchFilter : (selectedBranchId !== 'ALL' ? selectedBranchId : undefined),
      startDateFrom: startDateFrom || undefined,
      startDateTo: startDateTo || undefined,
      page: page,
      size: pageSize,
    }).then(res => {
      setMembers(Array.isArray(res?.members) ? res.members : []);
      if (res?.pagination) setPaginationInfo(res.pagination);
    }).catch(err => {
      if (typeof triggerAnnouncementFn === 'function') {
        triggerAnnouncementFn(`Failed to load members: ${err.message}`);
      } else {
        console.error(`Failed to load members: ${err.message}`);
      }
    });
  }, [search, roleFilter, statusFilter, staffFilter, branchFilter, selectedBranchId, startDateFrom, startDateTo, page, pageSize, triggerAnnouncementFn]);

  const refreshMembers = fetchMembers;

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Pre-load all form metadata on mount so dropdowns are ready instantly when the form opens
  useEffect(() => {
    const loadMetadata = () => {
      Promise.allSettled([getAdminBranches(), getStaff(), getPayments(), getRbacRoles(), getPlans(), getMyOrg()])
        .then((results) => {
          // Extract array regardless of API wrapper shape
          const extractData = (val: any): any[] => {
            if (Array.isArray(val)) return val;
            if (val && Array.isArray(val.data)) return val.data;
            if (val && Array.isArray(val.content)) return val.content;
            return [];
          };

          const brs      = extractData(results[0].status === 'fulfilled' ? results[0].value : []);
          const rawStaff = extractData(results[1].status === 'fulfilled' ? results[1].value : []);
          const pays     = extractData(results[2].status === 'fulfilled' ? results[2].value : []);
          const rawRoles = extractData(results[3].status === 'fulfilled' ? results[3].value : []);
          const plns     = extractData(results[4].status === 'fulfilled' ? results[4].value : []);
          const orgRes   = results[5].status === 'fulfilled' ? results[5].value : null;

          if (orgRes && orgRes.name && orgRes.name.trim() !== '') {
            setOrgName(orgRes.name.trim());
          }

          // Normalize staff: backend may return phoneNumber instead of phone, staffCode instead of code
          const normalizedStaff = rawStaff.map((s: any) => {
            const branchObj = brs.find((b: any) => b.id === s.branchId);
            return {
              ...s,
              phone: s.phone || s.phoneNumber || '',
              code: s.code || s.staffCode || s.trainerCode || s.userCode || s.id || '',
              branchName: s.branchName || branchObj?.name || '',
            };
          });

          setBranches(brs);
          setStaff(normalizedStaff);
          setPayments(pays);
          setAvailablePlans(plns);

          // Deduplicate roles by name
          const uniqueRoles: { id: string; name: string }[] = [];
          const seenNames = new Set<string>();
          rawRoles.forEach((r: any) => {
            if (r && r.name) {
              const key = r.name.trim().toUpperCase();
              if (!seenNames.has(key)) {
                seenNames.add(key);
                uniqueRoles.push(r);
              }
            }
          });
          setAvailableRoles(uniqueRoles);

          const errors = results.filter(r => r.status === 'rejected') as PromiseRejectedResult[];
          if (errors.length > 0) {
            console.error('[Members] Metadata load errors:', errors.map((e) => e.reason?.message));
          }
        })
        .catch(err => console.error('[Members] Failed to load metadata:', err.message));
    };

    loadMetadata();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount — data is stable for the session


  const fetchUserAttendanceLogs = React.useCallback(async (userId: string) => {
    setIsLoadingAttendance(true);
    try {
      const res = await getUserAttendance(userId);
      const logs = Array.isArray(res?.logs) ? res.logs : [];
      const total = res?.totalElements ?? logs.length;
      setUserAttendanceLogs(logs);
      setTotalAttendanceCount(total);
      setSelectedMember(prev => prev ? { ...prev, attendanceCount: total } : null);
    } catch (err: any) {
      console.error('Failed to load user attendance', err);
    } finally {
      setIsLoadingAttendance(false);
    }
  }, []);

  useEffect(() => {
    if (selectedMember && selectedMember.id) {
      fetchUserAttendanceLogs(selectedMember.id);
      
      // Fetch dynamic backend diet & workout plans
      const fetchBackendMemberData = async () => {
        setIsLoadingWorkoutDietData(true);
        try {
          const [diets, workouts, foods] = await Promise.all([
            getUserDietPlans(selectedMember.id).catch(() => []),
            getUserWorkoutPlan(selectedMember.id).catch(() => []),
            getFoods().catch(() => [])
          ]);

          setBackendDietPlans(diets);
          setBackendWorkoutPlan(workouts);
          setBackendFoods(foods);

          // If backend has assigned diet plans, populate inputs
          if (Array.isArray(diets) && diets.length > 0) {
            const latestDiet = diets[0];
            if (latestDiet.foodName) setPrescribedWorkout(latestDiet.foodName);
            if (latestDiet.description) setTrainerAdviceNotes(latestDiet.description);
          }

          // If backend has workout items, populate notes
          if (Array.isArray(workouts) && workouts.length > 0) {
            setPrescribedWorkoutNotes(workouts.join(', '));
          }
        } catch (e) {
          console.warn('Backend load error:', e);
        } finally {
          setIsLoadingWorkoutDietData(false);
        }
      };

      fetchBackendMemberData();

      // Load saved local prescription settings as fallback
      const saved = localStorage.getItem(`gym_prescription_${selectedMember.id}`);
      if (saved) {
        try {
          const p = JSON.parse(saved);
          if (p.prescribedWorkout) setPrescribedWorkout(p.prescribedWorkout);
          if (p.prescribedWorkoutNotes) setPrescribedWorkoutNotes(p.prescribedWorkoutNotes);
          if (p.prescribedWaterMl) setPrescribedWaterMl(p.prescribedWaterMl);
          if (p.prescribedCalories) setPrescribedCalories(p.prescribedCalories);
          if (p.prescribedProtein) setPrescribedProtein(p.prescribedProtein);
          if (p.prescribedCarbs) setPrescribedCarbs(p.prescribedCarbs);
          if (p.prescribedFat) setPrescribedFat(p.prescribedFat);
          if (p.trainerAdviceNotes) setTrainerAdviceNotes(p.trainerAdviceNotes);
        } catch (e) {
          // ignore
        }
      }
    }
  }, [selectedMember?.id, fetchUserAttendanceLogs]);

  const handleSendPrescriptionPlan = async () => {
    if (!selectedMember) return;
    setIsSendingPlan(true);

    const planPayload = {
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      prescribedWorkout,
      prescribedWorkoutNotes,
      prescribedWaterMl,
      prescribedCalories,
      prescribedProtein,
      prescribedCarbs,
      prescribedFat,
      trainerAdviceNotes,
      updatedAt: new Date().toISOString(),
    };

    // Save to local storage persistence
    localStorage.setItem(`gym_prescription_${selectedMember.id}`, JSON.stringify(planPayload));

    // Save to real Spring Boot backend endpoints
    try {
      await Promise.all([
        updateUserWorkoutPlan(selectedMember.id, [prescribedWorkout, prescribedWorkoutNotes]).catch(err => console.warn('Workout update API warn:', err)),
        assignUserDietPlan(selectedMember.id, {
          foodName: prescribedWorkout,
          description: trainerAdviceNotes,
          timingFood: `Target: ${prescribedCalories} kcal, ${prescribedProtein}g Protein, ${prescribedWaterMl}mL Water`
        }).catch(err => console.warn('Diet assign API warn:', err))
      ]);
    } catch (e) {
      console.warn('Backend persistence note:', e);
    }

    // Trigger announcement
    triggerAnnouncement(`[Prescription Updated]: Trainer assigned new Detailed Workout & Diet plan for ${selectedMember.name}`);

    try {
      await sendNotification({
        recipient: selectedMember.email || selectedMember.phone || selectedMember.userCode || selectedMember.id,
        content: `Your Gym Trainer has updated your Detailed Workout & Diet Plan! Target Calories: ${prescribedCalories} kcal, Protein: ${prescribedProtein}g. Routine: ${prescribedWorkout}`,
        channel: 'BOTH',
      });
    } catch (err) {
      console.warn('Send notification error:', err);
    }

    setTimeout(() => {
      setIsSendingPlan(false);
      setPlanSentSuccess(true);
      setTimeout(() => setPlanSentSuccess(false), 4000);
    }, 600);
  };

  const handleCheckInMember = async () => {
    if (!selectedMember) return;
    try {
      setIsSubmitting(true);
      await checkIn(selectedMember.id, selectedMember.branchId);
      triggerAnnouncement(`Attendance marked for ${selectedMember.name}`);
      setSelectedMember(prev => prev ? { ...prev, attendanceCount: (prev.attendanceCount || 0) + 1 } : null);
      fetchUserAttendanceLogs(selectedMember.id);
      refreshMembers();
    } catch (err: any) {
      triggerAnnouncement(`Attendance note: ${err.message || 'Attendance already marked active'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOutMember = async () => {
    if (!selectedMember) return;
    try {
      setIsSubmitting(true);
      await checkOut(selectedMember.id);
      triggerAnnouncement(`Attendance session completed for ${selectedMember.name}`);
      fetchUserAttendanceLogs(selectedMember.id);
      refreshMembers();
    } catch (err: any) {
      triggerAnnouncement(`Attendance note: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form Validation Logic
  const validateMemberForm = (
    data: { name: string; phone: string; email?: string; role?: string; gender?: string },
    isEdit = false
  ) => {
    const errors: { name?: string; phone?: string; email?: string; role?: string; gender?: string } = {};

    if (!data.name || data.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }

    if (!isEdit && !data.gender) {
      errors.gender = 'Gender is required.';
    }

    const cleanPhone = data.phone ? data.phone.trim() : '';
    if (!cleanPhone) {
      errors.phone = 'Phone number is required.';
    } else if (!/^[0-9]{10}$/.test(cleanPhone)) {
      errors.phone = 'Phone number must be exactly 10 digits (e.g. 9876543210).';
    }

    if (data.email && data.email.trim() !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errors.email = 'Please enter a valid email address (e.g. user@domain.com).';
      }
    }

    return errors;
  };

  // Open Edit Modal with current member data
  const openEditModal = (member: Member, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditFormErrors({});
    setEditFormErrorMessage(null);
    setMemberToEdit(member);
    setEditMemberData({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      gender: member.gender || 'MALE',
      dob: member.dob || '',
      startDate: member.startDate || new Date().toISOString().split('T')[0],
      endDate: member.endDate || '',
      plan: member.plan || '',
      status: member.status || (member.isActive ? 'Active' : 'Inactive'),
      amountPaid: member.amountPaid != null ? String(member.amountPaid) : '0',
      attendanceCount: member.attendanceCount != null ? String(member.attendanceCount) : '0',
      trainerCode: member.trainerCode || '',
      branchId: member.branchId || '',
      role: member.role || 'USER',
    });
    setIsEditFormOpen(true);
  };

  const closeEditModal = () => {
    setIsEditFormOpen(false);
    setMemberToEdit(null);
    setEditFormErrors({});
    setEditFormErrorMessage(null);
  };

  const currentUserId = useMemo(() => {
    try {
      const saved = localStorage.getItem('gymos_user_profile') || localStorage.getItem('gymos_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed?.id || parsed?.userId || null;
      }
    } catch {}
    return null;
  }, []);

  const currentUserEmail = useMemo(() => {
    try {
      const saved = localStorage.getItem('gymos_user_profile') || localStorage.getItem('gymos_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return (parsed?.email || '').toLowerCase().trim();
      }
    } catch {}
    return '';
  }, []);

  const isSelf = useCallback((m: Member | null | undefined): boolean => {
    if (!m) return false;
    if (currentUserId && m.id === currentUserId) return true;
    if (currentUserEmail && m.email && m.email.toLowerCase().trim() === currentUserEmail) return true;
    return false;
  }, [currentUserId, currentUserEmail]);

  // Open Delete Confirmation Modal
  const openDeleteModal = (member: Member, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isSelf(member)) {
      triggerAnnouncement('You cannot delete your own user account.');
      return;
    }
    setMemberToDelete(member);
    setIsDeleteConfirmOpen(true);
  };

  const handleResendPasswordNotification = async (member: Member, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!member.email) {
      triggerAnnouncement(`Cannot send password notification: ${member.name} has no email registered.`);
      return;
    }
    try {
      const res = await resendPasswordNotification(member.id);
      const inviteLink = res?.inviteLink || `${window.location.origin}/auth/register/join?u=${member.userCode || member.id}&email=${encodeURIComponent(member.email || '')}`;
      const whatsAppUrl = getWhatsAppInviteUrl(member.phone, inviteLink, member.name);

      setInviteModalData({
        isOpen: true,
        memberName: member.name,
        phone: member.phone,
        email: member.email,
        inviteLink,
        whatsAppUrl
      });
      triggerAnnouncement(`Password setup link ready for ${member.name}!`);
    } catch (err: any) {
      triggerAnnouncement(`Failed to send password notification: ${err.message}`);
    }
  };

  const handleSendWhatsAppInvite = async (member: Member, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!member.phone || member.phone.trim() === '') {
      triggerAnnouncement(`❌ Cannot send WhatsApp: ${member.name} does not have a phone number registered.`);
      return;
    }
    try {
      triggerAnnouncement(`⏳ Generating password setup link for ${member.name}...`);
      const res = await resendPasswordNotification(member.id);
      let finalInviteLink = res?.inviteLink || `${window.location.origin}/auth/register/join?u=${member.userCode || member.id}&email=${encodeURIComponent(member.email || '')}`;
      if (finalInviteLink.includes('localhost')) {
        finalInviteLink = finalInviteLink.replace(/localhost/g, '127.0.0.1');
      }
      
      let cleanPhone = member.phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length === 10) {
        cleanPhone = `91${cleanPhone}`;
      }

      const activeGymName = (orgName && orgName.trim() !== '') ? orgName.trim() : 'GYMBROSS';
      const gymNameUpper = activeGymName.toUpperCase();

      const messageText = `🏋️‍♂️ *WELCOME TO ${gymNameUpper} PLATFORM*

Hello *${member.name}*,
Your *${activeGymName}* account has been created successfully!

📋 *Account Credentials:*
• *Username / Email:* ${member.email || 'N/A'}
• *Role:* ${member.role || 'MEMBER'}
• *Setup Password Link:*
${finalInviteLink}

👉 Please click the link above to activate your account and set your login password.

💪 Stay strong and keep crushing your fitness goals!`;

      const whatsAppUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;
      window.open(whatsAppUrl, '_blank');
      triggerAnnouncement(`✅ Opening WhatsApp Web for ${member.name}...`);
    } catch (err: any) {
      console.warn('WhatsApp link generation error:', err);
      triggerAnnouncement(`❌ Failed to generate WhatsApp link: ${err.message}`);
    }
  };

  // Filters (safely excludes logged-in user from member list)
  const filteredMembers = members.filter((m) => {
    if (isSelf(m)) return false;
    const matchesBranch = selectedBranchId === 'ALL' || m.branchId === selectedBranchId;
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.phone.includes(search) || 
                          (m.email && m.email.toLowerCase().includes(search.toLowerCase())) ||
                          (m.userCode && m.userCode.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' ||
                          (statusFilter === 'ACTIVE' && m.isActive) ||
                          (statusFilter === 'INACTIVE' && !m.isActive);
    return matchesBranch && matchesSearch && matchesStatus;
  });

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitAttempted(true);

    const errors = validateMemberForm(newMember);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setFormErrorMessage('Please resolve the highlighted validation errors above.');
      return;
    }

    setFormErrorMessage(null);
    setIsSubmitting(true);
    try {
      const createdUser = await createUser({
        role: newMember.role,
        plan: newMember.plan || undefined,
        isStaff: newMember.isStaff,
        name: newMember.name.trim(),
        email: newMember.email ? newMember.email.trim() : undefined,
        phone: newMember.phone.trim(),
        gender: newMember.gender,
        dob: newMember.dob || undefined,
        amountPaid: newMember.amountPaid ? Number(newMember.amountPaid) : undefined,
        startDate: newMember.startDate || undefined,
        trainerCode: newMember.trainerCode || undefined,
        branchId: newMember.branchId || (selectedBranchId === 'ALL' ? undefined : selectedBranchId),
        accessibleBranchIds: newMember.accessibleBranchIds.length > 0 ? newMember.accessibleBranchIds : undefined,
      });

      await refreshMembers();
      setIsFormOpen(false);
      const registeredName = newMember.name;
      setNewMember({ role: '', plan: '', isStaff: false, name: '', email: '', phone: '', gender: '', dob: '', amountPaid: '', startDate: new Date().toISOString().split('T')[0], trainerCode: '', branchId: '', accessibleBranchIds: [] });
      setFormErrors({});
      setTouchedFields({});
      setIsSubmitAttempted(false);
      triggerAnnouncement(`${registeredName} registered successfully with role "${newMember.role}".`);
    } catch (err: any) {
      setFormErrorMessage(err.message);
      triggerAnnouncement(`Registration Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = memberToEdit || selectedMember;
    if (!targetMember) {
      setEditFormErrorMessage("No member selected for updating.");
      return;
    }

    const errors = validateMemberForm({
      name: editMemberData.name,
      phone: editMemberData.phone,
      email: editMemberData.email,
      role: editMemberData.role,
      gender: editMemberData.gender,
    }, true);

    setEditFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setEditFormErrorMessage(Object.values(errors)[0] || 'Please resolve the highlighted validation errors.');
      return;
    }

    setEditFormErrorMessage(null);
    setIsSubmitting(true);
    try {
      await updateUser(targetMember.id, {
        name: editMemberData.name.trim(),
        email: editMemberData.email ? editMemberData.email.trim() : undefined,
        phone: editMemberData.phone.trim(),
        gender: editMemberData.gender || undefined,
        dob: editMemberData.dob || undefined,
        startDate: editMemberData.startDate || undefined,
        endDate: editMemberData.endDate || undefined,
        plan: editMemberData.plan || undefined,
        status: editMemberData.status || undefined,
        amountPaid: editMemberData.amountPaid ? Number(editMemberData.amountPaid) : 0,
        attendanceCount: editMemberData.attendanceCount ? Number(editMemberData.attendanceCount) : 0,
        trainerCode: editMemberData.trainerCode || undefined,
        branchId: editMemberData.branchId || undefined,
        role: editMemberData.role || 'USER',
      });

      await refreshMembers();

      const updatedTrainerName = staff.find(s => s.code === editMemberData.trainerCode || s.id === editMemberData.trainerCode)?.name || targetMember.trainerName;
      const updated: Member = {
        ...targetMember,
        name: editMemberData.name,
        email: editMemberData.email,
        phone: editMemberData.phone,
        gender: editMemberData.gender,
        dob: editMemberData.dob,
        startDate: editMemberData.startDate,
        endDate: editMemberData.endDate,
        plan: editMemberData.plan,
        status: editMemberData.status,
        isActive: editMemberData.status === 'Active',
        amountPaid: editMemberData.amountPaid ? Number(editMemberData.amountPaid) : 0,
        attendanceCount: editMemberData.attendanceCount ? Number(editMemberData.attendanceCount) : 0,
        trainerCode: editMemberData.trainerCode,
        trainerName: updatedTrainerName,
        branchId: editMemberData.branchId,
        role: editMemberData.role,
      };
      if (selectedMember?.id === targetMember.id) {
        setSelectedMember(updated);
      }
      setIsEditFormOpen(false);
      setMemberToEdit(null);
      setEditFormErrors({});
      setEditFormErrorMessage(null);
      triggerAnnouncement(`Member profile for "${editMemberData.name}" updated successfully.`);
    } catch (err: any) {
      setEditFormErrorMessage(err.message || 'Failed to update member profile.');
      triggerAnnouncement(`Update Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteUser(memberToDelete.id);
      await refreshMembers();
      if (selectedMember?.id === memberToDelete.id) {
        setSelectedMember(null);
      }
      triggerAnnouncement(`Member "${memberToDelete.name}" deleted successfully.`);
      setIsDeleteConfirmOpen(false);
      setMemberToDelete(null);
    } catch (err: any) {
      triggerAnnouncement(`Delete Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Record payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !payAmount) return;

    const pAmt = Number(payAmount);
    setIsSubmitting(true);
    try {
      const newPay = await createPayment({
        branchId: selectedMember.branchId,
        userId: selectedMember.id,
        paymentType: 'MEMBERSHIP',
        amount: pAmt,
        currency: 'INR',
        paymentMode: payMode,
        referenceNo: `TXN${Math.floor(Math.random() * 100000)}`,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'COMPLETED',
        notes: 'Manual desk payment logged in app.',
      });

      setPayments([...payments, newPay]);
      setPayAmount('');
      triggerAnnouncement(`Payment of ₹${pAmt} recorded for ${selectedMember.name}.`);
    } catch (err: any) {
      triggerAnnouncement(`Payment Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const branchName = (branchId?: string) => branches.find(b => b.id === branchId)?.name || 'Headquarters';

  return (
    <div className="space-y-6">
      {/* Directory Header & Dynamic Filters */}
      {(() => {
        const activeFilterCount = (roleFilter !== 'ALL' ? 1 : 0) + 
          (statusFilter !== 'ALL' ? 1 : 0) + 
          (staffFilter !== 'ALL' ? 1 : 0) + 
          (branchFilter !== 'ALL' ? 1 : 0) + 
          (startDateFrom ? 1 : 0) + 
          (startDateTo ? 1 : 0);

        const handleResetFilters = () => {
          setRoleFilter('ALL');
          setStatusFilter('ALL');
          setStaffFilter('ALL');
          setBranchFilter('ALL');
          setStartDateFrom('');
          setStartDateTo('');
          setPage(0);
        };

        return (
          <div className="p-4 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-3">
            {/* Primary Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search members by name, phone, email, or code..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/80 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  aria-label="Search members"
                />
              </div>

              {/* Mobile Filter Toggle & Add Member Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ${
                    showMobileFilters || activeFilterCount > 0
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                  aria-expanded={showMobileFilters}
                  aria-label="Toggle directory filter controls"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-black">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-500 hover:text-red-600 transition"
                    title="Reset all active filters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

                {canCreate('users') && (
                  <button
                    onClick={() => {
                      setFormErrors({});
                      setTouchedFields({});
                      setIsSubmitAttempted(false);
                      setFormErrorMessage(null);
                      setIsFormOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-sm shadow-blue-500/20 active:scale-[0.98] shrink-0"
                    aria-haspopup="dialog"
                  >
                    <UserPlus className="w-4 h-4" /> <span>Add Member</span>
                  </button>
                )}
              </div>
            </div>

            {/* Secondary Filter Controls Grid (Collapsible on mobile/tablet, expandable on toggle) */}
            <div className={`${showMobileFilters ? 'grid' : 'hidden xl:grid'} grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-zinc-150 dark:border-zinc-800/80`}>
              {/* ROLE FILTER */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-0.5">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
                  className="w-full text-xs px-2.5 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/40 font-medium"
                >
                  <option value="ALL">All Roles</option>
                  {availableRoles.map(r => (
                    <option key={r.id || r.name} value={r.name}>{r.name.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              {/* STATUS FILTER */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-0.5">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value as any); setPage(0); }}
                  className="w-full text-xs px-2.5 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/40 font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Members</option>
                  <option value="INACTIVE">Inactive Members</option>
                </select>
              </div>

              {/* STAFF/MEMBER FILTER */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-0.5">Personnel</label>
                <select
                  value={staffFilter}
                  onChange={(e) => { setStaffFilter(e.target.value as any); setPage(0); }}
                  className="w-full text-xs px-2.5 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/40 font-medium"
                >
                  <option value="ALL">All Personnel</option>
                  <option value="MEMBERS">Gym Members</option>
                  <option value="STAFF">Staff Only</option>
                </select>
              </div>

              {/* BRANCH FILTER */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-0.5">Branch</label>
                <select
                  value={branchFilter}
                  onChange={(e) => { setBranchFilter(e.target.value); setPage(0); }}
                  className="w-full text-xs px-2.5 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/40 font-medium"
                >
                  <option value="ALL">All Branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* DATE RANGE: JOINED FROM */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-500" /> Joined From
                </label>
                <input
                  type="date"
                  value={startDateFrom}
                  onChange={(e) => { setStartDateFrom(e.target.value); setPage(0); }}
                  className="w-full text-xs px-2 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/40 font-medium"
                />
              </div>

              {/* DATE RANGE: JOINED TO */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400 mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-cyan-500" /> Joined To
                </label>
                <input
                  type="date"
                  value={startDateTo}
                  onChange={(e) => { setStartDateTo(e.target.value); setPage(0); }}
                  className="w-full text-xs px-2 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/40 font-medium"
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Directory Table Grid */}
      <section className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm" aria-label="Member List">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4">Member</th>
                <th className="p-4">Phone / Contact</th>
                <th className="p-4">Assigned Coach</th>
                <th className="p-4">Start Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-zinc-400">
                    <User className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">No members found</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Try adjusting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => { setSelectedMember(m); setActiveTab('overview'); }}
                    className="hover:bg-blue-50/40 dark:hover:bg-zinc-900/60 cursor-pointer transition-colors group"
                    tabIndex={0}
                    role="button"
                    aria-label={`View full profile details of ${m.name}`}
                  >
                    <td className="p-4 font-bold text-zinc-900 dark:text-zinc-50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shadow-blue-500/20 shrink-0">
                          {m.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-zinc-900 dark:text-zinc-100 font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {m.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-mono">{m.userCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-300 font-mono text-xs">
                      <div>{m.phone}</div>
                      {m.email && <div className="text-[10px] text-zinc-400 font-sans truncate max-w-[150px]">{m.email}</div>}
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-300">
                      {m.trainerName ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-medium text-[11px]">
                          <Award className="w-3 h-3" /> {m.trainerName}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px] font-normal">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-400 font-mono text-xs">
                      <div>{m.startDate || '—'}</div>
                      {m.endDate && <div className="text-[10px] text-zinc-400">Expires: {m.endDate}</div>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        m.status === 'Expired'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : m.isActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          m.status === 'Expired' ? 'bg-amber-500' : (m.isActive ? 'bg-emerald-500' : 'bg-zinc-400')
                        }`} />
                        {m.status || (m.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                          title="Resend Invite & Copy Setup Link"
                          onClick={(e) => handleResendPasswordNotification(m, e)}
                        >
                          <Mail className="w-4 h-4 text-indigo-500" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition"
                          title="Send Password Setup Link via WhatsApp"
                          onClick={(e) => handleSendWhatsAppInvite(m, e)}
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-500" />
                        </button>
                        {canEdit('users') && (
                          <button
                            onClick={(e) => openEditModal(m, e)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition"
                            title="Edit Member"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete('users') && (
                          <button
                            onClick={(e) => openDeleteModal(m, e)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Backend Pagination Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
          <span className="text-zinc-500 font-medium">
            Showing Page <span className="font-bold text-zinc-900 dark:text-zinc-100">{paginationInfo.page + 1}</span> of{' '}
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{paginationInfo.totalPages || 1}</span> ({paginationInfo.totalElements} total records)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!paginationInfo.hasPrev}
              onClick={() => setPage(prev => Math.max(0, prev - 1))}
              className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition shadow-sm active:scale-[0.98]"
            >
              Previous
            </button>
            
            <span className="px-3.5 py-1.5 font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-800/80">
              Page {paginationInfo.page + 1}
            </span>

            <button
              type="button"
              disabled={!paginationInfo.hasNext}
              onClick={() => setPage(prev => prev + 1)}
              className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition shadow-sm active:scale-[0.98]"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Slide-over Profile Details Panel */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="member-profile-title" onClick={() => setSelectedMember(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
            <div
              style={{ width: `${drawerWidth}px`, maxWidth: '96vw' }}
              className={`relative bg-white dark:bg-zinc-950 shadow-2xl flex flex-col justify-between border-l border-zinc-200 dark:border-zinc-800 ${
                isResizingDrawer ? 'select-none transition-none' : 'transition-all duration-75'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Adjustable Edge Drag Handle */}
              <div
                onMouseDown={startResizingDrawer}
                onTouchStart={startResizingDrawerTouch}
                onDoubleClick={handleDoubleClickResize}
                title="Click & Drag left edge to resize drawer width (Double-click to expand/reset)"
                className="absolute top-0 bottom-0 -left-3.5 w-7 cursor-ew-resize group flex items-center justify-center z-50 select-none"
              >
                {/* Visual Handle Pill */}
                <div className={`w-2 h-20 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isResizingDrawer
                    ? 'bg-blue-600 shadow-lg shadow-blue-500/50 h-28 scale-110'
                    : 'bg-zinc-400/80 dark:bg-zinc-600 group-hover:bg-blue-500 group-hover:h-24 group-hover:shadow-md'
                }`}>
                  <GripVertical className={`w-3.5 h-3.5 text-white transition-opacity ${
                    isResizingDrawer ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                  }`} />
                </div>
              </div>

              {/* Header */}
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 backdrop-blur">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                      {selectedMember.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 id="member-profile-title" className="font-bold text-zinc-900 dark:text-zinc-50 text-lg">
                          {selectedMember.name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          selectedMember.isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${selectedMember.isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                          {selectedMember.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                        Code: <span className="font-bold text-blue-600 dark:text-blue-400">{selectedMember.userCode}</span>
                      </p>
                    </div>
                  </div>

                  {/* Header Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleResendPasswordNotification(selectedMember, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl border border-indigo-200 dark:border-indigo-800 transition"
                      title="Resend Set Password Email & Notification"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Email Invite</span>
                    </button>
                    <button
                      onClick={(e) => handleSendWhatsAppInvite(selectedMember, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl border border-emerald-200 dark:border-emerald-800 transition"
                      title="Send Password Setup Link via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>WhatsApp</span>
                    </button>
                    {canEdit('users') && (
                      <button
                        onClick={() => openEditModal(selectedMember)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl border border-blue-200 dark:border-blue-800 transition"
                        title="Edit Member Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}
                    {canDelete('users') && (
                      <button
                        onClick={() => openDeleteModal(selectedMember)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-xl border border-red-200 dark:border-red-800 transition"
                        title="Delete Member Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedMember(null)}
                      className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
                      aria-label="Close profile panel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Stat Micro-Cards Summary Grid */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center">
                    <span className="block text-[10px] text-zinc-400 font-medium">Paid</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      ₹{(selectedMember.amountPaid || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center">
                    <span className="block text-[10px] text-zinc-400 font-medium">Attendance</span>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                      {selectedMember.attendanceCount || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center">
                    <span className="block text-[10px] text-zinc-400 font-medium">Coach</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate block">
                      {selectedMember.trainerName || 'None'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center">
                    <span className="block text-[10px] text-zinc-400 font-medium">Branch</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate block">
                      {branchName(selectedMember.branchId)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Slider Tabs */}
              <div className="px-6 border-b border-zinc-200 dark:border-zinc-800 flex gap-6 text-xs font-bold bg-white dark:bg-zinc-950 overflow-x-auto">
                {[
                  { key: 'overview', label: 'Overview', icon: User },
                  { key: 'workout_diet', label: 'Detailed Workout & Diet', icon: Dumbbell },
                  { key: 'payments', label: 'Ledger & Payments', icon: CreditCard },
                  { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
                  { key: 'card', label: 'Desk Pass Card', icon: Printer },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-3.5 border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Bodies */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-zinc-700 dark:text-zinc-300">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Personal Information Section */}
                    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-xs">
                          <User className="w-4 h-4 text-blue-500" /> Personal Details
                        </h4>
                        <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Contact Info</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Email Address</span>
                          {selectedMember.email ? (
                            <a href={`mailto:${selectedMember.email}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                              <span className="truncate">{selectedMember.email}</span>
                            </a>
                          ) : (
                            <span className="text-zinc-400 text-xs mt-0.5 block font-normal">Not provided</span>
                          )}
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Phone Number</span>
                          <a href={`tel:${selectedMember.phone}`} className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mt-0.5 font-mono">
                            <PhoneIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{selectedMember.phone}</span>
                          </a>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Date of Birth</span>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{selectedMember.dob || 'Not provided'}</span>
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Account Role</span>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mt-0.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{selectedMember.role || 'USER'}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Membership Details Section */}
                    <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 text-xs">
                          <Award className="w-4 h-4 text-purple-500" /> Membership & Coaching
                        </h4>
                        <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Plan & Assigned Trainer</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Assigned Coach / Trainer</span>
                          <p className="font-bold text-purple-700 dark:text-purple-300 mt-0.5">
                            {selectedMember.trainerName ? (
                              <span>{selectedMember.trainerName} ({selectedMember.trainerCode})</span>
                            ) : (
                              <span className="text-zinc-400 font-normal">Floor Supervisor (Unassigned)</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Membership Start Date</span>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                            {selectedMember.startDate || 'Not recorded'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Gym Branch Location</span>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{branchName(selectedMember.branchId)}</span>
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-medium">Total Check-in Attendance</span>
                          <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                            <Activity className="w-3.5 h-3.5" />
                            <span>{selectedMember.attendanceCount || 0} visits logged</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'workout_diet' && (
                  <div className="space-y-6">
                    {/* Notice / Subhead Banner */}
                    <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                          <Dumbbell className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm">Detailed Workout & Diet Management</h4>
                          <p className="text-[11px] text-blue-700 dark:text-blue-300">
                            View member's real-time logged activity & prescribe customized workout routines and macro nutrition plans.
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-600 text-white rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0">
                        Trainer & Staff Portal
                      </span>
                    </div>

                    {/* Top Grid: Real-Time Logged Stats & Progress Breakdown */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" /> Member Logged Activity & Daily Progress
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {/* Water Intake Card */}
                        {(() => {
                          const goal = prescribedWaterMl || 3000;
                          // If member has logged water in profile/logs, use it; otherwise default to 0 for unlogged days
                          const loggedWater = (selectedMember as any)?.waterIntake || 0;
                          const waterPct = goal > 0 ? Math.min(100, Math.round((loggedWater / goal) * 100)) : 0;
                          return (
                            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-2">
                              <div className="flex items-center justify-between text-zinc-500">
                                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                  <Droplets className="w-3.5 h-3.5 text-cyan-500" /> Water Intake
                                </span>
                                <span className="text-[10px] font-mono font-bold text-cyan-600">{waterPct}%</span>
                              </div>
                              <div className="flex items-baseline justify-between">
                                <span className="text-base font-black text-zinc-900 dark:text-zinc-100">{loggedWater.toLocaleString()} <span className="text-xs font-normal text-zinc-400">mL</span></span>
                                <span className="text-[10px] text-zinc-400">Goal: {goal.toLocaleString()} mL</span>
                              </div>
                              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${waterPct}%` }} />
                              </div>
                            </div>
                          );
                        })()}

                        {/* Calories Card */}
                        {(() => {
                          const target = prescribedCalories || 2400;
                          const loggedCals = (selectedMember as any)?.caloriesLogged || 0;
                          const calPct = target > 0 ? Math.min(100, Math.round((loggedCals / target) * 100)) : 0;
                          return (
                            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-2">
                              <div className="flex items-center justify-between text-zinc-500">
                                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                  <Flame className="w-3.5 h-3.5 text-amber-500" /> Calories Logged
                                </span>
                                <span className="text-[10px] font-mono font-bold text-amber-600">{calPct}%</span>
                              </div>
                              <div className="flex items-baseline justify-between">
                                <span className="text-base font-black text-zinc-900 dark:text-zinc-100">{loggedCals.toLocaleString()} <span className="text-xs font-normal text-zinc-400">kcal</span></span>
                                <span className="text-[10px] text-zinc-400">Target: {target.toLocaleString()}</span>
                              </div>
                              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${calPct}%` }} />
                              </div>
                            </div>
                          );
                        })()}

                        {/* Protein Card */}
                        {(() => {
                          const target = prescribedProtein || 160;
                          const loggedProtein = (selectedMember as any)?.proteinLogged || 0;
                          const proteinPct = target > 0 ? Math.min(100, Math.round((loggedProtein / target) * 100)) : 0;
                          return (
                            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-2">
                              <div className="flex items-center justify-between text-zinc-500">
                                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                  <Apple className="w-3.5 h-3.5 text-purple-500" /> Protein Intake
                                </span>
                                <span className="text-[10px] font-mono font-bold text-purple-600">{proteinPct}%</span>
                              </div>
                              <div className="flex items-baseline justify-between">
                                <span className="text-base font-black text-zinc-900 dark:text-zinc-100">{loggedProtein} <span className="text-xs font-normal text-zinc-400">g</span></span>
                                <span className="text-[10px] text-zinc-400">Target: {target}g</span>
                              </div>
                              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${proteinPct}%` }} />
                              </div>
                            </div>
                          );
                        })()}

                        {/* Workouts Logged Card */}
                        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-2">
                          <div className="flex items-center justify-between text-zinc-500">
                            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <Dumbbell className="w-3.5 h-3.5 text-emerald-500" /> Gym Check-in Visits
                            </span>
                            <span className="text-[10px] font-mono font-bold text-emerald-600">Attendance</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-base font-black text-zinc-900 dark:text-zinc-100">{totalAttendanceCount} <span className="text-xs font-normal text-zinc-400">visits</span></span>
                            <span className="text-[10px] text-zinc-400">{userAttendanceLogs.length} logged logs</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalAttendanceCount / 20) * 100)}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Breakdown Table: Logged Meals & Exercises */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {/* Meal Logs */}
                        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                          <h5 className="font-bold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <Utensils className="w-3.5 h-3.5 text-amber-500" /> Recent Meals & Diet Plans
                          </h5>
                          <div className="space-y-2">
                            {isLoadingWorkoutDietData ? (
                              <div className="p-3 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading diet plans...
                              </div>
                            ) : backendDietPlans.length > 0 ? (
                              backendDietPlans.map((diet, idx) => (
                                <div key={diet.id || idx} className="p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 flex items-center justify-between">
                                  <div>
                                    <h6 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{diet.foodName || 'Assigned Diet Plan'}</h6>
                                    <span className="text-[10px] text-zinc-400 font-mono">{diet.timingFood || 'Daily Schedule'}</span>
                                  </div>
                                  <div className="text-right font-mono">
                                    <span className="block text-xs font-bold text-amber-600">{diet.description || 'Custom Plan'}</span>
                                  </div>
                                </div>
                              ))
                            ) : prescribedWorkout || prescribedCalories ? (
                              <div className="p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-1">
                                <div className="flex justify-between items-center">
                                  <h6 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{prescribedWorkout || 'Prescribed Macro Target'}</h6>
                                  <span className="text-[10px] font-bold text-amber-600">Active Goal</span>
                                </div>
                                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                  Target: {prescribedCalories} kcal, {prescribedProtein}g Protein, {prescribedWaterMl}mL Water
                                </p>
                                {trainerAdviceNotes && (
                                  <p className="text-[10px] text-zinc-500 italic pt-0.5">Advice: {trainerAdviceNotes}</p>
                                )}
                              </div>
                            ) : (
                              <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 text-xs">
                                No active diet plans assigned for {selectedMember?.name || 'this member'}. Use the prescription form below to assign meals.
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Workout Logs */}
                        <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                          <h5 className="font-bold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <Dumbbell className="w-3.5 h-3.5 text-blue-500" /> Prescribed Exercises & Workout Plans
                          </h5>
                          <div className="space-y-2">
                            {isLoadingWorkoutDietData ? (
                              <div className="p-3 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading workout plans...
                              </div>
                            ) : backendWorkoutPlan.length > 0 ? (
                              backendWorkoutPlan.map((ex, idx) => (
                                <div key={idx} className="p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 flex items-center justify-between">
                                  <div>
                                    <h6 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{ex}</h6>
                                    <span className="text-[10px] text-zinc-400 font-mono">Prescribed Routine</span>
                                  </div>
                                  <div className="text-right font-mono">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Active Plan</span>
                                  </div>
                                </div>
                              ))
                            ) : prescribedWorkout ? (
                              <div className="p-3 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 space-y-1">
                                <div className="flex justify-between items-center">
                                  <h6 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">{prescribedWorkout}</h6>
                                  <span className="text-[10px] font-bold text-blue-600">Assigned Routine</span>
                                </div>
                                {prescribedWorkoutNotes && (
                                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{prescribedWorkoutNotes}</p>
                                )}
                              </div>
                            ) : (
                              <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 text-xs">
                                No active workout routines assigned for {selectedMember?.name || 'this member'}. Use the prescription form below to assign a routine.
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Section 2: Trainer Prescription & Recommendation Panel */}
                    <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-emerald-200/60 dark:border-emerald-900/50">
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" /> Trainer Prescription & Goal Customization
                          </h4>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                            Set target routines, macro goals, and water intake for {selectedMember.name}. The member will receive instant notifications and dashboard target updates.
                          </p>
                        </div>

                        {planSentSuccess && (
                          <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-sm animate-bounce">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Plan Sent & Member Notified!
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Workout Plan Prescription */}
                        <div className="space-y-3">
                          <label className="block font-bold text-xs text-zinc-800 dark:text-zinc-200">
                            Prescribed Workout Routine & Split
                          </label>
                          <select
                            value={prescribedWorkout}
                            onChange={(e) => setPrescribedWorkout(e.target.value)}
                            className="w-full p-2.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100"
                          >
                            <option value="Push / Pull / Legs Hypertrophy (4 Days/wk)">Push / Pull / Legs Hypertrophy (4 Days/wk)</option>
                            <option value="Upper / Lower Body Strength (4 Days/wk)">Upper / Lower Body Strength (4 Days/wk)</option>
                            <option value="Full Body Circuit & HIIT Fat Loss (3 Days/wk)">Full Body Circuit & HIIT Fat Loss (3 Days/wk)</option>
                            <option value="5-Day Bodybuilding Split (Chest, Back, Arms, Shoulders, Legs)">5-Day Bodybuilding Split</option>
                            <option value="Custom Trainer Program">Custom Trainer Program</option>
                          </select>

                          <label className="block font-bold text-xs text-zinc-800 dark:text-zinc-200 pt-1">
                            Workout Instructions & Progressive Overload Notes
                          </label>
                          <textarea
                            rows={3}
                            value={prescribedWorkoutNotes}
                            onChange={(e) => setPrescribedWorkoutNotes(e.target.value)}
                            className="w-full p-2.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        {/* Target Macros & Water Intake Prescription */}
                        <div className="space-y-3">
                          <label className="block font-bold text-xs text-zinc-800 dark:text-zinc-200">
                            Prescribed Daily Macro Targets & Water Goal
                          </label>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[10px] font-semibold text-zinc-500 block mb-1">Target Calories (kcal)</span>
                              <input
                                type="number"
                                value={prescribedCalories}
                                onChange={(e) => setPrescribedCalories(Number(e.target.value))}
                                className="w-full p-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl font-bold font-mono text-zinc-900 dark:text-zinc-100"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-zinc-500 block mb-1">Water Goal (mL)</span>
                              <input
                                type="number"
                                value={prescribedWaterMl}
                                onChange={(e) => setPrescribedWaterMl(Number(e.target.value))}
                                className="w-full p-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl font-bold font-mono text-cyan-600"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-zinc-500 block mb-1">Target Protein (g)</span>
                              <input
                                type="number"
                                value={prescribedProtein}
                                onChange={(e) => setPrescribedProtein(Number(e.target.value))}
                                className="w-full p-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl font-bold font-mono text-purple-600"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold text-zinc-500 block mb-1">Target Carbs (g)</span>
                              <input
                                type="number"
                                value={prescribedCarbs}
                                onChange={(e) => setPrescribedCarbs(Number(e.target.value))}
                                className="w-full p-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl font-bold font-mono text-amber-600"
                              />
                            </div>
                          </div>

                          <label className="block font-bold text-xs text-zinc-800 dark:text-zinc-200 pt-1">
                            Trainer Nutrition Advice & Meal Instructions
                          </label>
                          <textarea
                            rows={2}
                            value={trainerAdviceNotes}
                            onChange={(e) => setTrainerAdviceNotes(e.target.value)}
                            className="w-full p-2.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={handleSendPrescriptionPlan}
                          disabled={isSendingPlan}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
                        >
                          <Send className="w-4 h-4" />
                          <span>{isSendingPlan ? 'Saving & Sending Notification to Member...' : 'Save & Send Detailed Plan to Member'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" /> Member Desk Ledger
                      </h4>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                        Total Paid: ₹{(selectedMember.amountPaid || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Record payment Form */}
                      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                        <h5 className="font-bold text-zinc-800 dark:text-zinc-200 mb-3 text-xs flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Log Cash / UPI Payment
                        </h5>
                        <form onSubmit={handleRecordPayment} className="space-y-3">
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">Fee Amount (INR) *</label>
                            <input
                              type="number"
                              required
                              placeholder="₹ e.g. 5000"
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-semibold text-zinc-500 mb-1">Payment Channel</label>
                            <select
                              value={payMode}
                              onChange={(e) => setPayMode(e.target.value as any)}
                              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                            >
                              <option value="UPI">UPI Instant</option>
                              <option value="CASH">Desk Cash</option>
                              <option value="CARD">Credit/Debit Card</option>
                              <option value="BANK_TRANSFER">Direct Transfer</option>
                            </select>
                          </div>
                          <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-sm shadow-emerald-600/20 disabled:opacity-50"
                          >
                            {isSubmitting ? 'Logging...' : 'Submit Transaction'}
                          </button>
                        </form>
                      </div>

                      {/* Payment History ledger */}
                      <div className="space-y-2">
                        <span className="block font-bold text-zinc-400 text-[10px] uppercase tracking-wider">Payment History</span>
                        {payments.filter(p => p.userId === selectedMember.id).length === 0 ? (
                          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 text-xs">
                            No ledger transactions recorded yet.
                          </div>
                        ) : (
                          payments.filter(p => p.userId === selectedMember.id).map((pay) => (
                            <div key={pay.id} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-1">
                              <div className="flex justify-between font-bold text-zinc-900 dark:text-zinc-50 text-xs">
                                <span>₹{pay.amount.toLocaleString()}</span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                                  {pay.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 font-mono">Date: {pay.paymentDate} | Mode: {pay.paymentMode}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="space-y-5">
                    {/* Attendance KPI Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                        <span className="text-[10px] text-zinc-400 font-medium block">Total Attendance Recorded</span>
                        <div className="flex items-center gap-2 mt-1">
                          <CalendarCheck className="w-5 h-5 text-blue-500" />
                          <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                            {totalAttendanceCount || selectedMember.attendanceCount || userAttendanceLogs.length || 0}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                        <span className="text-[10px] text-zinc-400 font-medium block">Current Attendance Status</span>
                        {(() => {
                          const activeLog = userAttendanceLogs.find(l => l.status === 'ACTIVE');
                          return activeLog ? (
                            <div className="flex items-center justify-between mt-1">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Present (Active)
                              </span>
                              <button
                                onClick={handleCheckOutMember}
                                disabled={isSubmitting}
                                className="px-2.5 py-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 transition"
                              >
                                Mark Departure
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-semibold text-zinc-500">Not Marked Today</span>
                              <button
                                onClick={handleCheckInMember}
                                disabled={isSubmitting}
                                className="px-2.5 py-1 text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-500/20 transition flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Mark Attendance
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Quick Manual Attendance Bar */}
                    <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-blue-50/30 dark:bg-blue-950/20 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">Record Daily Attendance</h4>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Log member presence at front-desk or gate</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCheckInMember}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                        >
                          {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarCheck className="w-3.5 h-3.5" />}
                          Mark Present
                        </button>
                      </div>
                    </div>

                    {/* Attendance Logs List */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-zinc-200 dark:border-zinc-800">
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-500" /> Attendance Log History
                        </h4>
                        <span className="text-[10px] text-zinc-400 font-mono">Real-time Records</span>
                      </div>

                      {isLoadingAttendance ? (
                        <div className="py-8 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          <span>Loading attendance records...</span>
                        </div>
                      ) : userAttendanceLogs.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-2">
                          <CalendarCheck className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
                          <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">No attendance records found</p>
                          <p className="text-[11px] text-zinc-400">Click below to mark member's attendance for today.</p>
                          <button
                            onClick={handleCheckInMember}
                            className="mt-2 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-xl border border-blue-200 dark:border-blue-800 inline-flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" /> Mark First Attendance
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {userAttendanceLogs.map((log) => {
                            const entryTimeFormatted = log.checkInTime ? new Date(log.checkInTime).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            }) : '—';

                            const exitTimeFormatted = log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            }) : null;

                            return (
                              <div
                                key={log.id || log.checkInTime}
                                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 flex items-center justify-between gap-3 text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                                      {entryTimeFormatted}
                                    </span>
                                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                      log.status === 'ACTIVE'
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                    }`}>
                                      {log.status === 'ACTIVE' ? 'PRESENT' : 'COMPLETED'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-zinc-400 flex items-center gap-2 font-mono">
                                    <span>Method: {log.method || 'MANUAL'}</span>
                                    {exitTimeFormatted && <span>• Departure: {exitTimeFormatted}</span>}
                                  </div>
                                </div>

                                {log.status === 'ACTIVE' && (
                                  <button
                                    onClick={handleCheckOutMember}
                                    className="px-2.5 py-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 transition"
                                  >
                                    Mark Departure
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'card' && (
                  <div className="space-y-4">
                    <div className="p-6 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-gradient-to-br from-zinc-900 to-black text-white shadow-xl max-w-md mx-auto space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold tracking-widest uppercase text-blue-400">GymOS Official Pass</span>
                          <h4 className="text-base font-black text-white">{selectedMember.name}</h4>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          {selectedMember.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 border-y border-zinc-800 py-3">
                        <div>
                          <span className="text-zinc-500 text-[9px] block">MEMBER ID</span>
                          <span className="font-mono font-bold text-white">{selectedMember.userCode}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[9px] block">BRANCH</span>
                          <span className="font-bold text-white">{branchName(selectedMember.branchId)}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[9px] block">PHONE</span>
                          <span className="font-mono text-white">{selectedMember.phone}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[9px] block">TRAINER</span>
                          <span className="text-white">{selectedMember.trainerName || 'Self'}</span>
                        </div>
                      </div>

                      <div className="text-center pt-2">
                        <div className="h-8 bg-white/10 rounded flex items-center justify-center gap-1 font-mono text-[10px] tracking-widest text-zinc-400">
                          ||||| ||| ||||||| |||| ||||| |||||
                        </div>
                        <p className="text-[9px] text-zinc-500 mt-1">Scan at front desk turnstile</p>
                      </div>
                    </div>

                    <div className="text-center pt-2">
                      <button
                        onClick={() => triggerAnnouncement(`Directly printing barcode pass card for ${selectedMember.name}.`)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-blue-500/20"
                      >
                        <Printer className="w-4 h-4" /> Print Thermal Card
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Bottom Quick Action Footer */}
              <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between gap-3">
                {canDelete('users') && !isSelf(selectedMember) ? (
                  <button
                    onClick={() => openDeleteModal(selectedMember)}
                    className="px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 rounded-xl transition border border-red-200 dark:border-red-800 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Member
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  {canEdit('users') && (
                    <button
                      onClick={() => openEditModal(selectedMember)}
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                    >
                      <Edit className="w-4 h-4" /> Edit Profile
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Edit Member Dialog Modal */}
      {isEditFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="edit-form-heading" onClick={closeEditModal}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              
              {/* Header */}
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 id="edit-form-heading" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">
                    Edit Member Profile
                  </h3>
                </div>
                <button onClick={closeEditModal} className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleUpdateMember} className="p-6 space-y-4 text-xs text-zinc-700 dark:text-zinc-300 max-h-[75vh] overflow-y-auto">
                
                {/* Error Banner */}
                {editFormErrorMessage && (
                  <div className="p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 shadow-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span className="font-semibold leading-relaxed">{editFormErrorMessage}</span>
                  </div>
                )}

                {/* Member Identity Badge */}
                {memberToEdit && (
                  <div className="p-3 bg-zinc-100 dark:bg-zinc-900/80 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Member Code</p>
                      <p className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">{memberToEdit.userCode || memberToEdit.id}</p>
                    </div>
                    {memberToEdit.username && (
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Username</p>
                        <p className="font-mono text-xs text-zinc-700 dark:text-zinc-300">{memberToEdit.username}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Name & Phone Number */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editMemberData.name}
                      onChange={(e) => {
                        setEditMemberData({ ...editMemberData, name: e.target.value });
                        if (editFormErrors.name) setEditFormErrors({ ...editFormErrors, name: undefined });
                      }}
                      className={`w-full px-3 py-2 border rounded-xl text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-900 ${
                        editFormErrors.name ? 'border-red-500 focus:ring-2 focus:ring-red-500/40' : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/40'
                      }`}
                    />
                    {editFormErrors.name && (
                      <p className="text-[10px] text-red-500 font-medium mt-1">{editFormErrors.name}</p>
                    )}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Phone Number (10 Digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={editMemberData.phone}
                      onChange={(e) => {
                        setEditMemberData({ ...editMemberData, phone: e.target.value.replace(/[^0-9]/g, '') });
                        if (editFormErrors.phone) setEditFormErrors({ ...editFormErrors, phone: undefined });
                      }}
                      className={`w-full px-3 py-2 border rounded-xl text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-900 font-mono ${
                        editFormErrors.phone ? 'border-red-500 focus:ring-2 focus:ring-red-500/40' : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/40'
                      }`}
                    />
                    {editFormErrors.phone && (
                      <p className="text-[10px] text-red-500 font-medium mt-1">{editFormErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Email Address & Account Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Email Address</label>
                    <input
                      type="email"
                      value={editMemberData.email}
                      onChange={(e) => {
                        setEditMemberData({ ...editMemberData, email: e.target.value });
                        if (editFormErrors.email) setEditFormErrors({ ...editFormErrors, email: undefined });
                      }}
                      className={`w-full px-3 py-2 border rounded-xl text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-900 ${
                        editFormErrors.email ? 'border-red-500 focus:ring-2 focus:ring-red-500/40' : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/40'
                      }`}
                    />
                    {editFormErrors.email && (
                      <p className="text-[10px] text-red-500 font-medium mt-1">{editFormErrors.email}</p>
                    )}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Account Status</label>
                    <select
                      value={editMemberData.status}
                      onChange={(e) => setEditMemberData({ ...editMemberData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-blue-500/40"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Expired">Expired</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                {/* Membership Plan & User Role */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Membership Plan</label>
                    {availablePlans.length > 0 ? (
                      <select
                        value={editMemberData.plan}
                        onChange={(e) => setEditMemberData({ ...editMemberData, plan: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-blue-500/40"
                      >
                        <option value="">-- No Plan --</option>
                        {availablePlans.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name} ({p.durationDays} days)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="e.g. Monthly Premium"
                        value={editMemberData.plan}
                        onChange={(e) => setEditMemberData({ ...editMemberData, plan: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/40"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">User Role *</label>
                    <select
                      value={editMemberData.role}
                      onChange={(e) => setEditMemberData({ ...editMemberData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold focus:ring-2 focus:ring-blue-500/40"
                    >
                      {availableRoles.map((r) => (
                        <option key={r.id || r.name} value={r.name}>
                          {r.name.replace(/_/g, ' ')}
                        </option>
                      ))}
                      {!availableRoles.some(r => r.name.toUpperCase() === 'USER') && (
                        <option value="USER">USER</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Assigned Branch & Personal Coach */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Assigned Branch</label>
                    <select
                      value={editMemberData.branchId}
                      onChange={(e) => setEditMemberData({ ...editMemberData, branchId: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/40"
                    >
                      <option value="">-- No Branch (HQ) --</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.branchCode})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Personal Coach / Trainer</label>
                    <SearchableSelect
                      placeholder="Search & Select Personal Trainer..."
                      options={[
                        { value: '', label: 'Floor Supervisor (Unassigned)' },
                        ...staff.map((t) => {
                          const branchTag = t.branchName ? ` • 📍 ${t.branchName}` : '';
                          const roleTag = t.designation || t.role || 'Staff';
                          return {
                            value: t.code || t.id,
                            label: t.name ? `${t.name} (${roleTag})` : (t.code || t.id),
                            sublabel: `${t.code || ''}${branchTag}`.trim(),
                          };
                        }),
                      ]}
                      value={editMemberData.trainerCode}
                      onChange={(val) => setEditMemberData({ ...editMemberData, trainerCode: val })}
                    />
                  </div>
                </div>

                {/* Dates & Gender: Gender, DOB, Start Date, End Date */}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Gender</label>
                    <select
                      value={editMemberData.gender}
                      onChange={(e) => setEditMemberData({ ...editMemberData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/40"
                    >
                      <option value="">Select</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Date of Birth</label>
                    <input
                      type="date"
                      value={editMemberData.dob}
                      onChange={(e) => setEditMemberData({ ...editMemberData, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Start Date</label>
                    <input
                      type="date"
                      value={editMemberData.startDate}
                      onChange={(e) => setEditMemberData({ ...editMemberData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">End Date</label>
                    <input
                      type="date"
                      value={editMemberData.endDate}
                      onChange={(e) => setEditMemberData({ ...editMemberData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                </div>

                {/* Financials & Attendance */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Total Amount Paid (INR)</label>
                    <input
                      type="number"
                      value={editMemberData.amountPaid}
                      onChange={(e) => setEditMemberData({ ...editMemberData, amountPaid: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-zinc-800 dark:text-zinc-200">Attendance Count</label>
                    <input
                      type="number"
                      value={editMemberData.attendanceCount}
                      onChange={(e) => setEditMemberData({ ...editMemberData, attendanceCount: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-sm shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && memberToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-heading" onClick={() => setIsDeleteConfirmOpen(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 text-center space-y-6" onClick={(e) => e.stopPropagation()}>
              
              <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="delete-dialog-heading" className="font-bold text-zinc-900 dark:text-zinc-50 text-base">
                    Delete Member Account
                  </h3>
                  <p className="text-xs text-zinc-500">This action cannot be undone.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-xs text-red-800 dark:text-red-300">
                Are you sure you want to delete member <strong className="font-bold">{memberToDelete.name}</strong> (<span className="font-mono">{memberToDelete.userCode}</span>)?
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition text-xs shadow-sm shadow-red-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Yes, Delete Member'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Registration Dialog */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="form-heading" onClick={() => setIsFormOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200" />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-2xl bg-white dark:bg-zinc-950 shadow-2xl flex flex-col justify-between border-l border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>

              {/* Header */}
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-transparent dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-transparent flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 id="form-heading" className="font-extrabold text-zinc-900 dark:text-zinc-50 text-base flex items-center gap-2">
                      Register User Account
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        New Member / Staff
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Fill in profile details, assign roles, membership plans, and branch locations.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)} 
                  className="p-2 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleRegisterMember} className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-zinc-700 dark:text-zinc-300">
                {/* Error Banner */}
                {formErrorMessage && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs flex items-start gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                    <div>
                      <p className="font-bold text-sm">Registration Alert</p>
                      <p className="text-xs mt-0.5 leading-relaxed">{formErrorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Section 1: Account & Access Scope */}
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider">1. Account Role & Branch Scoping</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* User Role */}
                    <div>
                      <label className="block font-semibold mb-1.5 text-zinc-800 dark:text-zinc-200">
                        System Role
                      </label>
                      <SearchableSelect
                        placeholder="Search & Select Role..."
                        options={[
                          ...availableRoles.map(r => ({ value: r.name, label: r.name.replace(/_/g, ' ') })),
                          ...(!availableRoles.some(r => r.name.toUpperCase() === 'EMPLOYEE') ? [{ value: 'EMPLOYEE', label: 'EMPLOYEE' }] : []),
                        ]}
                        value={newMember.role}
                        onChange={(val) => setNewMember({ ...newMember, role: val })}
                      />
                      <p className="mt-1 text-[10px] text-zinc-400">Determines RBAC permissions & layout density.</p>
                    </div>

                    {/* Membership Plan */}
                    <div>
                      <label className="block font-semibold mb-1.5 text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                        <span>Membership Plan</span>
                        <Award className="w-3.5 h-3.5 text-blue-500" />
                      </label>
                      <SearchableSelect
                        placeholder="Search & Select Membership Plan..."
                        options={[
                          ...availablePlans.map(p => ({
                            value: p.name,
                            label: p.name,
                            sublabel: `₹${p.price?.toLocaleString()} • ${p.durationDays} days`,
                          })),
                        ]}
                        value={newMember.plan}
                        onChange={(val) => setNewMember({ ...newMember, plan: val })}
                      />
                      <p className="mt-1 text-[10px] text-zinc-400">Assigned tier package for the user.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Primary Branch */}
                    <div>
                      <label className="block font-semibold mb-1.5 text-zinc-800 dark:text-zinc-200">
                        Primary Home Branch *
                      </label>
                      <SearchableSelect
                        placeholder="Search & Select Home Branch..."
                        options={[
                          ...branches.map(b => ({
                            value: b.id,
                            label: b.name,
                            sublabel: b.branchCode,
                          })),
                        ]}
                        value={newMember.branchId || (selectedBranchId !== 'ALL' ? selectedBranchId : '')}
                        onChange={(val) => setNewMember({ ...newMember, branchId: val })}
                      />
                    </div>

                    {/* Staff Toggle */}
                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs block">
                          Staff / Operational Personnel
                        </span>
                        <span className="text-[10px] text-zinc-500 block leading-tight">
                          Registers user under Staff & Payroll directory.
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={newMember.isStaff}
                        onClick={() => setNewMember({ ...newMember, isStaff: !newMember.isStaff })}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          newMember.isStaff ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            newMember.isStaff ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Multi-Branch Selector */}
                  {branches.length > 1 && (
                    <div className="pt-2">
                      <label className="block font-semibold mb-1.5 text-zinc-800 dark:text-zinc-200">
                        Additional Accessible Branches (Optional)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/60">
                        {branches
                          .filter(b => b.id !== (newMember.branchId || (selectedBranchId !== 'ALL' ? selectedBranchId : '')))
                          .map(b => {
                            const isChecked = newMember.accessibleBranchIds.includes(b.id);
                            return (
                              <label key={b.id} className="flex items-center gap-2.5 text-xs text-zinc-800 dark:text-zinc-200 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 p-2 rounded-lg transition border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setNewMember(prev => ({ ...prev, accessibleBranchIds: [...prev.accessibleBranchIds, b.id] }));
                                    } else {
                                      setNewMember(prev => ({ ...prev, accessibleBranchIds: prev.accessibleBranchIds.filter(id => id !== b.id) }));
                                    }
                                  }}
                                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                />
                                <span className="truncate">{b.name} <span className="text-[10px] text-zinc-400">({b.branchCode})</span></span>
                              </label>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2: Personal Profile & Details */}
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider">2. Personal Profile & Credentials</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block font-semibold mb-1.5 text-zinc-800 dark:text-zinc-200">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newMember.name}
                        onChange={(e) => {
                          setNewMember({ ...newMember, name: e.target.value });
                          setFormErrors(prev => ({ ...prev, name: undefined }));
                        }}
                        onBlur={() => setTouchedFields(prev => ({ ...prev, name: true }))}
                        className={`w-full px-3 py-2.5 border ${
                          formErrors.name && (touchedFields.name || isSubmitAttempted)
                            ? 'border-red-500 ring-2 ring-red-500/20'
                            : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/40'
                        } bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs transition`}
                        placeholder="e.g. John Doe"
                      />
                      {formErrors.name && (touchedFields.name || isSubmitAttempted) && (
                        <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {formErrors.name}
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block font-semibold mb-1.5 text-zinc-800 dark:text-zinc-200">
                        Phone Number (10 Digits) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={10}
                        value={newMember.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setNewMember({ ...newMember, phone: val });
                          setFormErrors(prev => ({ ...prev, phone: undefined }));
                        }}
                        onBlur={() => setTouchedFields(prev => ({ ...prev, phone: true }))}
                        className={`w-full px-3 py-2.5 border ${
                          formErrors.phone && (touchedFields.phone || isSubmitAttempted)
                            ? 'border-red-500 ring-2 ring-red-500/20'
                            : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/40'
                        } bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono text-xs transition`}
                        placeholder="e.g. 9876543210"
                      />
                      {formErrors.phone && (touchedFields.phone || isSubmitAttempted) && (
                        <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {formErrors.phone}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block font-semibold mb-1.5 text-zinc-800 dark:text-zinc-200">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={newMember.email}
                        onChange={(e) => {
                          setNewMember({ ...newMember, email: e.target.value });
                          setFormErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        onBlur={() => setTouchedFields(prev => ({ ...prev, email: true }))}
                        className={`w-full px-3 py-2.5 border ${
                          formErrors.email && (touchedFields.email || isSubmitAttempted)
                            ? 'border-red-500 ring-2 ring-red-500/20'
                            : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/40'
                        } bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs transition`}
                        placeholder="e.g. john@example.com"
                      />
                      {formErrors.email && (touchedFields.email || isSubmitAttempted) && (
                        <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {formErrors.email}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block font-semibold mb-1.5 text-zinc-800 dark:text-zinc-200">
                        Gender *
                      </label>
                      <select
                        required
                        value={newMember.gender}
                        onChange={(e) => {
                          setNewMember({ ...newMember, gender: e.target.value });
                          setFormErrors(prev => ({ ...prev, gender: undefined }));
                        }}
                        onBlur={() => setTouchedFields(prev => ({ ...prev, gender: true }))}
                        className={`w-full px-3 py-2.5 border ${
                          formErrors.gender && (touchedFields.gender || isSubmitAttempted)
                            ? 'border-red-500 ring-2 ring-red-500/20'
                            : 'border-zinc-300 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/40'
                        } bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs transition`}
                      >
                        <option value="">-- Select Gender --</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                      </select>
                      {formErrors.gender && (touchedFields.gender || isSubmitAttempted) && (
                        <p className="text-[11px] text-red-500 mt-1 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {formErrors.gender}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block font-semibold mb-1.5 text-zinc-800 dark:text-zinc-200">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={newMember.dob}
                        onChange={(e) => setNewMember({ ...newMember, dob: e.target.value })}
                        className="w-full px-3 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Billing & Assignment */}
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs uppercase tracking-wider">3. Membership Dates, Billing & Personal Coach</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Start Date */}
                    <div>
                      <label className="block font-semibold mb-1.5 text-zinc-800 dark:text-zinc-200">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={newMember.startDate}
                        onChange={(e) => setNewMember({ ...newMember, startDate: e.target.value })}
                        className="w-full px-3 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs transition"
                      />
                    </div>

                    {/* Initial Amount Paid */}
                    <div>
                      <label className="block font-semibold mb-1.5 text-zinc-800 dark:text-zinc-200">
                        Initial Amount Paid (INR)
                      </label>
                      <input
                        type="number"
                        value={newMember.amountPaid}
                        onChange={(e) => setNewMember({ ...newMember, amountPaid: e.target.value })}
                        className="w-full px-3 py-2.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs transition font-mono"
                        placeholder="e.g. 5000"
                      />
                    </div>

                    {/* Trainer Assignment */}
                    <div>
                      <label className="block font-semibold mb-1.5 text-zinc-800 dark:text-zinc-200">
                        Assigned Personal Trainer
                      </label>
                      <SearchableSelect
                        placeholder="Search & Select Personal Trainer..."
                        options={[
                          { value: '', label: 'Floor Supervisor (Unassigned)' },
                          ...staff.map((t) => {
                            const branchTag = t.branchName ? ` • 📍 ${t.branchName}` : '';
                            const roleTag = t.designation || t.role || 'Staff';
                            return {
                              value: t.code || t.id,
                              label: t.name ? `${t.name} (${roleTag})` : (t.code || t.id),
                              sublabel: `${t.code || ''}${branchTag}`.trim(),
                            };
                          }),
                        ]}
                        value={newMember.trainerCode}
                        onChange={(val) => setNewMember({ ...newMember, trainerCode: val })}
                      />
                    </div>
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-xs shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRegisterMember}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition shadow-md shadow-blue-500/25 disabled:opacity-50 text-xs flex items-center gap-2 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Save User Account
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Password Setup & WhatsApp Invite Modal */}
      {inviteModalData && inviteModalData.isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 text-xs"
          onClick={() => setInviteModalData(null)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Share Password Setup Link</h3>
                  <p className="text-xs text-zinc-500">{inviteModalData.memberName} ({inviteModalData.phone || inviteModalData.email})</p>
                </div>
              </div>
              <button 
                onClick={() => setInviteModalData(null)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-zinc-600 dark:text-zinc-400 font-semibold">Generated Registration & Password Setup Link:</label>
              <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <input 
                  type="text" 
                  readOnly 
                  value={inviteModalData.inviteLink}
                  className="bg-transparent text-zinc-800 dark:text-zinc-200 w-full outline-none font-mono text-[11px]"
                />
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(inviteModalData.inviteLink);
                      triggerAnnouncement('Invite link copied to clipboard!');
                    } catch {
                      triggerAnnouncement('Failed to copy link.');
                    }
                  }}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1 shrink-0 transition"
                  title="Copy link to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={inviteModalData.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send via WhatsApp</span>
              </a>
              <a
                href={inviteModalData.inviteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-2xl font-bold transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Link</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export class MembersErrorBoundary extends React.Component<any, { hasError: boolean; error: Error | null }> {
  state: { hasError: boolean; error: any; };
  props: any;
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) { console.error("MembersErrorBoundary caught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-2xl">
          <h1 className="text-xl font-bold text-red-700 flex items-center gap-2">Members Page Crashed</h1>
          <pre className="mt-4 p-4 text-xs bg-red-100 text-red-900 rounded overflow-auto">{this.state.error?.message}</pre>
          <pre className="mt-2 p-4 text-[10px] bg-red-100 text-red-900 rounded overflow-auto">{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export const Members: React.FC = () => {
  return (
    <MembersErrorBoundary>
      <MembersInternal />
    </MembersErrorBoundary>
  );
};
