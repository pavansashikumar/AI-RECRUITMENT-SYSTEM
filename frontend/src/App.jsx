import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard, BriefcaseBusiness, Users, FileText,
  CalendarDays, Handshake, Bell, Settings, Search,
  ChevronDown, Plus, ArrowUpRight, CheckCircle2,
  TrendingUp, MoreHorizontal, Filter, Menu, X,
  RefreshCw, Wifi, WifiOff, Download, History,
  BarChart3, FileSpreadsheet, ShieldCheck, Award, Sparkles, Clock
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const navigation = [
  {
    section: "WORKSPACE",
    items: [
      { label: "Dashboard", icon: LayoutDashboard },
      { label: "Jobs", icon: BriefcaseBusiness },
      { label: "Candidates", icon: Users },
      { label: "Applications", icon: FileText },
    ],
  },
  {
    section: "RECRUITMENT",
    items: [
      { label: "Interviews", icon: CalendarDays },
      { label: "Offers & Hiring", icon: Handshake },
      { label: "Reports", icon: BarChart3 },
      { label: "Activity Log", icon: History },
      { label: "Notifications", icon: Bell },
    ],
  },
  {
    section: "PREFERENCES",
    items: [{ label: "Settings", icon: Settings }],
  },
];

const statusOptions = [
  "Applied", "Screening", "Shortlisted",
  "Interview", "Hired", "Rejected",
];

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? `${value}T12:00:00Z`
      : value
  );
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      });
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function exportToCSV(data, filename = "export.csv") {
  if (!data || !data.length) {
    alert("No records available to export.");
    return;
  }
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(","),
    ...data.map(row =>
      headers
        .map(field => {
          const val = row[field] ?? "";
          const stringified = typeof val === "object" ? JSON.stringify(val) : String(val);
          return `"${stringified.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ];
  const blob = new Blob(["\uFEFF" + csvRows.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json();
}

function Sidebar({ active, setActive, open, close }) {
  return (
    <>
      {open && (
        <div className="mobile-overlay" onClick={close} />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Users size={22} /></div>
          <div>
            <strong>TalentFlow</strong>
            <span>RECRUITMENT OS</span>
          </div>
          <button
            className="icon-button mobile-close"
            onClick={close}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="workspace-switch">
          <div className="workspace-avatar">N</div>
          <div className="workspace-copy">
            <strong>Nova Technologies</strong>
            <span>Enterprise workspace</span>
          </div>
          <ChevronDown size={16} />
        </div>

        {navigation.map(group => (
          <div className="nav-group" key={group.section}>
            <p className="nav-heading">{group.section}</p>
            {group.items.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className={`nav-item ${active === label ? "nav-active" : ""}`}
                onClick={() => {
                  setActive(label);
                  close();
                }}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
                {label === "Notifications" && (
                  <span className="nav-count">3</span>
                )}
              </button>
            ))}
          </div>
        ))}

        <div className="sidebar-bottom">
          <div className="plan-card">
            <div className="plan-icon"><TrendingUp size={17} /></div>
            <strong>Recruit smarter</strong>
            <p>Build a stronger team with data-driven hiring.</p>
            <button onClick={() => setActive("Reports")}>
              View insights <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="profile-row">
            <div className="profile-avatar">PS</div>
            <div className="profile-copy">
              <strong>Pavan S.</strong>
              <span>Recruitment Admin</span>
            </div>
            <MoreHorizontal size={18} />
          </div>
        </div>
      </aside>
    </>
  );
}

function Header({ active, query, setQuery, setActive, onMenu }) {
  return (
    <header className="topbar">
      <button
        className="icon-button menu-button"
        onClick={onMenu}
        aria-label="Open menu"
      >
        <Menu size={21} />
      </button>

      <div className="breadcrumbs">
        <span>Workspace</span>
        <span>/</span>
        <strong>{active}</strong>
      </div>

      <div className="topbar-actions">
        <label className="search-box">
          <Search size={17} />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search candidates, jobs..."
          />
          <kbd>⌘ K</kbd>
        </label>

        <button
          className="icon-button notification-button"
          aria-label="Notifications"
          onClick={() => setActive("Notifications")}
        >
          <Bell size={19} />
          <i />
        </button>

        <button className="user-button">
          <div className="profile-avatar">PS</div>
          <ChevronDown size={15} />
        </button>
      </div>
    </header>
  );
}

function StatCard({ title, value, change, icon: Icon, tone, detail }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-footer">
        <span className="stat-change">
          <TrendingUp size={13} /> {change}
        </span>
        <span>{detail}</span>
      </div>
    </article>
  );
}

function CandidateTable({ candidates, onStatus, busyId }) {
  if (candidates.length === 0) {
    return (
      <div className="empty-state">
        No candidates found. Try another search or add candidates to the database.
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>CANDIDATE</th>
            <th>POSITION</th>
            <th>AI MATCH</th>
            <th>STATUS</th>
            <th>APPLIED ON</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {candidates.map(candidate => (
            <tr key={candidate.id}>
              <td>
                <div className="candidate-cell">
                  <div className={`candidate-avatar ${candidate.color || "violet"}`}>
                    {initials(candidate.name)}
                  </div>
                  <div>
                    <strong>{candidate.name}</strong>
                    <span>{candidate.experience} experience</span>
                  </div>
                </div>
              </td>
              <td><span className="position-text">{candidate.role}</span></td>
              <td>
                <div className="score-cell">
                  <div className="score-track">
                    <div style={{ width: `${candidate.score}%` }} />
                  </div>
                  <strong>{candidate.score}%</strong>
                </div>
              </td>
              <td>
                <select
                  className={`status-select status-${candidate.status.toLowerCase()}`}
                  value={candidate.status}
                  disabled={busyId === candidate.id}
                  onChange={event => onStatus(candidate.id, event.target.value)}
                  aria-label={`Status for ${candidate.name}`}
                >
                  {statusOptions.map(status => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </td>
              <td className="date-cell">{formatDate(candidate.applied_on ?? candidate.date)}</td>
              <td>
                <button className="icon-button row-action" aria-label={`Actions for ${candidate.name}`}>
                  <MoreHorizontal size={19} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JobList({ jobs }) {
  if (!jobs.length) {
    return <div className="empty-state">No jobs found. Create your first job posting.</div>;
  }

  return (
    <div className="job-list">
      {jobs.map(job => (
        <div className="job-row" key={job.id}>
          <div className="job-icon"><BriefcaseBusiness size={19} /></div>
          <div className="job-copy">
            <strong>{job.title}</strong>
            <span>{job.department} · {job.job_type ?? job.type ?? "Full-time"}</span>
          </div>
          <div className="job-applicants">
            <strong>{job.applicants ?? 0}</strong>
            <span>Applicants</span>
          </div>
          <span className="active-pill">
            <i /> {job.status}
          </span>
          <button className="icon-button" aria-label={`More about ${job.title}`}>
            <MoreHorizontal size={19} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("Dashboard");
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    active_jobs: 0,
    total_candidates: 0,
    interviews_scheduled: 0,
    offers_accepted: 0,
  });

  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDepartment, setJobDepartment] = useState("Engineering");
  const [jobType, setJobType] = useState("Full-time");
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState("All");
  const [auditSearch, setAuditSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [jobsData, candidatesData, statsData, logsData] = await Promise.all([
        apiRequest("/jobs"),
        apiRequest("/candidates"),
        apiRequest("/dashboard/stats"),
        apiRequest("/audit-logs").catch(err => {
          console.warn("Could not load audit logs:", err);
          return [];
        }),
      ]);

      setJobs(jobsData);
      setCandidates(candidatesData);
      setStats(statsData);
      setAuditLogs(Array.isArray(logsData) ? logsData : []);
      setApiConnected(true);
    } catch (err) {
      console.error("Could not load recruitment data:", err);
      setApiConnected(false);
      setError(
        "Cannot load data from FastAPI. Check that the backend and PostgreSQL are running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExportCandidates = () => {
    const dataToExport = filteredCandidates.map(c => ({
      ID: c.id,
      Name: c.name,
      Role: c.role,
      Email: c.email || "N/A",
      Experience: c.experience,
      "AI Match Score (%)": `${c.score}%`,
      Status: c.status,
      "Applied On": c.applied_on || c.date || "N/A",
    }));
    exportToCSV(dataToExport, `talentflow_candidates_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportJobs = () => {
    const dataToExport = filteredJobs.map(j => ({
      ID: j.id,
      "Job Title": j.title,
      Department: j.department,
      "Employment Type": j.job_type || j.type || "Full-time",
      "Applicants Count": j.applicants ?? 0,
      Status: j.status,
      "Created At": j.created_at || "N/A",
    }));
    exportToCSV(dataToExport, `talentflow_jobs_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportAuditLogs = () => {
    const dataToExport = auditLogs.map(l => ({
      ID: l.id,
      Action: l.action,
      "Entity Type": l.entity_type,
      "Entity ID": l.entity_id ?? "—",
      Details: l.details,
      "Timestamp": l.created_at,
    }));
    exportToCSV(dataToExport, `talentflow_audit_trail_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportAnalytics = () => {
    const stageSummary = statusOptions.map(st => ({
      Metric: `Candidates in ${st}`,
      Value: candidates.filter(c => c.status === st).length,
    }));
    const avgScore = candidates.length
      ? Math.round(candidates.reduce((a, b) => a + (b.score || 0), 0) / candidates.length)
      : 0;
    const dataToExport = [
      { Metric: "Total Candidates", Value: candidates.length },
      { Metric: "Active Jobs", Value: stats.active_jobs },
      { Metric: "Interviews Scheduled", Value: stats.interviews_scheduled },
      { Metric: "Offers Accepted (Hired)", Value: stats.offers_accepted },
      { Metric: "Average AI Match Score", Value: `${avgScore}%` },
      ...stageSummary,
    ];
    exportToCSV(dataToExport, `talentflow_recruitment_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateStatus = async (id, status) => {
    const previous = candidates.find(candidate => candidate.id === id);
    if (!previous || previous.status === status) return;

    setBusyId(id);
    setError("");

    try {
      await apiRequest(`/candidates/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      await loadData();
    } catch (err) {
      console.error("Could not update candidate:", err);
      setError("The candidate status could not be saved. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const addJob = async event => {
    event.preventDefault();
    if (!jobTitle.trim()) return;

    try {
      await apiRequest("/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: jobTitle.trim(),
          department: jobDepartment,
          job_type: jobType,
        }),
      });

      setJobTitle("");
      setJobDepartment("Engineering");
      setJobType("Full-time");
      setShowJobForm(false);
      setActive("Jobs");
      await loadData();
    } catch (err) {
      console.error("Could not create job:", err);
      setError("The job could not be saved. Check the backend connection.");
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    `${candidate.name} ${candidate.role} ${candidate.status}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const filteredJobs = jobs.filter(job =>
    `${job.title} ${job.department} ${job.status}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const interviewCandidates = candidates.filter(
    candidate => candidate.status === "Interview"
  );

  const hiringCandidates = candidates.filter(
    candidate => ["Shortlisted", "Interview", "Hired"].includes(candidate.status)
  );

  const stageAnalytics = [
    { stage: "Applied", count: candidates.filter(c => c.status === "Applied").length, fill: "#8b83f6" },
    { stage: "Screening", count: candidates.filter(c => c.status === "Screening").length, fill: "#5b9cf5" },
    { stage: "Shortlisted", count: candidates.filter(c => c.status === "Shortlisted").length, fill: "#43b99a" },
    { stage: "Interview", count: candidates.filter(c => c.status === "Interview").length, fill: "#eeaa55" },
    { stage: "Hired", count: candidates.filter(c => c.status === "Hired").length, fill: "#46b77d" },
    { stage: "Rejected", count: candidates.filter(c => c.status === "Rejected").length, fill: "#ef4444" },
  ];

  const departmentCounts = jobs.reduce((acc, job) => {
    const dept = job.department || "Other";
    acc[dept] = (acc[dept] || 0) + (job.applicants || 0);
    return acc;
  }, {});
  const departmentData = Object.keys(departmentCounts).length
    ? Object.entries(departmentCounts).map(([name, value]) => ({ name, value }))
    : [
        { name: "Engineering", value: 48 },
        { name: "AI & Data", value: 36 },
        { name: "Design", value: 24 },
      ];
  const pieColors = ["#6258e8", "#5b9cf5", "#43b99a", "#eeaa55", "#ec4899", "#8b5cf6"];

  const scoreTiersData = [
    { tier: "90-100% (Top)", candidates: candidates.filter(c => c.score >= 90).length },
    { tier: "80-89% (High)", candidates: candidates.filter(c => c.score >= 80 && c.score < 90).length },
    { tier: "70-79% (Moderate)", candidates: candidates.filter(c => c.score >= 70 && c.score < 80).length },
    { tier: "< 70% (Review)", candidates: candidates.filter(c => c.score < 70).length },
  ];

  const avgScore = candidates.length
    ? Math.round(candidates.reduce((sum, c) => sum + (c.score || 0), 0) / candidates.length)
    : 0;

  const hireRate = candidates.length
    ? Math.round((candidates.filter(c => c.status === "Hired").length / candidates.length) * 100)
    : 0;

  const filteredAuditLogs = auditLogs
    .filter(log => auditFilter === "All" || log.action === auditFilter)
    .filter(log =>
      `${log.action} ${log.entity_type} ${log.details}`
        .toLowerCase()
        .includes(auditSearch.toLowerCase())
    );

  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        setActive={setActive}
        open={mobileOpen}
        close={() => setMobileOpen(false)}
      />

      <main className="main-area">
        <Header
          active={active}
          query={query}
          setQuery={setQuery}
          setActive={setActive}
          onMenu={() => setMobileOpen(true)}
        />

        <div className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">
                <span /> RECRUITMENT OVERVIEW
              </div>
              <h1>{active === "Dashboard" ? "Good morning, Pavan" : active}</h1>
              <p>Here's what's happening with your recruitment pipeline today.</p>
            </div>

            <button
              className="primary-button"
              onClick={() => setShowJobForm(true)}
            >
              <Plus size={17} /> Create new job
            </button>
          </div>

          <div className="connection-banner">
            {apiConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>
              Backend: <strong>{apiConnected ? "Connected to PostgreSQL" : "Disconnected"}</strong>
            </span>
            <button
              className="icon-button"
              onClick={loadData}
              disabled={loading}
              aria-label="Refresh data"
              title="Refresh data"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {error && (
            <div className="error-banner" role="alert">
              {error}
              <button onClick={loadData} className="subtle-button">Retry</button>
            </div>
          )}

          {loading && (
            <div className="loading-banner">Loading recruitment data…</div>
          )}

          {active === "Dashboard" && (
            <>
              <div className="stat-grid">
                <StatCard
                  title="Active job postings"
                  value={stats.active_jobs}
                  change="Database"
                  detail="active jobs"
                  icon={BriefcaseBusiness}
                  tone="purple"
                />
                <StatCard
                  title="Total candidates"
                  value={stats.total_candidates}
                  change="Database"
                  detail="registered candidates"
                  icon={Users}
                  tone="blue"
                />
                <StatCard
                  title="Interviews scheduled"
                  value={stats.interviews_scheduled}
                  change="Database"
                  detail="in interview stage"
                  icon={CalendarDays}
                  tone="orange"
                />
                <StatCard
                  title="Offers accepted"
                  value={stats.offers_accepted}
                  change="Database"
                  detail="marked as hired"
                  icon={CheckCircle2}
                  tone="green"
                />
              </div>

              <div className="dashboard-grid">
                <section className="panel candidate-panel">
                  <div className="panel-header">
                    <div>
                      <h2>Recent candidates</h2>
                      <p>Review applicants and their current screening scores.</p>
                    </div>
                    <div className="panel-actions">
                      <button className="subtle-button" onClick={handleExportCandidates} title="Export candidates to CSV">
                        <Download size={14} /> Export CSV
                      </button>
                      <button
                        className="subtle-button"
                        onClick={() => setActive("Candidates")}
                      >
                        View all <ArrowUpRight size={15} />
                      </button>
                    </div>
                  </div>
                  <CandidateTable
                    candidates={filteredCandidates.slice(0, 5)}
                    onStatus={updateStatus}
                    busyId={busyId}
                  />
                </section>

                <section className="panel pipeline-panel">
                  <div className="panel-header">
                    <div>
                      <h2>Hiring pipeline</h2>
                      <p>Candidate distribution by stage</p>
                    </div>
                    <MoreHorizontal size={19} />
                  </div>

                  <div className="pipeline-total">
                    <strong>{candidates.length}</strong>
                    <span>Total candidates</span>
                  </div>

                  <div className="pipeline-bars">
                    {[
                      { name: "Applied", color: "#8b83f6" },
                      { name: "Screening", color: "#5b9cf5" },
                      { name: "Shortlisted", color: "#43b99a" },
                      { name: "Interview", color: "#eeaa55" },
                      { name: "Hired", color: "#46b77d" },
                    ].map(stage => {
                      const count = candidates.filter(
                        candidate => candidate.status === stage.name
                      ).length;
                      const percent = candidates.length
                        ? (count / candidates.length) * 100
                        : 0;

                      return (
                        <div className="pipeline-row" key={stage.name}>
                          <div className="pipeline-label">
                            <span>
                              <i style={{ background: stage.color }} />
                              {stage.name}
                            </span>
                            <strong>{count}</strong>
                          </div>
                          <div className="pipeline-track">
                            <div
                              style={{
                                width: `${percent}%`,
                                background: stage.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    className="pipeline-link"
                    onClick={() => setActive("Applications")}
                  >
                    View application pipeline <ArrowUpRight size={15} />
                  </button>
                </section>
              </div>

              <section className="panel jobs-panel">
                <div className="panel-header">
                  <div>
                    <h2>Open positions</h2>
                    <p>Monitor job postings and incoming applications.</p>
                  </div>
                  <button
                    className="subtle-button"
                    onClick={() => setActive("Jobs")}
                  >
                    View all positions <ArrowUpRight size={15} />
                  </button>
                </div>
                <JobList jobs={filteredJobs.slice(0, 4)} />
              </section>
            </>
          )}

          {active === "Jobs" && (
            <section className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h2>Job postings</h2>
                  <p>Manage open roles and recruitment requirements.</p>
                </div>
                <div className="panel-actions">
                  <button className="subtle-button" onClick={handleExportJobs} title="Export jobs to CSV">
                    <Download size={14} /> Export CSV
                  </button>
                  <button className="subtle-button" onClick={loadData}>
                    <RefreshCw size={15} /> Refresh
                  </button>
                </div>
              </div>
              <JobList jobs={filteredJobs} />
            </section>
          )}

          {["Candidates", "Applications"].includes(active) && (
            <section className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h2>{active === "Candidates" ? "Candidate directory" : "Application pipeline"}</h2>
                  <p>Search candidates and save recruitment-stage updates.</p>
                </div>
                <div className="panel-actions">
                  <button className="subtle-button" onClick={handleExportCandidates} title="Export candidates to CSV">
                    <Download size={14} /> Export CSV
                  </button>
                  <button className="subtle-button" onClick={loadData}>
                    <RefreshCw size={15} /> Refresh
                  </button>
                </div>
              </div>
              <CandidateTable
                candidates={filteredCandidates}
                onStatus={updateStatus}
                busyId={busyId}
              />
            </section>
          )}

          {active === "Interviews" && (
            <section className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h2>Interview schedule</h2>
                  <p>Candidates currently in the interview stage.</p>
                </div>
                <div className="panel-actions">
                  <button className="subtle-button" onClick={handleExportCandidates} title="Export interview candidates">
                    <Download size={14} /> Export CSV
                  </button>
                  <CalendarDays size={22} />
                </div>
              </div>
              {interviewCandidates.length ? (
                <CandidateTable
                  candidates={interviewCandidates}
                  onStatus={updateStatus}
                  busyId={busyId}
                />
              ) : (
                <div className="empty-state">No candidates are currently in the interview stage.</div>
              )}
            </section>
          )}

          {active === "Offers & Hiring" && (
            <section className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h2>Offers & hiring</h2>
                  <p>Track shortlisted candidates and hiring outcomes.</p>
                </div>
                <button className="subtle-button" onClick={handleExportCandidates} title="Export hiring pipeline">
                  <Download size={14} /> Export CSV
                </button>
              </div>
              <CandidateTable
                candidates={hiringCandidates}
                onStatus={updateStatus}
                busyId={busyId}
              />
            </section>
          )}

          {active === "Activity Log" && (
            <section className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h2>Recruitment Audit Trail</h2>
                  <p>Chronological activity log of recruitment actions and pipeline changes.</p>
                </div>
                <div className="panel-actions">
                  <button className="subtle-button" onClick={handleExportAuditLogs} title="Export audit trail to CSV">
                    <Download size={14} /> Export CSV
                  </button>
                  <button className="subtle-button" onClick={loadData}>
                    <RefreshCw size={15} /> Refresh
                  </button>
                </div>
              </div>

              <div className="audit-controls">
                <div className="filter-chips">
                  {[
                    { key: "All", label: "All Events" },
                    { key: "candidate_status_updated", label: "Candidate Updates" },
                    { key: "job_created", label: "Job Postings" },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      className={`filter-chip ${auditFilter === key ? "active" : ""}`}
                      onClick={() => setAuditFilter(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <label className="audit-search-box">
                  <Search size={15} />
                  <input
                    value={auditSearch}
                    onChange={e => setAuditSearch(e.target.value)}
                    placeholder="Search audit trail..."
                  />
                </label>
              </div>

              {filteredAuditLogs.length === 0 ? (
                <div className="empty-state">No activity log entries found matching your filter.</div>
              ) : (
                <div className="audit-timeline">
                  {filteredAuditLogs.map(log => {
                    const isCandidate = log.entity_type === "candidate";
                    const isJob = log.entity_type === "job";
                    return (
                      <div className="audit-card" key={log.id}>
                        <div className={`audit-icon ${isCandidate ? "purple" : isJob ? "blue" : "green"}`}>
                          {isCandidate ? <Users size={17} /> : isJob ? <BriefcaseBusiness size={17} /> : <ShieldCheck size={17} />}
                        </div>
                        <div className="audit-content">
                          <div className="audit-title-row">
                            <strong>
                              {log.action === "candidate_status_updated"
                                ? "Candidate Status Updated"
                                : log.action === "job_created"
                                ? "Job Opening Created"
                                : log.action.replace(/_/g, " ").toUpperCase()}
                            </strong>
                            <span className="audit-badge">
                              {log.entity_type.toUpperCase()} #{log.entity_id ?? log.id}
                            </span>
                          </div>
                          <p className="audit-details">{log.details}</p>
                          <div className="audit-meta">
                            <Clock size={12} />
                            <span>{formatDateTime(log.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {active === "Notifications" && (
            <section className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h2>Notifications</h2>
                  <p>Recruitment workspace status.</p>
                </div>
                <Bell size={22} />
              </div>
              <div className="notification-row">
                <div className="notification-dot" />
                <div>
                  <strong>Backend connection</strong>
                  <p>{apiConnected ? "FastAPI is returning data from PostgreSQL." : "The backend connection needs attention."}</p>
                </div>
                <span>{apiConnected ? "Connected" : "Offline"}</span>
              </div>
              <div className="notification-row">
                <div className="notification-dot" />
                <div>
                  <strong>Candidate records</strong>
                  <p>{candidates.length} candidate records loaded.</p>
                </div>
              </div>
            </section>
          )}

          {active === "Settings" && (
            <section className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h2>Workspace settings</h2>
                  <p>Recruitment workspace information.</p>
                </div>
                <Settings size={22} />
              </div>
              <div className="settings-content">
                <label>Workspace name<input defaultValue="Nova Technologies" /></label>
                <label>Administrator name<input defaultValue="Pavan S." /></label>
                <label>Contact email<input defaultValue="admin@example.com" /></label>
              </div>
            </section>
          )}

          {active === "Reports" && (
            <div className="reports-container">
              <div className="reports-header-panel panel">
                <div className="panel-header">
                  <div>
                    <h2>Recruitment Analytics & Insights</h2>
                    <p>Live metrics and visual analytics generated from candidates and job openings.</p>
                  </div>
                  <div className="panel-actions">
                    <button className="subtle-button" onClick={handleExportAnalytics} title="Export analytics data as CSV">
                      <Download size={14} /> Export Summary CSV
                    </button>
                    <button className="subtle-button" onClick={loadData}>
                      <RefreshCw size={15} /> Refresh
                    </button>
                  </div>
                </div>
              </div>

              <div className="stat-grid">
                <StatCard title="Total Candidates" value={candidates.length} change="Live database" detail="registered applicants" icon={Users} tone="blue" />
                <StatCard title="Average AI Score" value={`${avgScore}%`} change="AI matching" detail="across all resumes" icon={Sparkles} tone="purple" />
                <StatCard title="Active Job Openings" value={stats.active_jobs} change="Hiring" detail="open positions" icon={BriefcaseBusiness} tone="orange" />
                <StatCard title="Placement Rate" value={`${hireRate}%`} change="Conversion" detail="hired candidates" icon={CheckCircle2} tone="green" />
              </div>

              <div className="charts-grid">
                <div className="panel chart-panel">
                  <div className="chart-header">
                    <div>
                      <h3>Hiring Pipeline Funnel</h3>
                      <p>Candidate distribution across recruitment stages</p>
                    </div>
                  </div>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={stageAnalytics} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f1f6" />
                        <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#7e8395" }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7e8395" }} />
                        <Tooltip
                          contentStyle={{ background: "#ffffff", border: "1px solid #e7e8f0", borderRadius: "8px", fontSize: "11px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
                          formatter={(value) => [`${value} candidates`, "Count"]}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {stageAnalytics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="panel chart-panel">
                  <div className="chart-header">
                    <div>
                      <h3>Department Load</h3>
                      <p>Applicant volume distribution across departments</p>
                    </div>
                  </div>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={departmentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={4}
                          dataKey="value"
                          nameKey="name"
                        >
                          {departmentData.map((entry, index) => (
                            <Cell key={`dept-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: "#ffffff", border: "1px solid #e7e8f0", borderRadius: "8px", fontSize: "11px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
                          formatter={(value) => [`${value} applicants`, "Volume"]}
                        />
                        <Legend
                          iconType="circle"
                          wrapperStyle={{ fontSize: "11px", color: "#666b7f", paddingTop: "8px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="panel chart-panel full-chart-panel">
                <div className="chart-header">
                  <div>
                    <h3>AI Resume Screening Score Distribution</h3>
                    <p>Candidate density across AI match score brackets</p>
                  </div>
                </div>
                <div className="chart-wrapper">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={scoreTiersData} margin={{ top: 15, right: 25, left: -15, bottom: 5 }}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6258e8" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6258e8" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f1f6" />
                      <XAxis dataKey="tier" tick={{ fontSize: 11, fill: "#7e8395" }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#7e8395" }} />
                      <Tooltip
                        contentStyle={{ background: "#ffffff", border: "1px solid #e7e8f0", borderRadius: "8px", fontSize: "11px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
                        formatter={(value) => [`${value} candidates`, "Applicants"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="candidates"
                        stroke="#6258e8"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#scoreGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {showJobForm && (
            <div className="modal-backdrop" onClick={() => setShowJobForm(false)}>
              <form
                className="job-modal"
                onSubmit={addJob}
                onClick={event => event.stopPropagation()}
              >
                <div className="modal-heading">
                  <div>
                    <h2>Create a job posting</h2>
                    <p>Save a new role to PostgreSQL.</p>
                  </div>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setShowJobForm(false)}
                  >
                    <X size={19} />
                  </button>
                </div>

                <label>
                  Job title
                  <input
                    required
                    minLength={2}
                    autoFocus
                    value={jobTitle}
                    onChange={event => setJobTitle(event.target.value)}
                    placeholder="e.g. Software Engineer"
                  />
                </label>

                <label>
                  Department
                  <select
                    value={jobDepartment}
                    onChange={event => setJobDepartment(event.target.value)}
                  >
                    {[
                      "Engineering", "AI & Data", "Design",
                      "Product", "Human Resources", "Operations",
                    ].map(department => (
                      <option key={department}>{department}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Employment type
                  <select
                    value={jobType}
                    onChange={event => setJobType(event.target.value)}
                  >
                    {["Full-time", "Part-time", "Contract", "Remote", "Internship"].map(type => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="subtle-button"
                    onClick={() => setShowJobForm(false)}
                  >
                    Cancel
                  </button>
                  <button className="primary-button" type="submit">
                    <Plus size={16} /> Create job
                  </button>
                </div>
              </form>
            </div>
          )}

          <footer className="app-footer">
            <span>TalentFlow <span className="footer-dot">•</span> AI-Assisted Recruitment</span>
            <span>
              <span className="online-dot" />
              {apiConnected ? "API connected" : "API disconnected"}
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}
