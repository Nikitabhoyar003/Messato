import React, { useState } from "react";
import "./VendorSubscriptionsPage.css";
import { FiUsers, FiClock, FiTrendingUp, FiActivity, FiPauseCircle, FiRefreshCw } from "react-icons/fi";

const VendorSubscriptionsPage = () => {
  // Mock data for initial UI demonstration
  const [subscriptions] = useState([
    {
      id: "SUB101",
      customer: "Amit Verma",
      plan: "Monthly Executive",
      type: "Lunch + Dinner",
      startDate: "2024-04-10",
      endDate: "2024-05-10",
      daysLeft: 12,
      totalDays: 30,
      price: 4500,
      status: "active"
    },
    {
      id: "SUB102",
      customer: "Sneha Patil",
      plan: "Weekly Budget",
      type: "Dinner Only",
      startDate: "2024-05-01",
      endDate: "2024-05-07",
      daysLeft: 3,
      totalDays: 7,
      price: 1200,
      status: "active"
    },
    {
      id: "SUB103",
      customer: "Rahul Khanna",
      plan: "Monthly Lunch",
      type: "Lunch Only",
      startDate: "2024-04-15",
      endDate: "2024-05-15",
      daysLeft: 18,
      totalDays: 30,
      price: 2800,
      status: "active"
    }
  ]);

  return (
    <div className="subscriptions-container">
      <div className="page-header">
        <h2 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Subscription Hub</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Manage your ongoing customer tiffin plans and renewals</p>
      </div>

      {/* STATS BAR */}
      <div className="subs-stats-grid">
        <div className="stat-premium-card">
          <div className="stat-icon-wrapper icon-blue"><FiUsers /></div>
          <div className="stat-info">
            <h4>Active Tiffins</h4>
            <h3>{subscriptions.length}</h3>
          </div>
        </div>
        <div className="stat-premium-card">
          <div className="stat-icon-wrapper icon-green"><FiTrendingUp /></div>
          <div className="stat-info">
            <h4>Monthly Revenue</h4>
            <h3>₹ 8,500</h3>
          </div>
        </div>
        <div className="stat-premium-card">
          <div className="stat-icon-wrapper icon-orange"><FiClock /></div>
          <div className="stat-info">
            <h4>Expiring Soon</h4>
            <h3>2</h3>
          </div>
        </div>
      </div>

      {/* SUBSCRIPTION GRID */}
      <div className="subs-list-grid">
        {subscriptions.map((sub, index) => (
          <div key={sub.id} className="sub-glass-card">
            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.7rem', color: '#94a3b8' }}>
              #{index + 1}
            </div>
            <div className="sub-card-header">
              <div className="user-meta">
                <div className="user-avatar">{sub.customer.charAt(0)}</div>
                <div className="user-name-box">
                  <h4>{sub.customer}</h4>
                  <span>ID: {sub.id}</span>
                </div>
              </div>
              <span className={`plan-badge ${sub.totalDays > 7 ? 'plan-monthly' : 'plan-weekly'}`}>
                {sub.plan}
              </span>
            </div>

            <div className="sub-details-box">
              <div className="detail-row">
                <span className="label">Plan Type</span>
                <span className="value">{sub.type}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status</span>
                <span className="value">
                  <span className="status-active-pulse"></span>
                  {sub.status.toUpperCase()}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Amount</span>
                <span className="value">₹ {sub.price}</span>
              </div>
            </div>

            <div className="days-left-container">
              <div className="progress-labels">
                <span>Days Remaining</span>
                <span>{sub.daysLeft} / {sub.totalDays}</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(sub.daysLeft / sub.totalDays) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="sub-actions">
              <button className="btn-sub btn-pause">
                <FiPauseCircle style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                Pause
              </button>
              <button className="btn-sub btn-renew">
                <FiRefreshCw style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                Renew
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorSubscriptionsPage;
