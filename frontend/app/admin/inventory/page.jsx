"use client";

import { useState, useEffect } from "react";
import { getAdminInventory } from "@/lib/api/admin";

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await getAdminInventory();
        setInventory(data);
      } catch (err) {
        console.error("Failed to fetch inventory", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading inventory...</div>;

  return (
    <div className="page-container">
      <div className="header-actions">
        <h1>Inventory Management</h1>
        <button className="btn-primary">+ Add Equipment</button>
      </div>

      <div className="inventory-grid">
        {inventory.map((item) => (
          <div key={item.id} className="inventory-card">
            <div className="card-header">
              <h3>{item.name}</h3>
              <span className={`condition ${item.condition.toLowerCase().replace(" ", "-")}`}>
                {item.condition}
              </span>
            </div>
            <div className="card-body">
              <div className="detail">
                <span className="label">Category:</span>
                <span className="value">{item.category}</span>
              </div>
              <div className="detail">
                <span className="label">Quantity:</span>
                <span className="value">{item.quantity}</span>
              </div>
              <div className="detail">
                <span className="label">Purchase Date:</span>
                <span className="value">{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : "N/A"}</span>
              </div>
            </div>
            <div className="card-footer">
              <button className="action-btn">Edit</button>
              <button className="action-btn delete">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .page-container {
          color: var(--text);
        }

        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
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

        .inventory-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .inventory-card {
          background: var(--glass-bg, rgba(30, 41, 59, 0.4));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
          border-radius: 16px;
          padding: 20px;
          transition: transform 0.3s;
          box-shadow: var(--card-shadow, 0 10px 40px -10px rgba(0, 0, 0, 0.3));
        }

        .inventory-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .card-header h3 {
          margin: 0;
          font-size: 18px;
          color: var(--text);
        }

        .condition {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 600;
        }

        .condition.good, .condition.excellent {
          background: rgba(0, 255, 136, 0.1);
          color: var(--primary);
        }

        .condition.fair {
          background: rgba(255, 209, 102, 0.1);
          color: #ffd166;
        }

        .condition.needs-service {
          background: rgba(255, 77, 77, 0.1);
          color: #ff4d4d;
        }

        .card-body {
          margin-bottom: 20px;
        }

        .detail {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .label {
          color: var(--text-secondary);
        }

        .value {
          color: var(--text);
        }

        .card-footer {
          display: flex;
          gap: 10px;
        }

        .action-btn {
          flex: 1;
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: var(--text-secondary);
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--primary);
        }

        .action-btn.delete:hover {
          background: rgba(255, 77, 77, 0.1);
          color: #ff4d4d;
        }
      `}</style>
    </div>
  );
}
