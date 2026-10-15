import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard, BriefcaseBusiness, Users, FileText,
  CalendarDays, Handshake, Bell, Settings, Search,
  ChevronDown, Plus, ArrowUpRight, CheckCircle2,
  TrendingUp, MoreHorizontal, Filter, Menu, X,
  RefreshCw, Wifi, WifiOff, Sun, Moon
} from "lucide-react";
import "./App.css";

const API = "http://localhost:8000";

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
          <div className="brand-mark">
            <Users size={22} />
          </div>

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
                className={`nav-item ${
                  active === label ? "nav-active" : ""
                }`}
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
            <div className="plan-icon">
              <TrendingUp size={17} />
            </div>

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

function Header({
  active,
  query,
  setQuery,
  setActive,
  onMenu,
  theme,
  toggleTheme,
}) {
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

        {/* DAY / NIGHT MODE TOGGLE */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${
            theme === "light" ? "night" : "day"
          } mode`}
          title={
            theme === "light"
              ? "Switch to Night Mode"
              : "Switch to Day Mode"
          }
        >
          {theme === "light" ? (
            <Moon size={18} />
          ) : (
            <Sun size={18} />
          )}

          <span>
            {theme === "light" ? "Night Mode" : "Day Mode"}
          </span>
        </button>

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
        <div className={`stat-icon ${tone}`}>
          <Icon size={19} />
        </div>
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
        No candidates found. Try another search or add candidates to the
        database.
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
                  <div
                    className={`candidate-avatar ${
                      candidate.color || "violet"
                    }`}
                  >
                    {initials(candidate.name)}
                  </div>

                  <div>
                    <strong>{candidate.name}</strong>
                    <span>{candidate.experience} experience</span>
                  </div>
                </div>
              </td>

              <td>
                <span className="position-text">{candidate.role}</span>
              </td>

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
                  onChange={event =>
                    onStatus(candidate.id, event.target.value)
                  }
                  aria-label={`Status for ${candidate.name}`}
                >
                  {statusOptions.map(status => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </td>

              <td className="date-cell">
                {formatDate(candidate.applied_on ?? candidate.date)}
              </td>

              <td>
                <button
                  className="icon-button row-action"
                  aria-label={`Actions for ${candidate.name}`}
                >
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
    return (
      <div className="empty-state">
        No jobs found. Create your first job posting.
      </div>
    );
  }

  return (
    <div className="job-list">
      {jobs.map(job => (
        <div className="job-row" key={job.id}>
          <div className="job-icon">
            <BriefcaseBusiness size={19} />
          </div>

          <div className="job-copy">
            <strong>{job.title}</strong>
            <span>
              {job.department} · {job.job_type ?? job.type ?? "Full-time"}
            </span>
          </div>

          <div className="job-applicants">
            <strong>{job.applicants ?? 0}</strong>
            <span>Applicants</span>
          </div>

          <span className="active-pill">
            <i /> {job.status}
          </span>

          <button
            className="icon-button"
            aria-label={`More about ${job.title}`}
          >
            <MoreHorizontal size={19} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  // THEME STATE: remember the selected mode
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("talentflow-theme") === "dark"
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  });

  // SWITCH BETWEEN DAY AND NIGHT MODE
  const toggleTheme = () => {
    setTheme(current => {
      const next = current === "light" ? "dark" : "light";

      try {
        localStorage.setItem("talentflow-theme", next);
      } catch {
        // Theme still works for this session if storage is unavailable.
      }

      return next;
    });
  };

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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [jobsData, candidatesData, statsData] = await Promise.all([
        apiRequest("/jobs"),
        apiRequest("/candidates"),
        apiRequest("/dashboard/stats"),
      ]);

      setJobs(jobsData);
      setCandidates(candidatesData);
      setStats(statsData);
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
    candidate =>
      ["Shortlisted", "Interview", "Hired"].includes(candidate.status)
  );

  return (
    <div className="app-shell" data-theme={theme}>
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
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <div className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">
                <span /> RECRUITMENT OVERVIEW
              </div>

              <h1>
                {active === "Dashboard" ? "Good morning, Pavan" : active}
              </h1>

              <p>
                Here's what's happening with your recruitment pipeline today.
              </p>
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
              Backend:{" "}
              <strong>
                {apiConnected
                  ? "Connected to PostgreSQL"
                  : "Disconnected"}
              </strong>
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
              <button onClick={loadData} className="subtle-button">
                Retry
              </button>
            </div>
          )}

          {loading && (
            <div className="loading-banner">
              Loading recruitment data…
            </div>
          )}

          {/* DASHBOARD */}
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
                      <p>
                        Review applicants and their current screening scores.
                      </p>
                    </div>

                    <button
                      className="subtle-button"
                      onClick={() => setActive("Candidates")}
                    >
                      View all <ArrowUpRight size={15} />
                    </button>
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
                    <p>
                      Monitor job postings and incoming applications.
                    </p>
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

          {/* JOBS */}
          {active === "Jobs" && (
            <section className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h2>Job postings</h2>
                  <p>Manage open roles and recruitment requirements.</p>
                </div>

                <button className="subtle-button" onClick={loadData}>
                  <RefreshCw size={15} /> Refresh
                </button>
              </div>

              <JobList jobs={filteredJobs} />
            </section>
          )}

          {/* CANDIDATES AND APPLICATIONS */}
          {["Candidates", "Applications"].includes(active) && (
            <section className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h2>
                    {active === "Candidates"
                      ? "Candidate directory"
                      : "Application pipeline"}
                  </h2>

                  <p>
                    Search candidates and save recruitment-stage updates.
                  </p>
                </div>

                <button className="subtle-button" onClick={loadData}>
                  <RefreshCw size={15} /> Refresh
                </button>
              </div>

              <CandidateTable
                candidates={filteredCandidates}
                onStatus={updateStatus}
                busyId={busyId}
              />
            </section>
          )}

          {/* INTERVIEWS */}
          {active === "Interviews" && (
            <section className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h2>Interview schedule</h2>
                  <p>Candidates currently in the interview stage.</p>
                </div>

                <CalendarDays size={22} />
              </div>

              {interviewCandidates.length ? (
                <CandidateTable
                  candidates={interviewCandidates}
                  onStatus={updateStatus}
                  busyId={busyId}
                />
              ) : (
                <div className="empty-state">
                  No candidates are currently in the interview stage.
                </div>
              )}
            </section>
          )}

          {/* OFFERS AND HIRING */}
          {active === "Offers & Hiring" && (
            <section className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h2>Offers & hiring</h2>
                  <p>Track shortlisted candidates and hiring outcomes.</p>
                </div>
              </div>

              <CandidateTable
                candidates={hiringCandidates}
                onStatus={updateStatus}
                busyId={busyId}
              />
            </section>
          )}

          {/* NOTIFICATIONS */}
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
                  <p>
                    {apiConnected
                      ? "FastAPI is returning data from PostgreSQL."
                      : "The backend connection needs attention."}
                  </p>
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

          {/* SETTINGS */}
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
                <label>
                  Workspace name
                  <input defaultValue="Nova Technologies" />
                </label>

                <label>
                  Administrator name
                  <input defaultValue="Pavan S." />
                </label>

                <label>
                  Contact email
                  <input defaultValue="admin@example.com" />
                </label>
              </div>
            </section>
          )}

          {/* REPORTS */}
          {active === "Reports" && (
            <section className="panel full-panel">
              <div className="panel-header">
                <div>
                  <h2>Recruitment insights</h2>
                  <p>Live statistics calculated from the database.</p>
                </div>
              </div>

              <div className="stat-grid">
                <StatCard
                  title="Candidates"
                  value={stats.total_candidates}
                  change="Live data"
                  detail="registered"
                  icon={Users}
                  tone="blue"
                />

                <StatCard
                  title="Open jobs"
                  value={stats.active_jobs}
                  change="Live data"
                  detail="active postings"
                  icon={BriefcaseBusiness}
                  tone="purple"
                />

                <StatCard
                  title="Interviews"
                  value={stats.interviews_scheduled}
                  change="Live data"
                  detail="in interview stage"
                  icon={CalendarDays}
                  tone="orange"
                />

                <StatCard
                  title="Hired"
                  value={stats.offers_accepted}
                  change="Live data"
                  detail="hiring completed"
                  icon={CheckCircle2}
                  tone="green"
                />
              </div>
            </section>
          )}

          {/* CREATE JOB MODAL */}
          {showJobForm && (
            <div
              className="modal-backdrop"
              onClick={() => setShowJobForm(false)}
            >
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
                      "Engineering",
                      "AI & Data",
                      "Design",
                      "Product",
                      "Human Resources",
                      "Operations",
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
                    {[
                      "Full-time",
                      "Part-time",
                      "Contract",
                      "Remote",
                      "Internship",
                    ].map(type => (
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
            <span>
              TalentFlow <span className="footer-dot">•</span>{" "}
              AI-Assisted Recruitment
            </span>

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