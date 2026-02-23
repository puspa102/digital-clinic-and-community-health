import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

/* ─── Design tokens matching the dark Critical Care Portal theme ──────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  .portal-root {
    --bg-primary:   #0d1117;
    --bg-card:      #161b22;
    --bg-card2:     #1c2230;
    --bg-input:     #1e2533;
    --border:       #2a3345;
    --border-light: #30394d;
    --text-primary: #e6edf3;
    --text-secondary:#8b949e;
    --text-muted:   #4a5568;
    --accent-red:   #e53e3e;
    --accent-red-soft:#fca5a5;
    --accent-blue:  #3b82f6;
    --accent-blue-soft:#93c5fd;
    --accent-green: #22c55e;
    --accent-green-soft:#86efac;
    --accent-amber: #f59e0b;
    --urgent-red:   #ef4444;
    --urgent-orange:#f97316;
    --live-dot:     #22c55e;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .portal-root * { box-sizing: border-box; }

  /* Live badge pulse */
  @keyframes pulse-live {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  .live-dot { animation: pulse-live 1.6s ease-in-out infinite; }

  /* Ticker scroll */
  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .ticker-track { animation: ticker 28s linear infinite; }

  /* Card hover lift */
  .care-card { transition: transform .18s ease, box-shadow .18s ease; }
  .care-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,.45);
  }

  /* Bloodtype button selected ring */
  .bt-btn.selected {
    background: var(--accent-red) !important;
    color: #fff !important;
    border-color: var(--accent-red) !important;
    box-shadow: 0 0 0 3px rgba(229,62,62,.25);
  }

  /* Scrollbar */
  .portal-root ::-webkit-scrollbar { width: 6px; }
  .portal-root ::-webkit-scrollbar-track { background: var(--bg-primary); }
  .portal-root ::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 3px; }

  /* Input focus */
  .dark-input:focus {
    outline: none;
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 3px rgba(59,130,246,.15);
  }

  /* Tab active underline */
  .main-tab.active {
    color: var(--text-primary) !important;
    border-bottom: 2px solid var(--accent-blue);
  }
`;

const Emergency = () => {
  useAuth();
  const [activeTab, setActiveTab] = useState("blood");
  const [requestType, setRequestType] = useState("receive");
  const [selectedBloodType, setSelectedBloodType] = useState("A+");

  /* ── Mock data ──────────────────────────────────────────────────────────── */
  const bloodRequests = [
    { id: 1, bloodType: "A+",  units: 2, hospital: "City General Hospital",    location: "Downtown, Block A",  urgency: "critical", postedBy: "Dr. Sarah Johnson", postedAt: "2 mins ago",  contact: "+1 234 567 890" },
    { id: 2, bloodType: "O-",  units: 3, hospital: "Metro Medical Center",     location: "Uptown, Street 5",   urgency: "urgent",   postedBy: "Emergency Dept",    postedAt: "25 mins ago", contact: "+1 234 567 891" },
    { id: 3, bloodType: "B+",  units: 1, hospital: "Community Health Clinic",  location: "Westside, Lane 12",  urgency: "normal",   postedBy: "Blood Bank",        postedAt: "1 hr ago",    contact: "+1 234 567 892" },
    { id: 4, bloodType: "AB+", units: 2, hospital: "Regional Hospital",        location: "Eastside, Main Road",urgency: "critical", postedBy: "ICU Department",    postedAt: "5 mins ago",  contact: "+1 234 567 893" },
  ];

  const medicineRequests = [
    { id: 1, medicineName: "Insulin (Lantus)",        quantity: "5 vials",   requiredFor: "Diabetic Patient",    location: "Central District",    urgency: "critical", postedBy: "Patient Family", postedAt: "15 mins ago", contact: "+1 234 567 894" },
    { id: 2, medicineName: "Chemotherapy Drugs",      quantity: "1 course",  requiredFor: "Cancer Patient",      location: "North Hospital Area",  urgency: "urgent",   postedBy: "Oncology Dept",  postedAt: "2 hrs ago",   contact: "+1 234 567 895" },
    { id: 3, medicineName: "Antibiotics (Amoxicillin)",quantity: "20 tablets",requiredFor: "Infection Treatment", location: "South Clinic",         urgency: "normal",   postedBy: "Local Clinic",   postedAt: "3 hrs ago",   contact: "+1 234 567 896" },
  ];

  const bloodDonors = [
    { id: 1, name: "John Smith",    bloodType: "O+", lastDonation: "3 months ago", location: "Downtown Area", available: true,  contact: "+1 234 567 897" },
    { id: 2, name: "Emily Davis",   bloodType: "A-", lastDonation: "6 months ago", location: "Westside",      available: true,  contact: "+1 234 567 898" },
    { id: 3, name: "Michael Brown", bloodType: "B+", lastDonation: "1 month ago",  location: "Uptown",        available: false, contact: "+1 234 567 899" },
  ];

  const medicineDonors = [
    { id: 1, name: "MedCare Pharmacy",     medicines: ["Insulin", "Antibiotics", "Pain Relief"], location: "Central Market", type: "Pharmacy", contact: "+1 234 567 900" },
    { id: 2, name: "Health Foundation NGO",medicines: ["Cancer Drugs", "HIV Medications"],       location: "City Center",    type: "NGO",      contact: "+1 234 567 901" },
  ];

  /* ── Helpers ────────────────────────────────────────────────────────────── */
  const urgencyConfig = {
    critical: { label: "CRITICAL", bg: "rgba(239,68,68,.15)", color: "#ef4444", border: "rgba(239,68,68,.3)" },
    urgent:   { label: "URGENT",   bg: "rgba(249,115,22,.15)",color: "#f97316", border: "rgba(249,115,22,.3)" },
    normal:   { label: "NORMAL",   bg: "rgba(34,197,94,.15)", color: "#22c55e", border: "rgba(34,197,94,.3)" },
  };

  const UrgencyBadge = ({ urgency }) => {
    const c = urgencyConfig[urgency] || urgencyConfig.normal;
    return (
      <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>
        {c.label}
      </span>
    );
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  /* ── Shared card container ─────────────────────────────────────────────── */
  const Card = ({ children, style = {} }) => (
    <div className="care-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, ...style }}>
      {children}
    </div>
  );

  const DarkInput = ({ placeholder, style = {} }) => (
    <input
      className="dark-input"
      placeholder={placeholder}
      style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "10px 14px", color: "var(--text-primary)", fontSize: 14, width: "100%", ...style }}
    />
  );

  const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );

  const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );

  const tickerItems = [
    "✓ A+ Blood matched in Chicago",
    "✓ Insulin Glargine found for request in Austin",
    "✓ 5 Units of O- Blood donated to NY General",
    "✓ Amoxicillin donated in Dallas",
    "✓ B+ Donor responded in Houston",
    "✓ Critical request fulfilled at Metro Medical",
  ];

  return (
    <Layout>
      <style>{styles}</style>
      <div className="portal-root" style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", padding: "24px", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.02em" }}>Critical Care Portal</h1>
              <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: 14 }}>Real-time emergency resource management and matching system.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.25)", borderRadius: 8, padding: "6px 14px" }}>
                <span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--live-dot)", display: "inline-block" }} />
                <span style={{ color: "var(--accent-green)", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em" }}>LIVE</span>
              </div>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>142</span> Active Requests
              </div>
            </div>
          </div>

          {/* ── Top 4 panels grid ───────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginBottom: 20 }}>

            {/* Request Medicine */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: "rgba(34,197,94,.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Request Medicine</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#f97316", background: "rgba(249,115,22,.1)", border: "1px solid rgba(249,115,22,.25)", borderRadius: 4, padding: "3px 8px" }}>URGENT</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, letterSpacing: "0.07em", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 6 }}>MEDICINE NAME</label>
                  <DarkInput placeholder="e.g. Remdesivir" />
                </div>
                <div>
                  <label style={{ fontSize: 11, letterSpacing: "0.07em", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 6 }}>DOSAGE/FORM</label>
                  <DarkInput placeholder="e.g. 100mg Vial" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 11, letterSpacing: "0.07em", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 6 }}>QUANTITY REQUIRED</label>
                  <DarkInput placeholder="0" />
                </div>
                <div>
                  <label style={{ fontSize: 11, letterSpacing: "0.07em", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 6 }}>URGENCY LEVEL</label>
                  <select className="dark-input" style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "10px 14px", color: "var(--text-primary)", fontSize: 14, width: "100%" }}>
                    <option>Immediate (Critical)</option>
                    <option>Urgent</option>
                    <option>Normal</option>
                  </select>
                </div>
              </div>
              <button style={{ width: "100%", background: "var(--accent-blue)", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                Submit Medical Request
              </button>
            </Card>

            {/* Request Blood */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: "rgba(239,68,68,.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Request Blood</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#ef4444", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 4, padding: "3px 8px" }}>LIFE-SAVING</span>
              </div>
              <label style={{ fontSize: 11, letterSpacing: "0.07em", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 10 }}>SELECT BLOOD GROUP</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
                {bloodTypes.map(bt => (
                  <button
                    key={bt}
                    className={`bt-btn${selectedBloodType === bt ? " selected" : ""}`}
                    onClick={() => setSelectedBloodType(bt)}
                    style={{ background: selectedBloodType === bt ? "var(--accent-red)" : "var(--bg-input)", border: `1px solid ${selectedBloodType === bt ? "var(--accent-red)" : "var(--border-light)"}`, borderRadius: 8, padding: "9px 0", color: selectedBloodType === bt ? "#fff" : "var(--text-primary)", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                  >
                    {bt}
                  </button>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 11, letterSpacing: "0.07em", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 6 }}>UNITS REQUIRED</label>
                  <DarkInput placeholder="Units" />
                </div>
                <div>
                  <label style={{ fontSize: 11, letterSpacing: "0.07em", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: 6 }}>LOCATION (CITY)</label>
                  <DarkInput placeholder="Enter City" />
                </div>
              </div>
              <button style={{ width: "100%", background: "var(--accent-blue)", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                Find Matching Donors
              </button>
            </Card>

            {/* Donate Medicine */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: "rgba(34,197,94,.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 8v8M8 12h8" />
                    </svg>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Donate Medicine</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#22c55e", background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.25)", borderRadius: 4, padding: "3px 8px" }}>CONTRIBUTE</span>
              </div>

              <div style={{ background: "var(--bg-card2)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 12, letterSpacing: "0.05em" }}>AVAILABLE SURPLUS MEDICINES</p>
                {[
                  { name: "Paracetamol 500mg", exp: "Exp: 12/2025 • 20 Units" },
                  { name: "Amoxicillin 250mg", exp: "Exp: 08/2024 • 5 Units" },
                ].map((med, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-input)", borderRadius: 8, padding: "10px 14px", marginBottom: i === 0 ? 8 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, background: "var(--accent-green)", borderRadius: "50%" }} />
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{med.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "var(--text-secondary)" }}>{med.exp}</p>
                      </div>
                    </div>
                    <button style={{ background: "transparent", border: "none", color: "var(--accent-blue)", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em" }}>EDIT</button>
                  </div>
                ))}
              </div>

              <button style={{ width: "100%", background: "transparent", border: "2px dashed var(--border-light)", borderRadius: 8, padding: "12px", color: "var(--text-secondary)", fontWeight: 600, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" />
                </svg>
                LIST NEW SURPLUS MEDICINE
              </button>
            </Card>

            {/* Donate Blood */}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, background: "rgba(239,68,68,.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Donate Blood</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color: "#ef4444", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 4, padding: "3px 8px" }}>BE A HERO</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {/* Map placeholder */}
                <div style={{ background: "var(--bg-card2)", borderRadius: 10, overflow: "hidden", position: "relative", minHeight: 130, display: "flex", alignItems: "flex-end", border: "1px solid var(--border)" }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1a2744 0%, #0d1b2a 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ width: 36, height: 36, background: "rgba(239,68,68,.2)", border: "2px solid rgba(239,68,68,.4)", borderRadius: "50%", margin: "0 auto 4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 10, height: 10, background: "#ef4444", borderRadius: "50%" }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ position: "relative", zIndex: 1, background: "rgba(22,27,34,.85)", width: "100%", padding: "8px 12px", backdropFilter: "blur(4px)" }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>Central Hospital Camp</p>
                    <p style={{ margin: 0, fontSize: 11, color: "var(--text-secondary)" }}>0.8 miles away • Open until 8 PM</p>
                  </div>
                </div>

                {/* Urgent matches */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 11, letterSpacing: "0.07em", color: "var(--text-secondary)", fontWeight: 600, margin: 0 }}>URGENT MATCHES FOR YOU</p>
                  <div style={{ background: "var(--bg-card2)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", background: "rgba(239,68,68,.1)", borderRadius: 4, padding: "2px 6px" }}>URGENT (O+)</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>2 mins ago</span>
                    </div>
                    <p style={{ margin: "4px 0 8px", fontSize: 12, color: "var(--text-secondary)" }}>St. Jude's Pediatric Unit requires 2 units.</p>
                    <button style={{ width: "100%", background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "7px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Respond</button>
                  </div>
                  <div style={{ background: "var(--bg-input)", borderRadius: 8, padding: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>General (O+)</span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>1 hr ago</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>City Blood Bank replenishment.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* ── Stats bar ────────────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
            {[
              { label: "Active Blood Requests", value: "24", color: "#ef4444", bg: "rgba(239,68,68,.1)", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg> },
              { label: "Registered Donors",    value: "156", color: "#22c55e", bg: "rgba(34,197,94,.1)", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg> },
              { label: "Medicine Requests",    value: "18",  color: "#3b82f6", bg: "rgba(59,130,246,.1)", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg> },
              { label: "Lives Saved",          value: "89",  color: "#a78bfa", bg: "rgba(167,139,250,.1)", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg> },
            ].map((s, i) => (
              <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 38, height: 38, background: s.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.3 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main tabs content ────────────────────────────────────────── */}
          <Card style={{ marginBottom: 20 }}>
            {/* Tab bar */}
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: 24, gap: 0 }}>
              {[
                { key: "blood",    label: "Blood Requests" },
                { key: "medicine", label: "Medicine Requests" },
                { key: "donors",   label: "Donors" },
              ].map(t => (
                <button
                  key={t.key}
                  className={`main-tab${activeTab === t.key ? " active" : ""}`}
                  onClick={() => setActiveTab(t.key)}
                  style={{ background: "transparent", border: "none", borderBottom: activeTab === t.key ? "2px solid var(--accent-blue)" : "2px solid transparent", padding: "10px 20px", color: activeTab === t.key ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: -1 }}
                >
                  {t.label}
                </button>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, paddingBottom: 8 }}>
                <button
                  onClick={() => setRequestType("receive")}
                  style={{ background: requestType === "receive" ? "rgba(59,130,246,.15)" : "transparent", border: `1px solid ${requestType === "receive" ? "var(--accent-blue)" : "var(--border)"}`, borderRadius: 8, padding: "6px 14px", color: requestType === "receive" ? "var(--accent-blue)" : "var(--text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  I Need Help
                </button>
                <button
                  onClick={() => setRequestType("donate")}
                  style={{ background: requestType === "donate" ? "rgba(34,197,94,.15)" : "transparent", border: `1px solid ${requestType === "donate" ? "var(--accent-green)" : "var(--border)"}`, borderRadius: 8, padding: "6px 14px", color: requestType === "donate" ? "var(--accent-green)" : "var(--text-secondary)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  I Want to Donate
                </button>
              </div>
            </div>

            {/* ── Blood requests list ─────────────────────────────────── */}
            {activeTab === "blood" && requestType === "receive" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Urgent Blood Requests</h2>
                  <button style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <PlusIcon /> Post Blood Request
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {bloodRequests.map(r => (
                    <div key={r.id} style={{ background: "var(--bg-card2)", border: "1px solid var(--border)", borderLeft: `3px solid ${r.urgency === "critical" ? "#ef4444" : r.urgency === "urgent" ? "#f97316" : "#22c55e"}`, borderRadius: 10, padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 52, height: 52, background: "#ef4444", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                          {r.bloodType}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{r.units} Units Required</span>
                            <UrgencyBadge urgency={r.urgency} />
                          </div>
                          <p style={{ margin: 0, fontSize: 13, color: "var(--text-primary)" }}>{r.hospital}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>{r.location}</p>
                          <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-muted)" }}>Posted by {r.postedBy} • {r.postedAt}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <a href={`tel:${r.contact}`} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                          <PhoneIcon /> Contact
                        </a>
                        <button style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                          I Can Donate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Blood donors list ───────────────────────────────────── */}
            {(activeTab === "blood" && requestType === "donate") || activeTab === "donors" ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Available Blood Donors</h2>
                  <button style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <PlusIcon /> Register as Donor
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                  {bloodDonors.map(d => (
                    <div key={d.id} style={{ background: "var(--bg-card2)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 44, height: 44, background: "#ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff" }}>{d.bloodType}</div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: 14 }}>{d.name}</span>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.available ? "#22c55e" : "#4a5568", display: "inline-block" }} />
                          </div>
                          <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>{d.location}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--text-muted)" }}>Last donation: {d.lastDonation}</p>
                        </div>
                      </div>
                      <a href={`tel:${d.contact}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", background: d.available ? "#22c55e" : "var(--bg-input)", color: d.available ? "#fff" : "var(--text-muted)", border: "none", borderRadius: 8, padding: "8px", fontWeight: 700, fontSize: 13, cursor: d.available ? "pointer" : "not-allowed", textDecoration: "none" }}>
                        <PhoneIcon />{d.available ? "Contact" : "Unavailable"}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* ── Medicine requests ───────────────────────────────────── */}
            {activeTab === "medicine" && requestType === "receive" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Medicine Requests</h2>
                  <button style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <PlusIcon /> Post Medicine Request
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {medicineRequests.map(r => (
                    <div key={r.id} style={{ background: "var(--bg-card2)", border: "1px solid var(--border)", borderLeft: `3px solid ${r.urgency === "critical" ? "#ef4444" : r.urgency === "urgent" ? "#f97316" : "#22c55e"}`, borderRadius: 10, padding: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 52, height: 52, background: "rgba(59,130,246,.15)", border: "1px solid rgba(59,130,246,.3)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{r.medicineName}</span>
                            <UrgencyBadge urgency={r.urgency} />
                          </div>
                          <p style={{ margin: 0, fontSize: 13, color: "var(--text-primary)" }}>Qty: {r.quantity} • {r.requiredFor}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>{r.location}</p>
                          <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--text-muted)" }}>Posted by {r.postedBy} • {r.postedAt}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <a href={`tel:${r.contact}`} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                          <PhoneIcon /> Contact
                        </a>
                        <button style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-light)", borderRadius: 8, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                          I Can Help
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Medicine donors ─────────────────────────────────────── */}
            {activeTab === "medicine" && requestType === "donate" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Medicine Donors & Pharmacies</h2>
                  <button style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <PlusIcon /> Register as Medicine Donor
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                  {medicineDonors.map(d => (
                    <div key={d.id} style={{ background: "var(--bg-card2)", border: "1px solid var(--border)", borderRadius: 10, padding: 18 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                        <div style={{ width: 44, height: 44, background: "rgba(59,130,246,.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{d.name}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", background: "rgba(167,139,250,.1)", borderRadius: 4, padding: "2px 7px" }}>{d.type}</span>
                          </div>
                          <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--text-secondary)" }}>{d.location}</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {d.medicines.map((m, i) => (
                              <span key={i} style={{ fontSize: 11, background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 8px", color: "var(--text-secondary)" }}>{m}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <a href={`tel:${d.contact}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "9px", fontWeight: 700, fontSize: 13, cursor: "pointer", textDecoration: "none" }}>
                        <PhoneIcon /> Contact
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* ── Emergency tips ───────────────────────────────────────────── */}
          <Card style={{ marginBottom: 20 }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700 }}>Emergency Tips</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>, bg: "rgba(239,68,68,.1)", title: "Blood Donation Eligibility", text: "You can donate blood if you're 18–65 years old, weigh at least 50kg, and are in good health." },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>, bg: "rgba(59,130,246,.1)", title: "Response Time",               text: "In critical emergencies, every minute counts. Contact multiple donors simultaneously." },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>, bg: "rgba(34,197,94,.1)", title: "Verify Before Use",           text: "Always verify medicine expiry dates and proper storage conditions before accepting donations." },
              ].map((tip, i) => (
                <div key={i} style={{ background: "var(--bg-card2)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
                  <div style={{ width: 36, height: 36, background: tip.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>{tip.icon}</div>
                  <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{tip.title}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{tip.text}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Emergency hotline bar ────────────────────────────────────── */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderLeft: "3px solid #ef4444", borderRadius: 12, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 38, height: 38, background: "rgba(239,68,68,.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PhoneIcon />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "var(--text-secondary)", letterSpacing: "0.05em" }}>24/7 EMERGENCY HOTLINE</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>1-800-EMERGENCY</p>
              </div>
            </div>
            <button style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <PhoneIcon /> Call Now
            </button>
          </div>

          {/* ── Live ticker ──────────────────────────────────────────────── */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 0", overflow: "hidden" }}>
            <div className="ticker-track" style={{ display: "flex", width: "200%", whiteSpace: "nowrap" }}>
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span key={i} style={{ fontSize: 13, color: "var(--text-secondary)", padding: "0 32px", flexShrink: 0 }}>
                  <span style={{ color: "#22c55e", marginRight: 6 }}>●</span>
                  <span style={{ fontWeight: 600, color: "var(--accent-green-soft)" }}>LIVE SUCCESS</span>
                  {" "}{item.replace("✓ ", "")}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Emergency;