"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="landing-container">
      {/* HEADER */}
      <header className="header">
        <div className="logo">GYM BROS</div>

        <nav className={`nav-menu ${isMenuOpen ? "open" : ""}`}>
          <ul className="nav-links">
            <li><Link href="/">Home</Link></li>
            <li><Link href="#features">Features</Link></li>
            <li><Link href="#prices">Prices</Link></li>
            <li><Link href="#demo">Demo</Link></li>
            <li><Link href="/auth/login" className="nav-btn login">Login</Link></li>
            <li><Link href="/auth/signup" className="nav-btn signup">Register</Link></li>
          </ul>
        </nav>

        <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>
            Build Your <span className="text-glow">Best Body</span>
          </h1>
          <p>
            Transform yourself with GYM BROS — track your fitness, manage
            memberships, and stay motivated every day.
          </p>

          <div className="hero-buttons">
            <Link href="/auth/signup">
              <button className="hero-btn primary">Start Your Journey</button>
            </Link>
            <Link href="#demo">
              <button className="hero-btn secondary">Watch Demo</button>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="section features-section">
        <h2 className="section-title">Why <span className="highlight">GymBross?</span></h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon">💪</div>
            <h3>Track Progress</h3>
            <p>Monitor your gains, weight loss, and body metrics with intuitive charts.</p>
          </div>
          <div className="feature-card">
            <div className="icon">📅</div>
            <h3>Smart Scheduling</h3>
            <p>Manage staff shifts, personal training sessions, and gym capacity effortlessly.</p>
          </div>
          <div className="feature-card">
            <div className="icon">🥗</div>
            <h3>Diet Plans</h3>
            <p>Customized nutrition plans and calorie tracking to fuel your workouts.</p>
          </div>
          <div className="feature-card">
            <div className="icon">💳</div>
            <h3>Easy Payments</h3>
            <p>Seamless membership management and automated payment reminders.</p>
          </div>
        </div>
      </section>

      {/* PRICES SECTION */}
      <section id="prices" className="section prices-section">
        <h2 className="section-title">Simple <span className="highlight">Pricing</span></h2>
        <div className="pricing-grid">
          <div className="price-card">
            <h3>Starter</h3>
            <div className="price">$29<span>/mo</span></div>
            <ul>
              <li>Basic Member Tracking</li>
              <li>Staff Management</li>
              <li>Standard Support</li>
            </ul>
            <button className="price-btn">Choose Starter</button>
          </div>
          <div className="price-card popular">
            <div className="badge">Most Popular</div>
            <h3>Pro</h3>
            <div className="price">$59<span>/mo</span></div>
            <ul>
              <li>Advanced Analytics</li>
              <li>Inventory Tracking</li>
              <li>Priority Support</li>
              <li>Custom Branding</li>
            </ul>
            <button className="price-btn primary">Choose Pro</button>
          </div>
          <div className="price-card">
            <h3>Enterprise</h3>
            <div className="price">$99<span>/mo</span></div>
            <ul>
              <li>Multi-Branch Support</li>
              <li>API Access</li>
              <li>Dedicated Account Manager</li>
            </ul>
            <button className="price-btn">Contact Us</button>
          </div>
        </div>
      </section>

      {/* DEMO SECTION */}
      <section id="demo" className="section demo-section">
        <h2 className="section-title">See it in <span className="highlight">Action</span></h2>
        <div className="demo-container">
          <div className="demo-placeholder">
            <p>▶ Play Demo Video</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">GYM BROS</div>
          <p>&copy; 2024 GymBross Inc. All rights reserved.</p>
        </div>
      </footer>

      {/* PAGE STYLES */}
      <style jsx>{`
        :global(html) {
          scroll-behavior: smooth;
        }

        .landing-container {
          min-height: 100vh;
          background: var(--bg-dark);
          color: var(--text);
          font-family: 'Poppins', sans-serif;
        }

        /* HEADER */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 3rem;
          backdrop-filter: blur(10px);
          background: rgba(10, 15, 13, 0.8);
          position: fixed;
          width: 100%;
          z-index: 1000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .logo {
          font-size: 28px;
          font-weight: 800;
          color: var(--primary);
          text-shadow: 0 0 12px var(--primary);
          letter-spacing: 1px;
        }

        .nav-links {
          list-style: none;
          display: flex;
          gap: 2rem;
          align-items: center;
          margin: 0;
          padding: 0;
        }

        .nav-links a {
          color: var(--text);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        .nav-links a:hover {
          color: var(--primary);
        }

        .nav-btn {
          padding: 8px 20px;
          border-radius: 20px;
          transition: all 0.3s;
        }

        .nav-btn.login {
          border: 1px solid var(--primary);
          color: var(--primary);
        }

        .nav-btn.login:hover {
          background: rgba(217, 250, 112, 0.1);
        }

        .nav-btn.signup {
          background: var(--primary);
          color: #000 !important;
          font-weight: 700;
        }

        .nav-btn.signup:hover {
          background: var(--primary-dark);
          box-shadow: 0 0 15px rgba(217, 250, 112, 0.4);
        }

        .hamburger {
          display: none;
          flex-direction: column;
          gap: 6px;
          cursor: pointer;
        }

        .hamburger span {
          width: 25px;
          height: 3px;
          background: var(--text);
          border-radius: 2px;
        }

        /* HERO SECTION */
        .hero-section {
          height: 100vh;
          background: url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop") center/cover no-repeat;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          padding-top: 80px;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(5, 8, 7, 1));
        }

        .hero-content {
          position: relative;
          text-align: center;
          max-width: 800px;
          padding: 0 20px;
          animation: fadeIn 1.5s ease-out;
          z-index: 1;
        }

        .hero-content h1 {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .text-glow {
          color: var(--primary);
          text-shadow: 0 0 20px rgba(217, 250, 112, 0.5);
        }

        .hero-content p {
          font-size: 1.25rem;
          color: var(--text-light);
          margin-bottom: 2.5rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
        }

        .hero-btn {
          padding: 16px 40px;
          border: none;
          font-weight: bold;
          border-radius: 30px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .hero-btn.primary {
          background: var(--primary);
          color: #000;
        }

        .hero-btn.primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(217, 250, 112, 0.3);
        }

        .hero-btn.secondary {
          background: transparent;
          border: 2px solid var(--text);
          color: var(--text);
        }

        .hero-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-3px);
        }

        /* SECTIONS COMMON */
        .section {
          padding: 6rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 4rem;
          font-weight: 700;
        }

        .highlight {
          color: var(--primary);
        }

        /* FEATURES */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.03);
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform 0.3s;
          text-align: center;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--primary);
        }

        .feature-card .icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          margin-bottom: 1rem;
          color: var(--primary);
        }

        .feature-card p {
          color: var(--text-light);
          line-height: 1.6;
        }

        /* PRICES */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          align-items: center;
        }

        .price-card {
          background: rgba(255, 255, 255, 0.03);
          padding: 3rem 2rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          text-align: center;
          position: relative;
        }

        .price-card.popular {
          background: rgba(217, 250, 112, 0.05);
          border-color: var(--primary);
          transform: scale(1.05);
          z-index: 2;
        }

        .badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--primary);
          color: #000;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .price-card h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .price {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 2rem;
          color: var(--text);
        }

        .price span {
          font-size: 1rem;
          color: var(--text-light);
          font-weight: 400;
        }

        .price-card ul {
          list-style: none;
          padding: 0;
          margin-bottom: 2rem;
          text-align: left;
        }

        .price-card ul li {
          margin-bottom: 1rem;
          color: var(--text-light);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .price-card ul li::before {
          content: "✓";
          color: var(--primary);
          font-weight: bold;
        }

        .price-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid var(--text);
          background: transparent;
          color: var(--text);
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
        }

        .price-btn.primary {
          background: var(--primary);
          border-color: var(--primary);
          color: #000;
        }

        .price-btn:hover {
          transform: scale(1.02);
        }

        /* DEMO */
        .demo-container {
          max-width: 900px;
          margin: 0 auto;
          aspect-ratio: 16/9;
          background: #000;
          border-radius: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
          cursor: pointer;
          transition: all 0.3s;
        }

        .demo-container:hover {
          border-color: var(--primary);
          box-shadow: 0 0 50px rgba(217, 250, 112, 0.1);
        }

        .demo-placeholder {
          text-align: center;
          color: var(--text-light);
        }

        .demo-placeholder p {
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* FOOTER */
        .footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 3rem;
          text-align: center;
          margin-top: 4rem;
          background: #050807;
        }

        .footer-logo {
          font-weight: 800;
          font-size: 1.5rem;
          color: var(--primary);
          margin-bottom: 1rem;
        }

        .footer p {
          color: var(--text-light);
          font-size: 0.9rem;
        }

        /* ANIMATIONS */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .header {
            padding: 1rem 1.5rem;
          }

          .hamburger {
            display: flex;
          }

          .nav-menu {
            position: fixed;
            top: 0;
            right: -100%;
            width: 70%;
            height: 100vh;
            background: #111;
            padding: 4rem 2rem;
            transition: 0.3s;
            box-shadow: -5px 0 20px rgba(0,0,0,0.5);
          }

          .nav-menu.open {
            right: 0;
          }

          .nav-links {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-content h1 {
            font-size: 2.5rem;
          }

          .hero-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
