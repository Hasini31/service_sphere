"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Scatter } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface User {
  id: number;
  email: string;
  name: string;
  department: string;
  role: string;
}

interface Stats {
  total_employees: number;
  total_assessments: number;
  high_burnout: number;
  medium_burnout: number;
  low_burnout: number;
  avg_burnout: number;
  worsening_trends: number;
  improving_trends: number;
  scatter_data: Array<{
    work_hours: number;
    fatigue: number;
    burnout_level: string;
  }>;
}

interface Record {
  id: number;
  employee_id: number;
  employee_name: string;
  mood: string;
  work_hours: number;
  fatigue: number;
  experience: number;
  feedback: string;
  sentiment: string;
  sentiment_score: number;
  burnout_score: number;
  burnout_level: string;
  suggestions: string[];
  week_number: number;
  day_of_week: number;
  weekly_trend: string;
  created_at: string;
}

export default function ManagerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/manager/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "manager") {
      router.push("/manager/login");
      return;
    }

    setUser(parsedUser);
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      const [statsRes, recordsRes] = await Promise.all([
        fetch("/api/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/records", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!statsRes.ok || !recordsRes.ok) {
        if (statsRes.status === 401 || recordsRes.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/manager/login");
          return;
        }
        throw new Error("Failed to fetch data");
      }

      const statsData = await statsRes.json();
      const recordsData = await recordsRes.json();

      setStats(statsData);
      setRecords(recordsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/manager/login");
  };

  const barChartData = {
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        label: "Employees",
        data: stats
          ? [stats.low_burnout, stats.medium_burnout, stats.high_burnout]
          : [0, 0, 0],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgb(16, 185, 129)",
          "rgb(245, 158, 11)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 0,
        borderRadius: 8,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: "#6b7280", font: { family: "var(--font-sans)" } },
        grid: { color: "rgba(0, 0, 0, 0.06)" },
      },
      x: {
        ticks: { color: "#6b7280", font: { family: "var(--font-sans)" } },
        grid: { display: false },
      },
    },
  };

  const scatterData = {
    datasets: [
      {
        label: "Low Burnout",
        data: stats?.scatter_data.filter((d) => d.burnout_level === "Low").map((d) => ({ x: d.work_hours, y: d.fatigue })) || [],
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgb(16, 185, 129)",
        pointRadius: 3,  // Minimized dot size
        pointHoverRadius: 5,
      },
      {
        label: "Medium Burnout",
        data: stats?.scatter_data.filter((d) => d.burnout_level === "Medium").map((d) => ({ x: d.work_hours, y: d.fatigue })) || [],
        backgroundColor: "rgba(245, 158, 11, 0.8)",
        borderColor: "rgb(245, 158, 11)",
        pointRadius: 3,  // Minimized dot size
        pointHoverRadius: 5,
      },
      {
        label: "High Burnout",
        data: stats?.scatter_data.filter((d) => d.burnout_level === "High").map((d) => ({ x: d.work_hours, y: d.fatigue })) || [],
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgb(239, 68, 68)",
        pointRadius: 3,  // Minimized dot size
        pointHoverRadius: 5,
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: "#6b7280", usePointStyle: true, font: { family: "var(--font-sans)" } },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Work Hours", color: "#6b7280", font: { family: "var(--font-sans)" } },
        ticks: { color: "#6b7280", font: { family: "var(--font-sans)" } },
        grid: { color: "rgba(0, 0, 0, 0.06)" },
      },
      y: {
        title: { display: true, text: "Fatigue Level", color: "#6b7280", font: { family: "var(--font-sans)" } },
        ticks: { color: "#6b7280", font: { family: "var(--font-sans)" } },
        grid: { color: "rgba(0, 0, 0, 0.06)" },
        min: 0,
        max: 10,
      },
    },
  };

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (loading) {
    return (
      <div className="loading-screen">
        <span className="spinner"></span>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <nav className="nav">
          <Link href="/" className="nav-logo">Burnout Detection</Link>
          <div className="nav-links">
            <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
          </div>
        </nav>
        <div className="container">
          <div className="error-alert" style={{ textAlign: "center" }}>{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <nav className="nav">
        <Link href="/manager" className="nav-logo">Burnout Detection</Link>
        <div className="nav-links">
          <span className="user-greeting">Manager: {user?.name}</span>
          <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
        </div>
      </nav>

      <div className="container">
        <div className="dashboard-header fade-in">
          <h1 className="dashboard-title">
            Manager <span className="accent">Dashboard</span>
          </h1>
          <p className="dashboard-subtitle">
            Monitor employee burnout levels and wellness metrics across your team
          </p>
        </div>

        <div className="stats-grid slide-up">
          <div className="card stat-card">
            <div className="stat-value primary">{stats?.total_employees || 0}</div>
            <div className="stat-label">Unique Employees</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{stats?.total_assessments || 0}</div>
            <div className="stat-label">Total Assessments</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value danger">{stats?.high_burnout || 0}</div>
            <div className="stat-label">High Burnout</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value warning">{stats?.medium_burnout || 0}</div>
            <div className="stat-label">Medium Burnout</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value success">{stats?.low_burnout || 0}</div>
            <div className="stat-label">Low Burnout</div>
          </div>
          <div className="card stat-card">
            <div className="stat-value">{stats?.avg_burnout || 0}</div>
            <div className="stat-label">Avg. Burnout Score</div>
          </div>
        </div>

        {/* Trend Stats */}
        <div className="trend-stats-grid slide-up">
          <div className="card trend-stat-card improving">
            <div className="trend-stat-icon">+</div>
            <div className="trend-stat-content">
              <div className="trend-stat-value">{stats?.improving_trends || 0}</div>
              <div className="trend-stat-label">Improving Trends</div>
            </div>
          </div>
          <div className="card trend-stat-card worsening">
            <div className="trend-stat-icon">-</div>
            <div className="trend-stat-content">
              <div className="trend-stat-value">{stats?.worsening_trends || 0}</div>
              <div className="trend-stat-label">Worsening Trends</div>
            </div>
          </div>
        </div>

        <div className="charts-grid slide-up">
          <div className="card chart-card">
            <h3 className="chart-title">Burnout Level Distribution</h3>
            <div className="chart-container">
              {stats?.charts?.pie_chart ? (
                <img src={stats.charts.pie_chart} alt="Burnout Distribution" style={{ width: '100%', height: 'auto' }} />
              ) : (
                <div className="empty-chart">Loading chart...</div>
              )}
            </div>
          </div>
          <div className="card chart-card">
            <h3 className="chart-title">Work Hours vs Fatigue Correlation</h3>
            <div className="chart-container">
              {stats?.charts?.scatter_chart ? (
                <img src={stats.charts.scatter_chart} alt="Work Hours vs Fatigue" style={{ width: '100%', height: 'auto' }} />
              ) : (
                <Scatter data={scatterData} options={scatterOptions} />
              )}
            </div>
          </div>
        </div>

        <div className="card table-card slide-up">
          <h3 className="table-title">Employee Records</h3>
          {records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">--</div>
              <p>No employee records yet</p>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem", opacity: 0.7 }}>
                Records will appear here after employees complete assessments
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Submission Date</th>
                    <th>Mood</th>
                    <th>Work Hours</th>
                    <th>Fatigue</th>
                    <th>Sentiment</th>
                    <th>Score</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className={record.burnout_level === "High" ? "high-risk" : ""}>
                      <td style={{ fontWeight: 500 }}>{record.employee_name}</td>
                      <td>{record.submission_date || "-"}</td>
                      <td>{record.mood}</td>
                      <td>{record.work_hours}h</td>
                      <td>{record.fatigue}/10</td>
                      <td>
                        <span className={`sentiment-badge ${record.sentiment.toLowerCase()}`}>
                          {record.sentiment}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{typeof record.burnout_score === 'number' ? record.burnout_score.toFixed(2) : record.burnout_score}</td>
                      <td>
                        <span className={`badge ${record.burnout_level.toLowerCase()}`}>
                          {record.burnout_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
