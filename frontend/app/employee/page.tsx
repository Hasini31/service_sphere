"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: number;
  email: string;
  name: string;
  department: string;
  role: string;
}

interface PredictionResult {
  id: number;
  employee_name: string;
  mood: string;
  work_hours: number;
  sleep_hours: number;
  fatigue: number;
  experience: number;
  feedback: string;
  sentiment: string;
  sentiment_score: number;
  burnout_score: number;
  burnout_level: string;
  suggestions: string[];
  weekly_analysis: {
    current_day: string;
    week_number: number;
    trend: string;
    trend_message: string;
    pattern: string;
    days_analyzed: number;
    comparison: {
      current: number;
      average: number;
      difference: number;
    } | null;
  };
}

interface HistoryRecord {
  id: number;
  mood: string;
  work_hours: number;
  sleep_hours: number;
  fatigue: number;
  burnout_score: number;
  burnout_level: string;
  weekly_trend: string;
  created_at: string;
}

interface Analytics {
  burnout_distribution: {
    Low: number;
    Medium: number;
    High: number;
  };
  weekly_trend: Array<{
    day: string;
    score: number;
    date: string;
  }>;
  week_comparison: {
    current_week_avg: number;
    last_week_avg: number;
    change: number;
    trend: string;
  } | null;
  alert: string | null;
}

export default function EmployeeDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<"assess" | "history">("assess");

  const [formData, setFormData] = useState({
    mood: "Okay",
    work_hours: "8",
    sleep_hours: "7",
    fatigue: "5",
    experience: "2",
    feedback: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "employee") {
      router.push("/login");
      return;
    }

    setUser(parsedUser);
    fetchHistory();
    setLoading(false);
  }, [router]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/my-records", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.records);
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mood: formData.mood,
          work_hours: parseFloat(formData.work_hours),
          sleep_hours: parseFloat(formData.sleep_hours),
          fatigue: parseInt(formData.fatigue),
          experience: parseFloat(formData.experience),
          feedback: formData.feedback,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get prediction");
      }

      const data = await response.json();
      setResult(data);
      fetchHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({
      mood: "Okay",
      work_hours: "8",
      sleep_hours: "7",
      fatigue: "5",
      experience: "2",
      feedback: "",
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <span className="spinner"></span>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <nav className="nav">
        <Link href="/employee" className="nav-logo">
          Burnout Detection
        </Link>
        <div className="nav-links">
          <span className="user-greeting">Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="nav-link logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="container">
        <div className="dashboard-header fade-in">
          <h1 className="dashboard-title">
            Your <span className="accent">Wellness Dashboard</span>
          </h1>
          <p className="dashboard-subtitle">
            Track your burnout levels over time with weekly pattern analysis
          </p>
        </div>

        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab ${activeTab === "assess" ? "active" : ""}`}
            onClick={() => setActiveTab("assess")}
          >
            New Assessment
          </button>
          <button
            className={`dashboard-tab ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            My History ({history.length})
          </button>
        </div>

        {activeTab === "assess" && !result && (
          <div className="card-elevated form-card slide-up" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className="form-header">
              <h2 className="form-title">
                Daily <span className="accent">Check-in</span>
              </h2>
              <p className="form-subtitle">
                Your data is compared with previous days this week for better analysis.
              </p>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Current Mood</label>
                <select
                  className="form-select"
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                >
                  <option value="Happy">Happy</option>
                  <option value="Okay">Okay</option>
                  <option value="Stressed">Stressed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Work Hours Today: {formData.work_hours}h
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="16"
                  step="0.5"
                  value={formData.work_hours}
                  onChange={(e) => setFormData({ ...formData, work_hours: e.target.value })}
                />
                <div className="range-labels">
                  <span>0h</span>
                  <span>8h</span>
                  <span>16h</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Sleep Hours Last Night: {formData.sleep_hours}h
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={formData.sleep_hours}
                  onChange={(e) => setFormData({ ...formData, sleep_hours: e.target.value })}
                />
                <div className="range-labels">
                  <span>0h</span>
                  <span>6h</span>
                  <span>12h</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Fatigue Level: {formData.fatigue}/10
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="10"
                  value={formData.fatigue}
                  onChange={(e) => setFormData({ ...formData, fatigue: e.target.value })}
                />
                <div className="range-labels">
                  <span>None</span>
                  <span>Moderate</span>
                  <span>Extreme</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="50"
                  step="0.5"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">How are you feeling today?</label>
                <textarea
                  className="form-textarea"
                  placeholder="Share your thoughts about work, stress, or anything else..."
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <span className="loading">
                    <span className="spinner"></span>
                    Analyzing...
                  </span>
                ) : (
                  "Submit Daily Check-in"
                )}
              </button>
            </form>
          </div>
        )}

        {activeTab === "assess" && result && (
          <div className="card-elevated result-container slide-up" style={{ maxWidth: "700px", margin: "0 auto" }}>
            <div className="result-header">
              <div className={`result-score ${result.burnout_level.toLowerCase()}`}>
                {typeof result.burnout_score === 'number' ? result.burnout_score.toFixed(2) : result.burnout_score}
              </div>
              <span className={`result-level ${result.burnout_level.toLowerCase()}`}>
                {result.burnout_level} Burnout Risk
              </span>
            </div>

            {/* Weekly Analysis Section */}
            <div className="weekly-analysis-card">
              <h3 className="weekly-analysis-title">
                Weekly Analysis - {result.weekly_analysis?.current_day || "Today"}
              </h3>
              <div className={`trend-indicator ${result.weekly_analysis?.trend || "baseline"}`}>
                {result.weekly_analysis?.trend === "improving" && "Improving"}
                {result.weekly_analysis?.trend === "worsening" && "Getting Worse"}
                {result.weekly_analysis?.trend === "stable" && "Stable"}
                {result.weekly_analysis?.trend === "baseline" && "Baseline"}
              </div>
              <p className="trend-message">{result.weekly_analysis?.trend_message || "Track your progress over time"}</p>
              
              {result.weekly_analysis?.comparison && (
                <div className="comparison-stats">
                  <div className="comparison-stat">
                    <span className="comparison-label">Today</span>
                    <span className="comparison-value">{result.weekly_analysis?.comparison?.current?.toFixed(1) || result.burnout_score?.toFixed(1) || "N/A"}</span>
                  </div>
                  <div className="comparison-stat">
                    <span className="comparison-label">Week Avg</span>
                    <span className="comparison-value">{result.weekly_analysis?.comparison?.average?.toFixed(1) || "N/A"}</span>
                  </div>
                  <div className="comparison-stat">
                    <span className="comparison-label">Days Analyzed</span>
                    <span className="comparison-value">{result.weekly_analysis?.days_analyzed || "1"}</span>
                  </div>
                </div>
              )}
              
              {result.weekly_analysis?.pattern && result.weekly_analysis.pattern !== "No pattern yet" && (
                <p className="pattern-info">Pattern: {result.weekly_analysis.pattern}</p>
              )}
            </div>

            <div className="result-body">
              <div className="result-section">
                <h3 className="result-section-title">Analysis Summary</h3>
                <div className="result-grid">
                  <div className="result-item">
                    <div className="result-item-label">Current Mood</div>
                    <div className="result-item-value">{result.mood}</div>
                  </div>
                  <div className="result-item">
                    <div className="result-item-label">Work Hours</div>
                    <div className="result-item-value">{result.work_hours}h</div>
                  </div>
                  <div className="result-item">
                    <div className="result-item-label">Sleep Hours</div>
                    <div className="result-item-value">{result.sleep_hours}h</div>
                  </div>
                  <div className="result-item">
                    <div className="result-item-label">Fatigue Level</div>
                    <div className="result-item-value">{result.fatigue}/10</div>
                  </div>
                  <div className="result-item">
                    <div className="result-item-label">Feedback Sentiment</div>
                    <div className="result-item-value">
                      <span className={`sentiment-badge ${result.sentiment.toLowerCase()}`}>
                        {result.sentiment}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="result-section">
                <h3 className="result-section-title">Personalized Recommendations</h3>
                <ul className="suggestions-list">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="suggestion-item">
                      <span className="suggestion-icon">{index + 1}</span>
                      <span className="suggestion-text">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="result-actions">
              <button onClick={handleReset} className="btn btn-secondary">
                New Assessment
              </button>
              <button onClick={() => setActiveTab("history")} className="btn btn-primary">
                View History
              </button>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="slide-up">
            {/* Alert System */}
            {analytics?.alert && (
              <div className="card alert-card" style={{ marginBottom: "1.5rem" }}>
                <div className="alert-content">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-message">{analytics.alert}</div>
                </div>
              </div>
            )}

            {/* Analytics Dashboard */}
            {analytics && (
              <div className="analytics-grid" style={{ marginBottom: "1.5rem" }}>
                {/* Pie Chart */}
                <div className="card chart-card">
                  <h3 className="chart-title">Burnout Distribution</h3>
                  <div className="pie-chart-container">
                    <div className="pie-chart">
                      <div className="pie-segment low" style={{ 
                        background: '#22C55E',
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + analytics.burnout_distribution.Low * 3.6}% 0%, ${50 + analytics.burnout_distribution.Low * 3.6}% 50%)`
                      }}></div>
                      <div className="pie-segment medium" style={{ 
                        background: '#F59E0B',
                        clipPath: `polygon(50% 50%, ${50 + analytics.burnout_distribution.Low * 3.6}% 0%, ${50 + (analytics.burnout_distribution.Low + analytics.burnout_distribution.Medium) * 3.6}% 0%, ${50 + (analytics.burnout_distribution.Low + analytics.burnout_distribution.Medium) * 3.6}% 50%)`
                      }}></div>
                      <div className="pie-segment high" style={{ 
                        background: '#EF4444',
                        clipPath: `polygon(50% 50%, ${50 + (analytics.burnout_distribution.Low + analytics.burnout_distribution.Medium) * 3.6}% 0%, 100% 0%, 100% 50%)`
                      }}></div>
                    </div>
                    <div className="pie-legend">
                      <div className="legend-item">
                        <div className="legend-color" style={{ background: '#22C55E' }}></div>
                        <span>Low ({analytics.burnout_distribution.Low})</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color" style={{ background: '#F59E0B' }}></div>
                        <span>Medium ({analytics.burnout_distribution.Medium})</span>
                      </div>
                      <div className="legend-item">
                        <div className="legend-color" style={{ background: '#EF4444' }}></div>
                        <span>High ({analytics.burnout_distribution.High})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Trend Graph */}
                <div className="card chart-card">
                  <h3 className="chart-title">7-Day Trend</h3>
                  <div className="line-chart-container">
                    <div className="line-chart">
                      {analytics.weekly_trend.map((point, index) => (
                        <div key={index} className="chart-point" style={{
                          left: `${(index / 6) * 100}%`,
                          bottom: `${(point.score / 10) * 100}%`
                        }}>
                          <div className="chart-dot" style={{ background: '#4F46E5' }}></div>
                          <div className="chart-label">{point.day}</div>
                          <div className="chart-value">{point.score}</div>
                        </div>
                      ))}
                      {/* Line connecting dots */}
                      <svg className="chart-line" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline
                          fill="none"
                          stroke="#4F46E5"
                          strokeWidth="2"
                          points={analytics.weekly_trend.map((point, index) => 
                            `${(index / 6) * 100},${100 - (point.score / 10) * 100}`
                          ).join(' ')}
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Week Comparison */}
                {analytics.week_comparison && (
                  <div className="card comparison-card">
                    <h3 className="chart-title">Week Comparison</h3>
                    <div className="comparison-content">
                      <div className="comparison-item">
                        <div className="comparison-label">Last Week</div>
                        <div className="comparison-value">{analytics.week_comparison.last_week_avg}</div>
                      </div>
                      <div className="comparison-arrow">
                        <div className={`arrow ${analytics.week_comparison.trend}`}>
                          {analytics.week_comparison.trend === 'improving' ? '↓' : 
                           analytics.week_comparison.trend === 'declining' ? '↑' : '→'}
                        </div>
                        <div className="change-value">
                          {analytics.week_comparison.change > 0 ? '+' : ''}{analytics.week_comparison.change}
                        </div>
                      </div>
                      <div className="comparison-item">
                        <div className="comparison-label">This Week</div>
                        <div className="comparison-value">{analytics.week_comparison.current_week_avg}</div>
                      </div>
                    </div>
                    <div className={`trend-indicator ${analytics.week_comparison.trend}`}>
                      {analytics.week_comparison.trend === 'improving' ? '📉 Improving' : 
                       analytics.week_comparison.trend === 'declining' ? '📈 Declining' : '➡️ Stable'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Table */}
            <div className="card table-card">
              <h3 className="table-title">Your Assessment History ({history.length})</h3>
            {history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">--</div>
                <p>No assessments yet</p>
                <p style={{ fontSize: "0.875rem", marginTop: "0.5rem", opacity: 0.7 }}>
                  Complete your first daily check-in to start tracking
                </p>
                <button 
                  onClick={() => setActiveTab("assess")} 
                  className="btn btn-primary"
                  style={{ marginTop: "1rem" }}
                >
                  Start Assessment
                </button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Mood</th>
                    <th>Work Hours</th>
                    <th>Fatigue</th>
                    <th>Burnout Score</th>
                    <th>Level</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record) => (
                    <tr
                      key={record.id}
                      className={record.burnout_level === "High" ? "high-risk" : ""}
                    >
                      <td>{new Date(record.created_at).toLocaleDateString()}</td>
                      <td>{record.mood}</td>
                      <td>{record.work_hours}h</td>
                      <td>{record.fatigue}/10</td>
                      <td style={{ fontWeight: 600 }}>{record.burnout_score}</td>
                      <td>
                        <span className={`badge ${record.burnout_level.toLowerCase()}`}>
                          {record.burnout_level}
                        </span>
                      </td>
                      <td>
                        <span className={`trend-badge ${record.weekly_trend || "baseline"}`}>
                          {record.weekly_trend || "baseline"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
