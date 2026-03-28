"use client";

import { useState, useEffect } from "react";
import { getAdminStaff } from "@/lib/api/admin";

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await getAdminStaff();
        setStaff(data);
      } catch (err) {
        console.error("Failed to fetch staff", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading staff...</div>;

  return (
    <div className="page-container">
      <div className="header-actions">
        <h1>Staff Management</h1>
        <button className="btn-primary">+ Add New Staff</button>
      </div>

      <div className="filters">
        <button className="filter-btn active">All</button>
        <button className="filter-btn">Trainers</button>
        <button className="filter-btn">Cleaners</button>
        <button className="filter-btn">Reception</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Salary</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id}>
                <td>
                  <div className="user-info">
                    <div className="avatar">{member.name[0]}</div>
                    <span>{member.name}</span>
                  </div>
                </td>
                <td>{member.role}</td>
                <td>{member.salary}</td>
                <td>{member.shift}</td>
                <td>
                  <span className={`status ${member.status === "Active" ? "active" : "inactive"}`}>
                    {member.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn">Edit</button>
                  <button className="action-btn delete">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .page-container {
          color: var(--text);
        }

        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .btn-primary {
          background: var(--primary);
          color: #000;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
        }

        .btn-primary:hover {
          background: #b8e600;
        }

        .filters {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .filter-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: 0.3s;
        }

        .filter-btn.active,
        .filter-btn:hover {
          background: rgba(0, 255, 136, 0.1);
          color: var(--primary);
          border-color: var(--primary);
        }

        .table-container {
          background: var(--glass-bg, rgba(30, 41, 59, 0.4));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--card-shadow, 0 10px 40px -10px rgba(0, 0, 0, 0.3));
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
          padding: 16px 24px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .data-table th {
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 14px;
        }

        .data-table td {
          color: var(--text);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: var(--primary);
        }

        .status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .status.active {
          background: rgba(0, 255, 136, 0.1);
          color: var(--primary);
        }

        .status.inactive {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
        }

        .action-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          margin-right: 8px;
          font-size: 12px;
          transition: 0.3s;
        }

        .action-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .action-btn.delete:hover {
          border-color: #ff4d4d;
          color: #ff4d4d;
        }
      `}</style>
    </div>
  );
}
