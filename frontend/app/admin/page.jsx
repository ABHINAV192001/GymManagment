"use client";

import { useState, useEffect } from "react";
import { getAdminStats } from "@/lib/api/admin";
import Card from "../components/Card";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, Admin</p>
      </header>

      <div className="stats-grid">
        <Card
          title="Total Members"
          value={stats?.totalMembers || 0}
          subtitle={stats?.memberGrowth || "vs last month"}
          trend={12}
          icon="👥"
        />
        <Card
          title="Active Trainers"
          value={stats?.activeTrainers || 0}
          subtitle={stats?.trainerGrowth || "vs last month"}
          trend={5}
          icon="👔"
        />
        <Card
          title="Monthly Revenue"
          value={`$${stats?.monthlyRevenue || 0}`}
          subtitle={stats?.revenueGrowth || "vs last month"}
          trend={8.5}
          icon="💰"
        />
        <Card
          title="Pending Renewals"
          value={stats?.pendingRenewals || 0}
          subtitle={stats?.renewalTrend || "vs last month"}
          trend={-2.4}
          icon="📝"
        />
      </div>

      <div className="charts-section">
        <div className="chart-card main">
          <h3>Revenue Growth</h3>
          <div className="chart-placeholder">
            {/* Placeholder for Chart */}
            <div className="bar" style={{ height: '40%' }}></div>
            <div className="bar" style={{ height: '60%' }}></div>
            <div className="bar" style={{ height: '55%' }}></div>
            <div className="bar" style={{ height: '75%' }}></div>
            <div className="bar" style={{ height: '65%' }}></div>
            <div className="bar" style={{ height: '85%' }}></div>
            <div className="bar" style={{ height: '95%' }}></div>
          </div>
        </div>

        <div className="chart-card side">
          <h3>Member Distribution</h3>
          <div className="pie-placeholder">
            <div className="pie-segment"></div>
          </div>
          <ul className="legend">
            <li><span className="dot" style={{ background: 'var(--primary)' }}></span> Active (65%)</li>
            <li><span className="dot" style={{ background: '#4c8bf5' }}></span> New (25%)</li>
            <li><span className="dot" style={{ background: '#ff4d4d' }}></span> Inactive (10%)</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .page-header {
          margin-bottom: 30px;
        }

        .page-header h1 {
          font-size: 32px;
          margin-bottom: 5px;
          color: var(--text);
        }

        .page-header p {
          color: var(--text-secondary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .charts-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        .chart-card {
          background: var(--glass-bg, rgba(30, 41, 59, 0.4));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
          box-shadow: var(--card-shadow, 0 10px 40px -10px rgba(0, 0, 0, 0.3));
          border-radius: 20px;
          padding: 24px;
        }

        .chart-card h3 {
          margin-bottom: 20px;
          color: var(--text);
        }

        .chart-placeholder {
          height: 300px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 20px 0;
          gap: 10px;
        }

        .bar {
          flex: 1;
          background: linear-gradient(to top, rgba(0, 255, 136, 0.2), var(--primary));
          border-radius: 4px 4px 0 0;
          transition: height 0.5s;
        }

        .pie-placeholder {
          height: 200px;
          width: 200px;
          border-radius: 50%;
          background: conic-gradient(
            var(--primary) 0% 65%, 
            #4c8bf5 65% 90%, 
            #ff4d4d 90% 100%
          );
          margin: 0 auto 20px;
          position: relative;
        }

        .pie-placeholder::after {
          content: "";
          position: absolute;
          inset: 40px;
          background: rgba(30, 41, 59, 0.6); /* Approximate bg for donut hole */
          border-radius: 50%;
        }

        .legend {
          list-style: none;
          padding: 0;
        }

        .legend li {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        @media (max-width: 1024px) {
          .charts-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
