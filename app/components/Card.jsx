export default function Card({ title, value, subtitle, icon, trend }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="title">{title}</span>
        <span className="icon">{icon}</span>
      </div>
      <div className="value">{value}</div>
      <div className="footer">
        <span className={`trend ${trend > 0 ? "up" : "down"}`}>
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
        <span className="subtitle">{subtitle}</span>
      </div>

      <style jsx>{`
        .card {
          background: var(--glass-bg, rgba(30, 41, 59, 0.4));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: var(--card-shadow, 0 10px 40px -10px rgba(0, 0, 0, 0.3));
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title {
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
        }

        .icon {
          font-size: 20px;
          background: rgba(255, 255, 255, 0.05);
          padding: 8px;
          border-radius: 8px;
          color: var(--text);
        }

        .value {
          font-size: 32px;
          font-weight: 700;
          color: var(--text);
        }

        .footer {
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 13px;
        }

        .trend {
          font-weight: 600;
        }

        .trend.up { color: var(--primary); }
        .trend.down { color: #ff4d4d; }

        .subtitle {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
