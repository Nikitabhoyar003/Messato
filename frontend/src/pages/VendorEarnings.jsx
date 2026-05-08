import { useEffect, useState, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  MdDashboard, MdBarChart, MdHistory, MdAccountBalanceWallet,
  MdRefresh, MdArrowDownward, MdTrendingUp,
  MdOutlineStorefront, MdLock, MdCheckCircle, MdError,
} from "react-icons/md";
import {
  RiMoneyDollarCircleLine, RiTimeLine,
  RiArrowLeftLine, RiArrowRightLine,
} from "react-icons/ri";
import {
  TbCashBanknote, TbPackage, TbTag, TbCircleCheck,
  TbArrowsExchange, TbReportMoney,
} from "react-icons/tb";
import { PiHandWithdrawLight } from "react-icons/pi";
import "./VendorEarning.css";

/* ─── Config ─── */
const API_BASE = "http://localhost:5000/api/orders";
const getToken = () => localStorage.getItem("token");
const authH = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});
const fmt  = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtK = (n) => {
  n = Number(n || 0);
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#6366f1"];

const TYPE_MAP = {
  ORDER_EARNING:  { icon: <TbPackage />,          label: "Order Earning",  bgClass: "icon-bg-green",  accent: "#dcfce7" },
  WITHDRAWAL:     { icon: <PiHandWithdrawLight />, label: "Withdrawal",     bgClass: "icon-bg-blue",   accent: "#dbeafe" },
  COD_COMMISSION: { icon: <TbTag />,              label: "COD Commission", bgClass: "icon-bg-amber",  accent: "#fef3c7" },
  COD_DEPOSIT:    { icon: <TbCashBanknote />,     label: "COD Deposit",    bgClass: "icon-bg-green",  accent: "#dcfce7" },
};

/* ─── Helpers ─── */
const StatusBadge = ({ status = "" }) => {
  const s = status.toLowerCase();
  return (
    <span className={`status-badge status-${s}`}>
      {s === "completed"  && <MdCheckCircle size={10} />}
      {(s === "processing" || s === "pending") && <RiTimeLine size={10} />}
      {s === "failed"     && <MdError size={10} />}
      {status}
    </span>
  );
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip-box">
      <div className="ct-label">{label}</div>
      <div className="ct-value">₹ {fmt(payload[0].value)}</div>
    </div>
  );
};

/* ─── Withdrawal Modal ─── */
const WithdrawModal = ({ wallet, methods, onClose, onSuccess }) => {
  const [step, setStep]       = useState(1);
  const [amount, setAmount]   = useState("");
  const [method, setMethod]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const MIN = 100, MAX = 500;
  const quick = [...new Set([100, 200, 300, Math.floor(Math.min(MAX, wallet.availableBalance))])]
    .filter(v => v >= MIN && v <= wallet.availableBalance);

  const validate = () => {
    const n = Number(amount);
    if (!n || isNaN(n))              return `Enter a valid amount`;
    if (n < MIN)                     return `Minimum withdrawal is ₹${MIN}`;
    if (n > MAX)                     return `Maximum per request is ₹${MAX}`;
    if (n > wallet.availableBalance) return "Insufficient balance";
    return "";
  };

  const next1 = () => { const e = validate(); if (e) { setError(e); return; } setError(""); setStep(2); };
  const next2 = () => { if (!method) { setError("Select a withdrawal method"); return; } setError(""); setStep(3); };

  const confirm = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API_BASE}/wallet/withdraw`, {
        method: "POST", headers: authH(),
        body: JSON.stringify({ amount: Number(amount), methodId: method.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Withdrawal failed");
      setStep(4); onSuccess(Number(amount));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-header-icon"><PiHandWithdrawLight size={22} /></div>
            <div>
              <div className="modal-header-title">Withdraw Funds</div>
              <div className="modal-header-sub">Available: <strong>₹ {fmt(wallet.availableBalance)}</strong></div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><MdArrowDownward size={14} /></button>
        </div>

        {step < 4 && (
          <div className="modal-steps">
            {["Amount", "Method", "Confirm"].map((s, i) => (
              <div key={s} className={`modal-step-item ${step === i+1 ? "s-active" : ""} ${step > i+1 ? "s-done" : ""}`}>
                <div className="step-circle">{step > i+1 ? <MdCheckCircle size={12} /> : i+1}</div>
                <span>{s}</span>
              </div>
            ))}
          </div>
        )}

        <div className="modal-body">
          {step === 1 && (
            <div className="modal-step-content">
              <div>
                <div className="field-label" style={{ marginBottom: 8 }}>Enter Amount</div>
                <div className="amount-input-wrap">
                  <div className="amount-prefix">₹</div>
                  <input type="number" className="amount-input" placeholder="0" autoFocus
                    value={amount} onChange={e => { setAmount(e.target.value); setError(""); }} />
                </div>
              </div>
              {quick.length > 0 && (
                <div className="quick-chips">
                  {quick.map(q => (
                    <button key={q} className={`quick-chip ${Number(amount) === q ? "active" : ""}`}
                      onClick={() => { setAmount(String(q)); setError(""); }}>₹{fmt(q)}</button>
                  ))}
                </div>
              )}
              {error && <div className="field-error"><MdError /> {error}</div>}
              <div className="info-box">
                <div className="info-row"><span>Min withdrawal</span><strong>₹{MIN}</strong></div>
                <div className="info-row"><span>Max per request</span><strong>₹{MAX}</strong></div>
                <div className="info-row"><span>Processing time</span><strong>1–2 business days</strong></div>
              </div>
              <button className="btn btn-primary" onClick={next1} style={{ justifyContent: "center" }}>
                Continue <RiArrowRightLine />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="modal-step-content">
              <div className="field-label">Select Method</div>
              {methods.length === 0 ? (
                <div className="empty-state" style={{ padding: "20px 0" }}>
                  <p>No payment methods found. Please update your bank details in your vendor profile.</p>
                </div>
              ) : (
                <div className="method-list">
                  {methods.map(m => (
                    <div key={m.id} className={`method-card ${method?.id === m.id ? "selected" : ""}`}
                      onClick={() => { setMethod(m); setError(""); }}>
                      <div className="method-card-icon">{m.icon}</div>
                      <div>
                        <div className="method-card-name">{m.label}</div>
                        <div className="method-card-value">{m.value}</div>
                      </div>
                      <div className="method-radio">{method?.id === m.id ? "●" : "○"}</div>
                    </div>
                  ))}
                </div>
              )}
              {error && <div className="field-error"><MdError /> {error}</div>}
              <div className="modal-footer">
                <button className="btn btn-outline btn-sm" onClick={() => setStep(1)}><RiArrowLeftLine /> Back</button>
                <button className="btn btn-primary btn-sm" onClick={next2} disabled={methods.length === 0}>Review <RiArrowRightLine /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="modal-step-content">
              <div className="confirm-summary">
                <div className="confirm-big-amount">₹ {fmt(amount)}</div>
                <div className="confirm-big-label">Withdrawal Amount</div>
                <div className="confirm-divider" />
                <div className="confirm-row"><span>To</span><strong>{method?.icon} {method?.label} — {method?.value}</strong></div>
                <div className="confirm-row"><span>Processing</span><strong>1–2 business days</strong></div>
                <div className="confirm-row highlight"><span>You receive</span><strong>₹ {fmt(amount)}</strong></div>
              </div>
              {error && <div className="field-error"><MdError /> {error}</div>}
              <div className="modal-footer">
                <button className="btn btn-outline btn-sm" onClick={() => setStep(2)} disabled={loading}><RiArrowLeftLine /> Back</button>
                <button className="btn btn-primary btn-sm" onClick={confirm} disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : <><TbCircleCheck /> Confirm</>}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="success-body">
              <div className="success-check"><MdCheckCircle size={28} /></div>
              <div className="success-title">Withdrawal Requested!</div>
              <div className="success-desc">₹ {fmt(amount)} will be credited to <strong>{method?.value}</strong> within 1–2 business days.</div>
              <div className="success-ref">REF: WTH-{Date.now().toString().slice(-6)}</div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={onClose}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Deposit Modal ─── */
const DepositModal = ({ wallet, onClose, onSuccess }) => {
  const [step, setStep]       = useState(1);
  const [amount, setAmount]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const cod = wallet.codHolding || 0;

  const validate = () => {
    const n = Number(amount);
    if (!n || n <= 0) return "Enter a valid amount";
    if (n > cod)      return `Cannot exceed COD holding ₹${fmt(cod)}`;
    return "";
  };
  const next = () => { const e = validate(); if (e) { setError(e); return; } setError(""); setStep(2); };
  const confirm = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API_BASE}/wallet/deposit-cod`, {
        method: "POST", headers: authH(),
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Deposit failed");
      setStep(3); onSuccess(Number(amount));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}>
          <div className="modal-header-left">
            <div className="modal-header-icon"><TbCashBanknote size={22} /></div>
            <div>
              <div className="modal-header-title">Deposit COD Cash</div>
              <div className="modal-header-sub">COD Holding: <strong>₹ {fmt(cod)}</strong></div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><MdArrowDownward size={14} /></button>
        </div>
        <div className="modal-body">
          {step === 1 && (
            <div className="modal-step-content">
              <div className="deposit-info-box">
                <span className="deposit-info-icon"><TbReportMoney /></span>
                <div className="deposit-info-text">
                  <strong>COD Cash Deposit</strong>
                  This transfers your collected Cash-on-Delivery payments from COD Holding to your Available Balance for withdrawal.
                </div>
              </div>
              <div>
                <div className="field-label" style={{ marginBottom: 8 }}>Deposit Amount</div>
                <div className="amount-input-wrap">
                  <div className="amount-prefix" style={{ color: "var(--green-600)", background: "var(--green-100)", borderColor: "#bbf7d0" }}>₹</div>
                  <input type="number" className="amount-input" placeholder="0" autoFocus
                    value={amount} onChange={e => { setAmount(e.target.value); setError(""); }} />
                </div>
              </div>
              {cod > 0 && (
                <div className="quick-chips">
                  <button className={`quick-chip ${Number(amount) === cod ? "active" : ""}`}
                    onClick={() => { setAmount(String(cod)); setError(""); }}>Full ₹{fmt(cod)}</button>
                </div>
              )}
              {error && <div className="field-error"><MdError /> {error}</div>}
              <div className="info-box">
                <div className="info-row"><span>COD Holding</span><strong>₹ {fmt(cod)}</strong></div>
                <div className="info-row"><span>Credited to</span><strong>Available Balance</strong></div>
              </div>
              <button className="btn btn-success" disabled={cod <= 0}
                onClick={next} style={{ justifyContent: "center" }}>
                {cod <= 0 ? "No COD Holding" : <>Continue <RiArrowRightLine /></>}
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="modal-step-content">
              <div className="confirm-summary">
                <div className="confirm-big-amount" style={{ color: "var(--green-700)" }}>₹ {fmt(amount)}</div>
                <div className="confirm-big-label">COD Deposit Amount</div>
                <div className="confirm-divider" />
                <div className="confirm-row"><span>From</span><strong>🔒 COD Holding</strong></div>
                <div className="confirm-row"><span>To</span><strong>💰 Available Balance</strong></div>
                <div className="confirm-row highlight" style={{ background: "var(--green-100)" }}>
                  <span>New Balance</span>
                  <strong style={{ color: "var(--green-700)" }}>₹ {fmt(wallet.availableBalance + Number(amount))}</strong>
                </div>
              </div>
              {error && <div className="field-error"><MdError /> {error}</div>}
              <div className="modal-footer">
                <button className="btn btn-outline btn-sm" onClick={() => setStep(1)} disabled={loading}><RiArrowLeftLine /> Back</button>
                <button className="btn btn-success btn-sm" onClick={confirm} disabled={loading}>
                  {loading ? <span className="btn-spinner" style={{ borderTopColor: "#fff" }} /> : <><TbCircleCheck /> Confirm</>}
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="success-body">
              <div className="success-check"><MdCheckCircle size={28} style={{ color: "var(--green-600)" }} /></div>
              <div className="success-title">COD Deposited!</div>
              <div className="success-desc">₹ {fmt(amount)} moved from COD Holding to your Available Balance.</div>
              <div className="success-ref" style={{ background: "var(--green-100)", color: "var(--green-700)", borderColor: "#bbf7d0" }}>
                REF: DEP-{Date.now().toString().slice(-6)}
              </div>
              <button className="btn btn-success" style={{ width: "100%", justifyContent: "center", marginTop: 4 }} onClick={onClose}>Done</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Analytics Tab ─── */
const AnalyticsTab = ({ graph, stats, wallet }) => {
  const [period, setPeriod] = useState("weekly");

  const dailyData = graph || [];

  const weeklyData = [
    { week: "4 Wk Ago", amount: Math.round(stats.monthly * 0.18) },
    { week: "3 Wk Ago", amount: Math.round(stats.monthly * 0.22) },
    { week: "2 Wk Ago", amount: Math.round(stats.monthly * 0.28) },
    { week: "This Wk",  amount: stats.weekly },
  ];

  const monthlyData = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label  = d.toLocaleDateString("en-IN", { month: "short" });
      const amount = i === 0 ? stats.monthly : Math.round(stats.monthly * (0.7 + i * 0.5));
      months.push({ month: label, amount });
    }
    return months;
  })();

  const chartData = period === "daily" ? dailyData : period === "weekly" ? weeklyData : monthlyData;
  const xKey      = period === "daily" ? "date"   : period === "weekly" ? "week"    : "month";

  const pieData = [
    { name: "Order Earnings", value: wallet.totalEarned        || 0 },
    { name: "Withdrawn",      value: wallet.withdrawn          || 0 },
    { name: "Processing",     value: wallet.processingBalance  || 0 },
    { name: "COD Holding",    value: wallet.codHolding         || 0 },
  ].filter(d => d.value > 0);

  const total = pieData.reduce((s, d) => s + d.value, 0);

  return (
    <>
      <div className="stat-grid">
        {[
          { label: "Today",      value: stats.today,        icon: <MdTrendingUp />,           bg: "icon-bg-blue",   accent: "accent-blue"   },
          { label: "This Week",  value: stats.weekly,       icon: <MdBarChart />,              bg: "icon-bg-indigo", accent: "accent-indigo" },
          { label: "This Month", value: stats.monthly,      icon: <RiMoneyDollarCircleLine />, bg: "icon-bg-green",  accent: "accent-green"  },
          { label: "All Time",   value: wallet.totalEarned, icon: <TbReportMoney />,           bg: "icon-bg-amber",  accent: "accent-amber"  },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-card-accent ${s.accent}`} />
            <div className="stat-card-header">
              <div className={`stat-card-icon ${s.bg}`}>{s.icon}</div>
            </div>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value">{fmtK(s.value)}</div>
            <div className="stat-card-sub">₹ {fmt(s.value)}</div>
          </div>
        ))}
      </div>

      <div className="chart-card" style={{ marginBottom: 16 }}>
        <div className="chart-card-header">
          <div>
            <div className="chart-card-title">Earnings Overview</div>
            <div className="chart-card-sub">
              {period === "daily" ? "Last 7 days" : period === "weekly" ? "Last 4 weeks" : "Last 6 months"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="chart-badge">
              {period === "daily"   ? `₹${fmt(stats.weekly)} / wk`
               : period === "weekly" ? `₹${fmt(stats.monthly)} / mo`
               : `₹${fmt(wallet.totalEarned)} total`}
            </span>
            <div className="period-tabs">
              {["daily", "weekly", "monthly"].map(p => (
                <button key={p} className={`period-tab ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3b82f6" stopOpacity={.15} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + "K" : v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fill="url(#grad1)"
                dot={{ fill: "#3b82f6", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#fff", stroke: "#3b82f6", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state"><div className="empty-state-icon">📊</div><p>No data available</p></div>
        )}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Weekly Earnings Comparison</div>
              <div className="chart-card-sub">Last 4 weeks</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="amount" radius={[5, 5, 0, 0]}>
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill={i === weeklyData.length - 1 ? "#3b82f6" : "#bfdbfe"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-card-title">Balance Breakdown</div>
              <div className="chart-card-sub">Wallet allocation</div>
            </div>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                    paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`₹ ${fmt(v)}`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {pieData.map((d, i) => (
                  <div key={d.name} className="pie-legend-item">
                    <div className="pie-legend-label">
                      <div className="pie-legend-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {d.name}
                    </div>
                    <div className="pie-legend-value">
                      {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state"><p>No data yet</p></div>
          )}
        </div>
      </div>
    </>
  );
};

/* ─── Main ─── */
const VendorEarnings = () => {
  const [data,         setData]         = useState(null);
  const [tab,          setTab]          = useState("dashboard");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit,  setShowDeposit]  = useState(false);
  const [loading,      setLoading]      = useState(true);
  // const [refreshing,   setRefreshing]   = useState(false);
  const [toast,        setToast]        = useState(null);

  const fire = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  };

  const fetchData = useCallback((silent = false) => {
    let cancelled = false;
    (async () => {
      try {
        if (!silent) setLoading(true);
        // else setRefreshing(true);

        const res  = await fetch(`${API_BASE}/wallet/panel`, { headers: authH() });
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();

        if (Array.isArray(json.graph)) {
          json.graph = json.graph.map(item => ({
            ...item,
            date: new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
          }));
        }

        let methods = [];
        try {
          const mr = await fetch(`${API_BASE}/vendor/payment-methods`, { headers: authH() });
          const mj = await mr.json();
          methods  = mj.methods || [];
        } catch { /* ignore */ }

        if (!cancelled) setData({ ...json, withdrawalMethods: methods });
      } catch (e) {
        if (!cancelled) fire(e.message || "Failed to load earnings", "error");
      } finally {
        if (!cancelled) { setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { const c = fetchData(); return c; }, [fetchData]);

  const handleWithdrawSuccess = (amount) => {
    setData(prev => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        availableBalance: prev.wallet.availableBalance - amount,
        withdrawn: prev.wallet.withdrawn + amount,
      },
      transactions: [{
        type: "WITHDRAWAL", amount: -amount, status: "Processing",
        created_at: new Date().toISOString(), ref: `WTH-${Date.now().toString().slice(-6)}`,
      }, ...(prev.transactions || [])],
    }));
    fire(`₹${fmt(amount)} withdrawal initiated!`);
  };

  const handleDepositSuccess = (amount) => {
    setData(prev => ({
      ...prev,
      wallet: {
        ...prev.wallet,
        availableBalance: prev.wallet.availableBalance + amount,
        codHolding: Math.max(0, prev.wallet.codHolding - amount),
      },
      transactions: [{
        type: "COD_DEPOSIT", amount, status: "Completed",
        created_at: new Date().toISOString(), ref: `DEP-${Date.now().toString().slice(-6)}`,
      }, ...(prev.transactions || [])],
    }));
    fire(`₹${fmt(amount)} COD deposit credited to balance!`);
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="loader" />
      <p>Loading earnings panel…</p>
    </div>
  );

  if (!data) return (
    <div className="loading-screen">
      <MdError size={28} color="#ef4444" />
      <p>Could not load data. Please refresh.</p>
    </div>
  );

  const vendor  = data.vendor            || {};
  const wallet  = data.wallet            || {};
  const stats   = data.stats             || {};
  const graph   = data.graph             || [];
  const txns    = data.transactions      || [];
  const methods = data.withdrawalMethods || [];
  // const initials = (vendor.name || "V").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const NAV = [
    { key: "dashboard", label: "Dashboard",    icon: <MdDashboard /> },
    { key: "analytics", label: "Analytics",    icon: <MdBarChart /> },
    { key: "history",   label: "Transactions", icon: <MdHistory /> },
  ];

  return (
    <div className="ve-root">

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-icon">{toast.type === "success" ? <MdCheckCircle /> : <MdError />}</span>
          {toast.msg}
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className="ve-navbar">
        <div className="ve-brand-name">{vendor.name || "My Store"}</div>

        <div className="ve-nav-tabs">
          {NAV.map(n => (
            <button
              key={n.key}
              className={`ve-nav-tab${tab === n.key ? " active" : ""}`}
              onClick={() => setTab(n.key)}
            >
              {n.label}
            </button>
          ))}
        </div>

        <div className="ve-navbar-right">
          <div className="ve-stat-chip">
            <span className="ve-stat-chip-label">Total Earned</span>
            <span className="ve-stat-chip-value">₹ {fmt(wallet.totalEarned)}</span>
          </div>
          <div className="ve-stat-chip">
            <span className="ve-stat-chip-label">Available</span>
            <span className="ve-stat-chip-value">₹ {fmt(wallet.availableBalance)}</span>
          </div>
          <button className="ve-withdraw-btn" onClick={() => setShowWithdraw(true)}>
            <PiHandWithdrawLight size={13} /> Withdraw
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <main className="ve-main">
        <div className="ve-page">

          {/* ── DASHBOARD ── */}
          {tab === "dashboard" && (
            <>
              <div className="stat-grid">
                {[
                  { label: "Available Balance", value: wallet.availableBalance,  sub: "Ready to withdraw",  icon: <MdAccountBalanceWallet />, bg: "icon-bg-blue",   accent: "accent-blue",   badge: null },
                  { label: "Processing",         value: wallet.processingBalance, sub: "Clearing 1-2 days",  icon: <RiTimeLine />,             bg: "icon-bg-amber",  accent: "accent-amber",  badge: null },
                  { label: "Total Withdrawn",    value: wallet.withdrawn,         sub: "All time",           icon: <PiHandWithdrawLight />,    bg: "icon-bg-indigo", accent: "accent-indigo", badge: null },
                  { label: "COD Holding",        value: wallet.codHolding,        sub: "Pending deposit",    icon: <MdLock />,                 bg: "icon-bg-red",    accent: "accent-red",    badge: wallet.codHolding > 0 ? "Deposit" : null },
                ].map(c => (
                  <div key={c.label} className="stat-card">
                    <div className={`stat-card-accent ${c.accent}`} />
                    <div className="stat-card-header">
                      <div className={`stat-card-icon ${c.bg}`}>{c.icon}</div>
                      {c.badge && (
                        <span className="stat-card-badge badge-up" style={{ cursor: "pointer" }}
                          onClick={() => setShowDeposit(true)}>
                          {c.badge}
                        </span>
                      )}
                    </div>
                    <div className="stat-card-label">{c.label}</div>
                    <div className="stat-card-value">{fmtK(c.value)}</div>
                    <div className="stat-card-sub">{c.sub}</div>
                  </div>
                ))}
              </div>

              <div className="quick-row">
                {[
                  { label: "Today",      value: stats.today,   icon: <MdTrendingUp />,  bg: "icon-bg-blue"   },
                  { label: "This Week",  value: stats.weekly,  icon: <MdBarChart />,     bg: "icon-bg-indigo" },
                  { label: "This Month", value: stats.monthly, icon: <TbReportMoney />,  bg: "icon-bg-green"  },
                ].map(s => (
                  <div key={s.label} className="quick-card">
                    <div className={`quick-card-icon ${s.bg}`}>{s.icon}</div>
                    <div>
                      <div className="quick-card-label">{s.label}</div>
                      <div className="quick-card-value">₹ {fmt(s.value)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 7-day chart */}
              <div className="chart-card" style={{ marginBottom: 16 }}>
                <div className="chart-card-header">
                  <div>
                    <div className="chart-card-title">7-Day Earnings Trend</div>
                    <div className="chart-card-sub">Daily order earnings</div>
                  </div>
                  <span className="chart-badge">₹ {fmt(stats.weekly)} this week</span>
                </div>
                {graph.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={graph} margin={{ top: 6, right: 6, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#3b82f6" stopOpacity={.14} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmtK(v)} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2}
                        fill="url(#g1)"
                        dot={{ fill: "#3b82f6", r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: "#fff", stroke: "#3b82f6", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state"><div className="empty-state-icon">📊</div><p>No data for last 7 days</p></div>
                )}
              </div>

              {/* Breakdown */}
              <div className="breakdown-card" style={{ marginBottom: 16 }}>
                <div className="breakdown-header"><TbReportMoney /> Full Earnings Breakdown</div>
                {[
                  { icon: <TbPackage />,          bg: "icon-bg-green",  name: "Total Orders Earned",     desc: "From delivered orders",    val: `+ ₹ ${fmt(wallet.totalEarned)}`,      cls: "val-credit"  },
                  { icon: <PiHandWithdrawLight />, bg: "icon-bg-blue",   name: "Total Withdrawn",         desc: "Paid to bank/UPI",         val: `− ₹ ${fmt(wallet.withdrawn)}`,        cls: "val-debit"   },
                  { icon: <TbTag />,              bg: "icon-bg-amber",  name: "COD Commission Deducted", desc: "Platform commission on COD",val: `− ₹ ${fmt(wallet.codCommission||0)}`, cls: "val-debit"   },
                  { icon: <RiTimeLine />,          bg: "icon-bg-indigo", name: "Processing",              desc: "Clearing in 1-2 days",     val: `₹ ${fmt(wallet.processingBalance)}`,  cls: "val-neutral" },
                  { icon: <MdLock />,             bg: "icon-bg-red",    name: "COD Cash Holding",        desc: "Awaiting your deposit",    val: `₹ ${fmt(wallet.codHolding)}`,         cls: "val-debit"   },
                ].map(r => (
                  <div key={r.name} className="breakdown-row">
                    <div className="breakdown-row-left">
                      <div className={`breakdown-row-icon ${r.bg}`}>{r.icon}</div>
                      <div>
                        <div className="breakdown-row-name">{r.name}</div>
                        <div className="breakdown-row-desc">{r.desc}</div>
                      </div>
                    </div>
                    <div className={`breakdown-row-value ${r.cls}`}>{r.val}</div>
                  </div>
                ))}
                <div className="breakdown-row breakdown-total">
                  <div className="breakdown-row-left">
                    <div className="breakdown-row-icon icon-bg-blue"><MdAccountBalanceWallet /></div>
                    <div>
                      <div className="breakdown-row-name" style={{ fontWeight: 700 }}>Available Balance</div>
                      <div className="breakdown-row-desc">Ready to withdraw</div>
                    </div>
                  </div>
                  <div className="breakdown-row-value val-primary">₹ {fmt(wallet.availableBalance)}</div>
                </div>
              </div>

              <div className="action-row">
                <button className="btn btn-primary btn-lg" onClick={() => setShowWithdraw(true)}>
                  <PiHandWithdrawLight size={17} /> Withdraw Funds
                </button>
                <button className="btn btn-success btn-lg" onClick={() => setShowDeposit(true)}>
                  <TbCashBanknote size={17} /> Deposit COD Cash
                </button>
                <button className="btn btn-outline btn-lg" onClick={() => fetchData(true)}>
                  <MdRefresh size={16} /> Refresh
                </button>
              </div>
            </>
          )}

          {/* ── ANALYTICS ── */}
          {tab === "analytics" && (
            <AnalyticsTab graph={graph} stats={stats} wallet={wallet} />
          )}

          {/* ── HISTORY ── */}
          {tab === "history" && (
            <div className="table-card">
              <div className="table-header">
                <div>
                  <div className="chart-card-title">All Transactions</div>
                  <div className="chart-card-sub" style={{ fontSize: 11, color: "var(--slate-400)", marginTop: 2 }}>
                    {txns.length} records
                  </div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => fetchData(true)}><MdRefresh /> Refresh</button>
              </div>
              {txns.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">📋</div><p>No transactions yet</p></div>
              ) : (
                <div className="table-scroll">
                  <table className="txn-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Reference</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date &amp; Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txns.map((t, i) => {
                        const meta = TYPE_MAP[t.type] || { icon: <TbArrowsExchange />, label: t.type, bgClass: "icon-bg-blue", accent: "#dbeafe" };
                        const dt   = new Date(t.created_at);
                        return (
                          <tr key={i}>
                            <td>
                              <div className="txn-type-cell">
                                <div className="txn-type-icon" style={{ background: meta.accent }}>{meta.icon}</div>
                                <div>
                                  <div className="txn-type-name">{meta.label}</div>
                                </div>
                              </div>
                            </td>
                            <td><span className="txn-ref-badge">{t.ref || `TXN-${i + 1}`}</span></td>
                            <td>
                              <span className={`txn-amount ${t.amount < 0 ? "txn-debit" : "txn-credit"}`}>
                                {t.amount < 0 ? "−" : "+"} ₹ {fmt(Math.abs(t.amount))}
                              </span>
                            </td>
                            <td><StatusBadge status={t.status} /></td>
                            <td>
                              <div className="txn-date-main">
                                {dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                              </div>
                              <div className="txn-date-sub">
                                {dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* ── Modals ── */}
      {showWithdraw && (
        <WithdrawModal wallet={wallet} methods={methods}
          onClose={() => setShowWithdraw(false)} onSuccess={handleWithdrawSuccess} />
      )}
      {showDeposit && (
        <DepositModal wallet={wallet}
          onClose={() => setShowDeposit(false)} onSuccess={handleDepositSuccess} />
      )}

    </div>
  );
};

export default VendorEarnings;