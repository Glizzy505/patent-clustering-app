import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { updatedData } from "../helpers/helper";

function LandingDashboard() {
  const [summary, setSummary] = useState({
    totalPatents: 0,
    totalClusters: 0,
    topKeywords: [],
    keywordCounts: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRecent, setShowRecent] = useState(false);

  // Color palette (high contrast)
  const colors = [
    "#1E3A8A", // Blue (better contrast)
    "#BE185D", // Pink
    "#065F46", // Green
    "#92400E", // Amber
    "#6D28D9", // Purple
    "#991B1B", // Red (errors)
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Fetching patents_output.json...");
        const response = await fetch("/patents_output.json");
        if (!response.ok) {
          throw new Error(
            `HTTP error: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        const patents = updatedData(data);

        if (!Array.isArray(patents) || patents.length === 0) {
          throw new Error("Invalid or empty patent data");
        }

        const totalPatents = patents.length;
        const clusters = [
          ...new Set(patents.map((p) => p.cluster).filter((c) => c != null)),
        ];
        const totalClusters = clusters.length;
        const keywordCounts = {};
        patents.forEach((p, index) => {
          const keywords = Array.isArray(p.keywords) ? p.keywords : [];
          if (keywords.length === 0) {
            console.warn(`Patent ${index} has no keywords`);
          }
          keywords.forEach((k) => {
            if (k && typeof k === "string") {
              keywordCounts[k] = (keywordCounts[k] || 0) + 1;
            }
          });
        });
        const topKeywords = Object.entries(keywordCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([k]) => k);

        const summaryData = {
          totalPatents,
          totalClusters,
          topKeywords,
          keywordCounts,
        };

        console.log("Loaded Summary:", summaryData);
        setSummary(summaryData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err.message);
        setError(err.message);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Fallback data
  const fallbackSummary = {
    totalPatents: 100,
    totalClusters: 10,
    topKeywords: [
      "ai",
      "blockchain",
      "machine learning",
      "crypto",
      "neural network",
    ],
    keywordCounts: {
      ai: 20,
      blockchain: 15,
      "machine learning": 12,
      crypto: 8,
      "neural network": 5,
    },
  };

  // Ensure display data
  const displaySummary = {
    totalPatents: summary.totalPatents || fallbackSummary.totalPatents,
    totalClusters: summary.totalClusters || fallbackSummary.totalClusters,
    topKeywords:
      summary.topKeywords.length > 0
        ? summary.topKeywords
        : fallbackSummary.topKeywords,
    keywordCounts:
      summary.topKeywords.length > 0
        ? summary.keywordCounts
        : fallbackSummary.keywordCounts,
  };

  console.log("Rendering with displaySummary:", displaySummary);

  if (loading) {
    return (
      <div
        className="container py-5"
        style={{ maxWidth: "100%", overflowX: "hidden" }}
        data-testid="dashboard-loading"
      >
        <div className="text-center">
          <div
            className="spinner-border"
            style={{ color: colors[0] }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2" style={{ color: colors[0] }}>
            Loading Dashboard...
          </p>
        </div>
        <div className="row g-4 mb-5 mt-5">
          {[
            {
              title: "Total Patents",
              icon: "bi-file-text",
              value: fallbackSummary.totalPatents,
              color: colors[0],
              testId: "total-patents-card",
            },
            {
              title: "Total Clusters",
              icon: "bi-diagram-3",
              value: fallbackSummary.totalClusters,
              color: colors[2],
              testId: "total-clusters-card",
            },
            {
              title: "Top Keywords",
              icon: "bi-tags",
              content: (
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {fallbackSummary.topKeywords.map((k, i) => (
                    <span
                      key={k}
                      className="badge"
                      style={{
                        background: colors[i % colors.length],
                        color: "#fff",
                      }}
                      data-bs-toggle="tooltip"
                      title={`Keyword: ${k}`}
                      data-testid={`keyword-badge-${k}`}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              ),
              color: colors[3],
              testId: "top-keywords-card",
            },
          ].map((card) => (
            <div className="col-md-4" key={card.title}>
              <div className="card text-center h-100" data-testid={card.testId}>
                <div className="card-body">
                  <i
                    className={`bi ${card.icon} fs-2 mb-2`}
                    style={{ color: card.color }}
                  ></i>
                  <h5
                    className="card-title fw-bold"
                    style={{ color: "var(--text-light)" }}
                  >
                    {card.title}
                  </h5>
                  {card.content || (
                    <p
                      className="card-text display-6"
                      style={{ color: card.color }}
                      data-testid={`${card.testId}-value`}
                    >
                      {card.value || "N/A"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="card mb-5">
          <div className="card-body">
            <h5
              className="card-title fw-bold mb-3"
              style={{ color: "var(--text-light)" }}
            >
              Keyword Frequency (Loading)
            </h5>
            <div style={{ width: "100%", overflow: "hidden" }}>
              <Plot
                data={[
                  {
                    x: fallbackSummary.topKeywords,
                    y: fallbackSummary.topKeywords.map(
                      (k) => fallbackSummary.keywordCounts[k]
                    ),
                    type: "bar",
                    marker: { color: colors.slice(0, 5) },
                  },
                ]}
                layout={{
                  height: 400,
                  xaxis: { title: "Keywords", tickangle: 45 },
                  yaxis: { title: "Frequency" },
                  margin: { t: 20, b: 100 },
                  responsive: true,
                  annotations: [
                    {
                      xref: "paper",
                      yref: "paper",
                      x: 0.5,
                      y: 0.5,
                      text: "Loading data...",
                      showarrow: false,
                      font: { size: 16, color: colors[5] },
                    },
                  ],
                }}
                style={{ width: "100%", maxWidth: "100%" }}
                config={{ responsive: true }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="container py-5 text-center"
        style={{ maxWidth: "100%", overflowX: "hidden" }}
        data-testid="dashboard-error"
      >
        <p style={{ color: colors[5] }}>Error: {error}</p>
        <p style={{ color: colors[0] }}>
          Displaying sample data for visualization.
        </p>
        <div className="row g-4 mb-5 mt-5">
          {[
            {
              title: "Total Patents",
              icon: "bi-file-text",
              value: fallbackSummary.totalPatents,
              color: colors[0],
              testId: "total-patents-card",
            },
            {
              title: "Total Clusters",
              icon: "bi-diagram-3",
              value: fallbackSummary.totalClusters,
              color: colors[2],
              testId: "total-clusters-card",
            },
            {
              title: "Top Keywords",
              icon: "bi-tags",
              content: (
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {fallbackSummary.topKeywords.map((k, i) => (
                    <span
                      key={k}
                      className="badge"
                      style={{
                        background: colors[i % colors.length],
                        color: "#fff",
                      }}
                      data-bs-toggle="tooltip"
                      title={`Keyword: ${k}`}
                      data-testid={`keyword-badge-${k}`}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              ),
              color: colors[3],
              testId: "top-keywords-card",
            },
          ].map((card) => (
            <div className="col-md-4" key={card.title}>
              <div className="card text-center h-100" data-testid={card.testId}>
                <div className="card-body">
                  <i
                    className={`bi ${card.icon} fs-2 mb-2`}
                    style={{ color: card.color }}
                  ></i>
                  <h5
                    className="card-title fw-bold"
                    style={{ color: "var(--text-light)" }}
                  >
                    {card.title}
                  </h5>
                  {card.content || (
                    <p
                      className="card-text display-6"
                      style={{ color: card.color }}
                      data-testid={`${card.testId}-value`}
                    >
                      {card.value || "N/A"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="card mb-5">
          <div className="card-body">
            <h5
              className="card-title fw-bold mb-3"
              style={{ color: "var(--text-light)" }}
            >
              Keyword Frequency (Sample)
            </h5>
            <div style={{ width: "100%", overflow: "hidden" }}>
              <Plot
                data={[
                  {
                    x: fallbackSummary.topKeywords,
                    y: fallbackSummary.topKeywords.map(
                      (k) => fallbackSummary.keywordCounts[k]
                    ),
                    type: "bar",
                    marker: { color: colors.slice(0, 5) },
                  },
                ]}
                layout={{
                  height: 400,
                  xaxis: { title: "Keywords", tickangle: 45 },
                  yaxis: { title: "Frequency" },
                  margin: { t: 20, b: 100 },
                  responsive: true,
                  annotations: [
                    {
                      xref: "paper",
                      yref: "paper",
                      x: 0.5,
                      y: 0.5,
                      text: "Sample data due to error",
                      showarrow: false,
                      font: { size: 16, color: colors[5] },
                    },
                  ],
                }}
                style={{ width: "100%", maxWidth: "100%" }}
                config={{ responsive: true }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasValidData =
    displaySummary.topKeywords && displaySummary.topKeywords.length > 0;

  return (
    <div
      className="container py-5"
      style={{ maxWidth: "100%", overflowX: "hidden" }}
      data-testid="dashboard-container"
    >
      <div className="hero-section text-center">
        <h1
          className="display-4 fw-bold mb-3"
          style={{ color: "#fff" }}
          data-testid="hero-title"
        >
          Patent Clustering & Exploration
        </h1>
        <p
          className="lead mb-4 mx-auto"
          style={{ maxWidth: "600px", color: "#f1f5f9" }}
          data-testid="hero-description"
        >
          Discover patent clusters with interactive visualizations and insights.
        </p>
      </div>
      <div className="section-divider" data-testid="section-divider"></div>
      <div className="row g-4 mb-5" data-testid="summary-cards">
        {[
          {
            title: "Total Patents",
            icon: "bi-file-text",
            value: displaySummary.totalPatents,
            color: colors[0],
            testId: "total-patents-card",
          },
          {
            title: "Total Clusters",
            icon: "bi-diagram-3",
            value: displaySummary.totalClusters,
            color: colors[2],
            testId: "total-clusters-card",
          },
          {
            title: "Top Keywords",
            icon: "bi-tags",
            content:
              displaySummary.topKeywords.length > 0 ? (
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  {displaySummary.topKeywords.map((k, i) => (
                    <span
                      key={k}
                      className="badge"
                      style={{
                        background: colors[i % colors.length],
                        color: "#fff",
                      }}
                      data-bs-toggle="tooltip"
                      title={`Keyword: ${k}`}
                      data-testid={`keyword-badge-${k}`}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              ) : (
                <p
                  className="text-muted small"
                  style={{ color: "var(--text-light)" }}
                  data-testid="no-keywords-message"
                >
                  No keywords available
                </p>
              ),
            color: colors[3],
            testId: "top-keywords-card",
          },
        ].map((card) => (
          <div className="col-md-4" key={card.title}>
            <div className="card text-center h-100" data-testid={card.testId}>
              <div className="card-body">
                <i
                  className={`bi ${card.icon} fs-2 mb-2`}
                  style={{ color: card.color }}
                ></i>
                <h5
                  className="card-title fw-bold"
                  style={{ color: "var(--text-light)" }}
                >
                  {card.title}
                </h5>
                {card.content || (
                  <p
                    className="card-text display-6"
                    style={{ color: card.color }}
                    data-testid={`${card.testId}-value`}
                  >
                    {card.value || "N/A"}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card mb-5" data-testid="keyword-frequency-card">
        <div className="card-body">
          <h5
            className="card-title fw-bold mb-3"
            style={{ color: "var(--text-light)" }}
          >
            Keyword Frequency
          </h5>
          <div style={{ width: "100%", overflow: "hidden" }}>
            {hasValidData ? (
              <Plot
                data={[
                  {
                    x: displaySummary.topKeywords,
                    y: displaySummary.topKeywords.map(
                      (k) => displaySummary.keywordCounts[k] || 0
                    ),
                    type: "bar",
                    marker: { color: colors.slice(0, 5) },
                  },
                ]}
                layout={{
                  height: 400,
                  xaxis: { title: "Keywords", tickangle: 45 },
                  yaxis: { title: "Frequency" },
                  margin: { t: 20, b: 100 },
                  responsive: true,
                  plot_bgcolor: "rgba(0,0,0,0)",
                  paper_bgcolor: "rgba(0,0,0,0)",
                }}
                style={{ width: "100%", maxWidth: "100%" }}
                config={{ responsive: true }}
              />
            ) : (
              <Plot
                data={[
                  {
                    x: fallbackSummary.topKeywords,
                    y: fallbackSummary.topKeywords.map(
                      (k) => fallbackSummary.keywordCounts[k]
                    ),
                    type: "bar",
                    marker: { color: colors.slice(0, 5) },
                  },
                ]}
                layout={{
                  height: 400,
                  xaxis: { title: "Keywords", tickangle: 45 },
                  yaxis: { title: "Frequency" },
                  margin: { t: 20, b: 100 },
                  responsive: true,
                  plot_bgcolor: "rgba(0,0,0,0)",
                  paper_bgcolor: "rgba(0,0,0,0)",
                  annotations: [
                    {
                      xref: "paper",
                      yref: "paper",
                      x: 0.5,
                      y: 0.5,
                      text: "No data available. Displaying sample data.",
                      showarrow: false,
                      font: { size: 16, color: colors[5] },
                    },
                  ],
                }}
                style={{ width: "100%", maxWidth: "100%" }}
                config={{ responsive: true }}
              />
            )}
          </div>
        </div>
      </div>
      <div className="text-center" data-testid="recent-patents-toggle">
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowRecent(!showRecent)}
          style={{ borderColor: colors[0], color: colors[0] }}
        >
          {showRecent ? "Hide" : "Show"} Recent Patents
        </button>
        {showRecent && (
          <div className="mt-4">
            <p className="text-muted" style={{ color: "var(--text-light)" }}>
              Feature coming soon: Display recent patent submissions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingDashboard;
