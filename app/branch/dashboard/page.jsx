'use client';

import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
import { FaUsers, FaDumbbell, FaChartLine, FaArrowUp, FaArrowDown, FaUserPlus, FaBoxOpen } from 'react-icons/fa';
import Link from 'next/link';
import { getDashboardStats } from '@/lib/api/branch';

export default function BranchDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (error) {
                console.error('Error fetching branch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    if (loading) {
        return (
            <div className={styles.dashboardContainer}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Branch Dashboard</h1>
                    <p className={styles.subtitle}>Loading statistics...</p>
                </header>
                <div className={styles.statsGrid}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`${styles.card} ${styles.skeleton}`}>
                            <div style={{ height: '80px' }}></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            {/* Header */}
            <header className={styles.header}>
                <h1 className={styles.title}>Branch Dashboard</h1>
                <p className={styles.subtitle}>Welcome back, Manager. Here's what's happening today.</p>
            </header>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {/* Total Members */}
                <div className={styles.card}>
                    <div className={styles.statCardContent}>
                        <div className={`${styles.iconBubble} ${styles.iconBlue}`}>
                            <FaUsers />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Total Members</span>
                            <span className={styles.statValue}>{stats?.totalMembers?.toLocaleString() || 0}</span>
                            <div className={`${styles.statChange} ${styles.trendUp}`}>
                                <FaArrowUp style={{ display: 'inline', marginRight: '4px' }} />
                                <span>{stats?.memberGrowth || '0%'} this month</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Staff */}
                <div className={styles.card}>
                    <div className={styles.statCardContent}>
                        <div className={`${styles.iconBubble} ${styles.iconOrange}`}>
                            <FaDumbbell />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Active Staff</span>
                            <span className={styles.statValue}>{stats?.activeTrainers || 0}</span>
                            <div className={`${styles.statChange} ${styles.trendNeutral}`}>
                                <span>{stats?.trainerGrowth || 'Stable'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className={styles.card}>
                    <div className={styles.statCardContent}>
                        <div className={`${styles.iconBubble} ${styles.iconGreen}`}>
                            <FaChartLine />
                        </div>
                        <div className={styles.statInfo}>
                            <span className={styles.statLabel}>Monthly Revenue</span>
                            <span className={styles.statValue}>
                                ${stats?.monthlyRevenue ? (stats.monthlyRevenue >= 1000 ? (stats.monthlyRevenue / 1000).toFixed(1) + 'k' : stats.monthlyRevenue) : '0'}
                            </span>
                            <div className={`${styles.statChange} ${styles.trendUp}`}>
                                <FaArrowUp style={{ display: 'inline', marginRight: '4px' }} />
                                <span>{stats?.revenueGrowth || '0%'} vs last month</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid: Recent Activity & Quick Actions */}
            <div className={styles.mainGrid}>
                {/* Recent Activity */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Recent Activity</h3>
                    <div className={styles.activityList}>
                        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                            stats.recentActivity.map((activity) => (
                                <div key={activity.id} className={styles.activityItem}>
                                    <div className={styles.avatar}>{activity.userInitials || 'U'}</div>
                                    <div className={styles.activityText}>
                                        <p className={styles.activityMessage}>{activity.message}</p>
                                        <span className={styles.activityTime}>{activity.timeAgo}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={styles.noData}>No recent activity found.</p>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Quick Actions</h3>
                    <div className={styles.actionsGrid}>
                        <Link href="/branch/users" className={styles.actionBtn}>
                            <FaUserPlus className={styles.actionIcon} />
                            <span className={styles.actionLabel}>Add Member</span>
                        </Link>
                        <Link href="/branch/inventory" className={styles.actionBtn}>
                            <FaBoxOpen className={styles.actionIcon} />
                            <span className={styles.actionLabel}>Inventory</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
