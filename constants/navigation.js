import {
    FaHome,
    FaUsers,
    FaUserTie,
    FaDumbbell,
    FaChartLine,
    FaCalendarDay,
    FaRunning,
    FaSearch
} from "react-icons/fa";

export const ROLES = {
    ADMIN: "ADMIN",
    ORG_ADMIN: "ORG_ADMIN",
    TRAINER: "TRAINER",
    BRANCH_ADMIN: "BRANCH_ADMIN",
    USER: "USER",
    PREMIUM_USER: "PREMIUM_USER",
    STAFF: "STAFF",
};

export const ADMIN_NAV_LINKS = [
    { name: "Dashboard", href: "/admin", icon: <FaChartLine /> },
    { name: "Users", href: "/admin/users", icon: <FaUsers /> },
    { name: "Staff", href: "/admin/staff", icon: <FaUserTie /> },
    { name: "Inventory", href: "/admin/inventory", icon: <FaDumbbell /> },
    { name: "Analysis", href: "/admin/analysis", icon: <FaChartLine /> },
    { name: "Assign Plan", href: "/admin/assign-workout", icon: <FaDumbbell /> },
    { name: "Activities", href: "/admin/activities", icon: <FaRunning /> },
];

export const BRANCH_ADMIN_NAV_LINKS = [
    { name: "Home", href: "/branch/dashboard", icon: <FaHome /> },
    { name: "Members", href: "/branch/users", icon: <FaUsers /> },
    { name: "Staff", href: "/branch/staff", icon: <FaUserTie /> },
    { name: "Sessions", href: "/branch/sessions", icon: <FaCalendarDay /> },
    { name: "Inventory", href: "/branch/inventory", icon: <FaDumbbell /> },
    { name: "Reports", href: "/branch/reports", icon: <FaChartLine /> },
    { name: "Assign Plan", href: "/admin/assign-workout", icon: <FaDumbbell /> },
];

export const TRAINER_NAV_LINKS = [
    { name: "Dashboard", href: "/branch/trainer-dashboard", icon: <FaHome /> },
    { name: "My Members", href: "/branch/users", icon: <FaUsers /> },
    { name: "Sessions", href: "/branch/sessions", icon: <FaDumbbell /> },
    { name: "Assign Plan", href: "/admin/assign-workout", icon: <FaDumbbell /> },
];

export const USER_NAV_LINKS = [
    { name: "Home", href: "/user", icon: <FaHome /> },
    { name: "Workouts", href: "/user/workout", icon: <FaDumbbell /> },
    { name: "Activities", href: "/user/activities", icon: <FaRunning /> },
    { name: "Explore", href: "/user/explore", icon: <FaSearch /> },
    { name: "Exercises", href: "/user/exercises", icon: <FaDumbbell /> },
    { name: "Diet", href: "/user/diet", icon: <FaChartLine /> },
];
