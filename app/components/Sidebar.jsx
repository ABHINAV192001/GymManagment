"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/api";
import { useState, useEffect } from "react";
import { getProfile } from "@/lib/api/user";

import { ADMIN_NAV_LINKS, BRANCH_ADMIN_NAV_LINKS, TRAINER_NAV_LINKS, ROLES } from "@/constants/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState(ROLES.ADMIN);

  useEffect(() => {
    getProfile().then(p => {
      if (p) setRole(p.role);
    }).catch(() => { });
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    router.push('/auth/login');
  };

  const links = (role === ROLES.ADMIN || role === ROLES.ORG_ADMIN) ? ADMIN_NAV_LINKS :
    (role === ROLES.TRAINER) ? TRAINER_NAV_LINKS : BRANCH_ADMIN_NAV_LINKS;

  return (
    <aside className="sidebar">
      <div className="logo">GYM BROS</div>
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
      <div className="logout">
        <a href="#" onClick={handleLogout} className="nav-item">
          <span className="icon">🚪</span>
          <span className="label">Logout</span>
        </a>
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
        }

        .logo {
          font-size: 24px;
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 40px;
          text-align: center;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
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
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #fff;
        }

        .nav-item.active {
          background: rgba(0, 255, 136, 0.1);
          color: var(--primary);
        }

        .icon {
          font-size: 20px;
        }
      `}</style>
    </aside>
  );
}
