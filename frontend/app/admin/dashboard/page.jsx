"use client";

import { useState, useEffect } from "react";
import { getAdminBranches, getAdminStats, resendBranchVerification } from "@/lib/api/admin";
import { setCookie } from "@/lib/cookie";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    // Mock data for branches (simulating API fetch)
    const [branches, setBranches] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [branchesData, statsData] = await Promise.all([
                    getAdminBranches(),
                    getAdminStats()
                ]);
                setBranches(branchesData);
                setStats(statsData);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleResendVerification = async (branchId) => {
        try {
            setActionLoading(true);
            await resendBranchVerification(branchId);
            alert("Verification email sent successfully!");
        } catch (err) {
            console.error("Resend failed", err);
            alert("Failed to resend verification: " + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAccessDashboard = (branchId) => {
        // Set branchId cookie to switch context
        setCookie('branchId', branchId, null);
        // Redirect to branch dashboard
        router.push('/branch/dashboard');
    };

    if (loading) return <div className="p-10 text-center">Loading organization overview...</div>;

    return (
        <div className="admin-dashboard">
            <h1 className="page-title">Organization Overview</h1>

            <div className="stats-grid">
                <div className="stat-card glass-panel">
                    <h3>Total Branches</h3>
                    <div className="value">{branches.length}</div>
                </div>
                <div className="stat-card glass-panel">
                    <h3>Total Members</h3>
                    <div className="value">{stats?.totalMembers || 0}</div>
                </div>
                <div className="stat-card glass-panel">
                    <h3>Active Staff</h3>
                    <div className="value">{stats?.activeTrainers || 0}</div>
                </div>
            </div>

            <h2 className="section-title">All Branches</h2>
            <div className="branches-grid">
                {branches.map(branch => (
                    <div key={branch.id} className="branch-card glass-panel">
                        <div className="branch-header">
                            <h3>{branch.name}</h3>
                            <span className={`status-badge ${branch.status?.toLowerCase()}`}>{branch.status}</span>
                        </div>
                        <div className="branch-details">
                            <p><strong>Code:</strong> {branch.branchCode}</p>
                            <p><strong>Admin:</strong> {branch.adminEmail}</p>
                            <p>
                                <strong>Status:</strong>
                                <span className={`verification-text ${branch.adminEmailVerified ? 'verified' : 'unverified'}`}>
                                    {branch.adminEmailVerified ? ' Verified' : ' Not Verified'}
                                </span>
                            </p>
                            <p><strong>Members:</strong> {branch.memberCount}</p>
                        </div>
                        <div className="branch-actions">
                            {!branch.adminEmailVerified && (
                                <button
                                    className="gm-btn secondary mb-2"
                                    onClick={() => handleResendVerification(branch.id)}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Sending...' : 'Send Verification'}
                                </button>
                            )}
                            <button
                                className="gm-btn primary"
                                onClick={() => handleAccessDashboard(branch.id)}
                            >
                                Access Dashboard
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add New Branch Card */}
                <div className="branch-card glass-panel add-new">
                    <div className="add-content">
                        <span className="plus-icon">+</span>
                        <p>Add New Branch</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .admin-dashboard {
                    color: #fff;
                }

                .page-title {
                    font-size: 28px;
                    margin-bottom: 30px;
                    font-weight: 700;
                }

                .section-title {
                    font-size: 20px;
                    margin: 40px 0 20px;
                    color: #ccc;
                }

                .glass-panel {
                    background: rgba(20, 20, 20, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 16px;
                    padding: 20px;
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                }

                /* Stats Grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }

                .stat-card h3 {
                    color: #888;
                    font-size: 14px;
                    margin: 0 0 10px 0;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .stat-card .value {
                    font-size: 36px;
                    font-weight: 700;
                    color: var(--primary);
                }

                /* Branches Grid */
                .branches-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 25px;
                }

                .branch-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(255, 255, 255, 0.1);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }

                .branch-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    padding-bottom: 15px;
                }

                .branch-header h3 {
                    margin: 0;
                    font-size: 18px;
                    color: #fff;
                }

                .status-badge {
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .status-badge.active {
                    background: rgba(0, 255, 136, 0.1);
                    color: var(--primary);
                }

                .status-badge.setup {
                    background: rgba(255, 193, 7, 0.1);
                    color: #ffc107;
                }

                .branch-details p {
                    margin: 8px 0;
                    color: #aaa;
                    font-size: 14px;
                }

                .branch-details strong {
                    color: #fff;
                }

                .branch-actions {
                    margin-top: 20px;
                }

                .gm-btn {
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: none;
                }

                .gm-btn.primary {
                    background: var(--primary);
                    color: #000;
                    width: 100%;
                }

                .gm-btn.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    width: 100%;
                }

                .gm-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .gm-btn.primary:hover {
                    background: #00e676;
                    box-shadow: 0 0 15px rgba(0, 255, 136, 0.3);
                }

                .mb-2 {
                    margin-bottom: 10px;
                }

                .verification-text {
                    font-size: 13px;
                    margin-left: 5px;
                }

                .verification-text.verified {
                    color: var(--primary);
                }

                .verification-text.unverified {
                    color: #ff4d4d;
                }

                /* Add New Card */
                .add-new {
                    border: 2px dashed rgba(255, 255, 255, 0.1);
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    min-height: 200px;
                }

                .add-new:hover {
                    border-color: var(--primary);
                    background: rgba(0, 255, 136, 0.02);
                }

                .add-content {
                    text-align: center;
                    color: #888;
                }

                .plus-icon {
                    font-size: 40px;
                    display: block;
                    margin-bottom: 10px;
                    color: var(--primary);
                }
            `}</style>
        </div>
    );
}
