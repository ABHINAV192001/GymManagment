"use client";

import Card from "../../components/Card";

export default function AnalysisPage() {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Gym Analysis</h1>
        <p>Detailed performance metrics and growth reports.</p>
      </header>

      <div className="kpi-grid">
        <Card title="Retention Rate" value="85%" subtitle="Top 10% in region" trend={2.1} icon="🔄" />
        <Card title="Avg. Attendance" value="145" subtitle="Daily visits" trend={5.4} icon="👟" />
        <Card title="Equipment Usage" value="78%" subtitle="Peak hours" trend={-1.2} icon="⚙️" />
      </div>

      <div className="analysis-grid">
        <div className="chart-box large">
          <h3>Monthly Revenue vs Expenses</h3>
          <div className="chart-placeholder line-chart">
            <svg viewBox="0 0 100 40" className="chart-svg">
              <path d="M0 35 Q 10 30, 20 32 T 40 25 T 60 15 T 80 20 T 100 10" fill="none" stroke="var(--primary)" strokeWidth="2" />
              <path d="M0 38 Q 10 36, 20 37 T 40 35 T 60 30 T 80 32 T 100 28" fill="none" stroke="#ff4d4d" strokeWidth="2" strokeDasharray="4" />
            </svg>
            <div className="chart-legend">
              <span><span className="dot primary"></span> Revenue</span>
              <span><span className="dot danger"></span> Expenses</span>
            </div>
          </div>
        </div>

        <div className="chart-box">
          <h3>Peak Hours</h3>
          <div className="chart-placeholder bar-chart">
            {[40, 60, 80, 100, 70, 50, 30].map((h, i) => (
              <div key={i} className="bar-wrapper">
                <div className="bar" style={{ height: `${h}%` }}></div>
                <span className="label">{6 + i * 2}am</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-box">
          <h3>Member Demographics</h3>
          <div className="demographics-list">
            <div className="demo-item">
              <span>18-25 Years</span>
              <div className="progress"><div className="fill" style={{ width: '45%' }}></div></div>
              <span>45%</span>
            </div>
            <div className="demo-item">
              <span>26-35 Years</span>
              <div className="progress"><div className="fill" style={{ width: '30%' }}></div></div>
              <span>30%</span>
            </div>
            <div className="demo-item">
              <span>36-50 Years</span>
              <div className="progress"><div className="fill" style={{ width: '15%' }}></div></div>
              <span>15%</span>
            </div>
            <div className="demo-item">
              <span>50+ Years</span>
              <div className="progress"><div className="fill" style={{ width: '10%' }}></div></div>
              <span>10%</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          color: var(--text);
        }

        .page-header {
          margin-bottom: 30px;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .analysis-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .chart-box {
          background: var(--glass-bg, rgba(30, 41, 59, 0.4));
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
          border-radius: 16px;
          padding: 24px;
          box-shadow: var(--card-shadow, 0 10px 40px -10px rgba(0, 0, 0, 0.3));
        }

        .chart-box.large {
          grid-column: span 2;
        }

        .chart-box h3 {
          margin-bottom: 20px;
          color: var(--text);
          font-size: 18px;
        }

        .chart-placeholder {
          height: 250px;
          position: relative;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }

        .chart-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .chart-legend {
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: var(--text-secondary);
        }

        .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 5px;
        }

        .dot.primary { background: var(--primary); }
        .dot.danger { background: #ff4d4d; }

        .bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .bar {
          width: 60%;
          background: rgba(0, 255, 136, 0.2);
          border-radius: 4px;
          transition: height 0.5s;
        }

        .bar:hover {
          background: var(--primary);
        }

        .bar-wrapper .label {
          font-size: 10px;
          color: var(--text-secondary);
        }

        .demographics-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .demo-item {
          display: grid;
          grid-template-columns: 100px 1fr 40px;
          align-items: center;
          gap: 15px;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .progress {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .fill {
          height: 100%;
          background: var(--primary);
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .analysis-grid {
            grid-template-columns: 1fr;
          }
          .chart-box.large {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
}
