import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { JoinPage } from '../pages/auth/JoinPage';
import { Layout } from '../components/layout/Layout';
import { getRedirectPathForUser } from '../lib/navigation';
import { getStoredToken } from '../lib/api/client';
import { logout } from '../lib/api/auth';


// Components
import { Dashboard } from '../pages/dashboard/Dashboard';
import { Members } from '../pages/members/Members';
import { MemberDashboard } from '../pages/member-portal/MemberDashboard';
import { StaffManagement } from '../pages/staff/Staff';
import { Attendance } from '../pages/attendance/Attendance';
import { Branches } from '../pages/branches/Branches';
import { Plans } from '../pages/plans/Plans';
import { WorkoutsAndDiets } from '../pages/workouts/WorkoutsAndDiets';
import { DietDatabase } from '../pages/diets/DietDatabase';
import { Activities } from '../pages/activities/Activity';

import { Accounts } from '../pages/accounts/Accounts';
import { Inventory } from '../pages/inventory/Inventory';
import { Chat } from '../pages/chat/Chat';
import { Notifications } from '../pages/notifications/Notifications';
import { Settings } from '../pages/settings/Settings';
import { RBAC } from '../pages/rbac/RBAC';
import { CRM } from '../pages/crm/CRM';
import { Roster } from '../pages/roster/Roster';
import { POS } from '../pages/pos/POS';
import { AiAgentPage } from '../pages/ai/AiAgentPage';

// Dummy functions to satisfy props while maintaining UI
const dummyTrigger = (msg: string) => console.log('Announcement:', msg);
const noop = () => {};

// Wrapping Dashboard to provide navigation to its onNavigate prop
const DashboardRoute = () => {
  return (
    <Dashboard />
  );
};

// Placeholder for unimplemented features
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-800">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-500">This page is currently under construction.</p>
    </div>
  </div>
);

const LoginRoute = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // If user has active token, auto redirect to primary page
    const token = getStoredToken();
    if (token) {
      getRedirectPathForUser()
        .then((path) => navigate(path, { replace: true }))
        .catch(() => logout());
    }
  }, [navigate]);


  const handleLogin = async () => {
    const targetPath = await getRedirectPathForUser();
    navigate(targetPath, { replace: true });
  };

  return <LoginPage onLogin={handleLogin} />;
};

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route 
          path="/auth/login" 
          element={<LoginRoute />} 
        />
        <Route 
          path="/auth/register/join" 
          element={<JoinPage />} 
        />
        <Route 
          path="/auth/verify-admin" 
          element={<JoinPage />} 
        />
        
        {/* Protected Routes wrapped in Layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardRoute />} />
          
          {/* Members */}
          <Route path="/members" element={<Members />} />
          <Route path="/member-portal" element={<MemberDashboard />} />
          
          {/* Staff & HR */}
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/attendance" element={<Attendance />} />
          
          {/* Gym Management */}
          <Route path="/branches" element={<Branches />} />
          <Route path="/plans" element={<Plans />} />
          
          {/* Workouts & Diet */}
          <Route path="/workouts" element={<WorkoutsAndDiets />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/diets" element={<DietDatabase />} />

          
          {/* Financials & Inventory */}
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/inventory" element={<Inventory />} />
          
          {/* Communications */}
          <Route path="/chat" element={<Chat />} />
          <Route path="/ai-agent" element={<AiAgentPage />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Settings & Admin */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/rbac" element={<RBAC />} />
          
          {/* Enterprise Modules */}
          <Route path="/crm" element={<CRM />} />
          <Route path="/roster" element={<Roster />} />
          <Route path="/pos" element={<POS />} />
          
        </Route>
        
        {/* Default Route */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        
        {/* 404 Route */}
        <Route path="*" element={<Placeholder title="404 - Not Found" />} />
      </Routes>
    </BrowserRouter>
  );
}
