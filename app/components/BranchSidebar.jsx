"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/lib/api";
import {
  FaHome,
  FaUsers,
  FaUserTie,
  FaDumbbell,
  FaChartLine,
  FaUserCircle,
  FaBell,
  FaSignOutAlt,
  FaEdit,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";

export default function BranchSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    router.push('/auth/login');
  };

  const links = [
    { name: "Home", href: "/branch/dashboard", icon: <FaHome /> },
    { name: "User Management", href: "/branch/users", icon: <FaUsers /> },
    { name: "Manage Staff", href: "/branch/staff", icon: <FaUserTie /> },
    { name: "Branch Inventory", href: "/branch/inventory", icon: <FaDumbbell /> },
    { name: "Branch Reports", href: "/branch/reports", icon: <FaChartLine /> },
  ];

  return (
    <aside className="sidebar">
      <div className="logo">
        GYM<span style={{ color: 'var(--primary)' }}>bross</span>
      </div>
      <nav className="nav">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`nav-item ${pathname === link.href ? "active" : ""}`}
          >
            <span className="icon">{link.icon}</span>
            <span className="label">{link.name}</span>
          </Link>
        ))}
      </nav>
      <div className="profile-section">
        <div className="profile-dropdown-container">
          <button
            className={`nav-item profile-btn ${showProfileMenu ? 'active' : ''}`}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <span className="icon"><FaUserCircle /></span>
            <span className="label">Profile</span>
            <span className="arrow">
              {showProfileMenu ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </button>

          {showProfileMenu && (
            <div className="profile-menu glass-panel">
              <Link href="/branch/profile" className="menu-item">
                <span className="menu-icon"><FaEdit /></span> Edit Profile
              </Link>
              <Link href="/branch/notifications" className="menu-item">
                <span className="menu-icon"><FaBell /></span> Notifications
              </Link>
              <a href="#" onClick={handleLogout} className="menu-item logout">
                <span className="menu-icon"><FaSignOutAlt /></span> Logout
              </a>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: 250px;
          height: 100vh;
          background: #111;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          padding: 20px;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
        }

        .logo {
          font-size: 24px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 40px;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 20px;
          color: #888;
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.3s;
          font-weight: 500;
          border: 1px solid transparent;
          background: transparent;
          width: 100%;
          cursor: pointer;
          font-family: inherit;
          font-size: 15px;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .nav-item.active {
          background: rgba(0, 255, 136, 0.1);
          color: var(--primary);
          border-color: rgba(0, 255, 136, 0.2);
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.1);
        }

        .icon {
          font-size: 20px;
          display: flex;
          align-items: center;
        }

        .profile-section {
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 20px;
            position: relative;
        }

        .profile-dropdown-container {
            position: relative;
        }

        .profile-btn {
            justify-content: flex-start;
        }

        .arrow {
            margin-left: auto;
            font-size: 12px;
            opacity: 0.7;
            display: flex;
            align-items: center;
        }

        .profile-menu {
            position: absolute;
            bottom: 100%;
            left: 0;
            width: 100%;
            background: #1a1a1a;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 10px;
            margin-bottom: 10px;
            box-shadow: 0 -5px 20px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            gap: 5px;
            animation: slideUp 0.2s ease-out;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .menu-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px;
            color: #ccc;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.2s;
            font-size: 14px;
        }

        .menu-item:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #fff;
        }

        .menu-icon {
            font-size: 16px;
            display: flex;
            align-items: center;
            color: var(--primary);
        }

        .menu-item.logout {
            color: #ff4d4d;
        }
        
        .menu-item.logout .menu-icon {
            color: #ff4d4d;
        }

        .menu-item.logout:hover {
            background: rgba(255, 77, 77, 0.1);
        }
      `}</style>
    </aside>
  );
}
