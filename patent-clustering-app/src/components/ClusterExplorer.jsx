import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";
import { Dropdown } from "react-bootstrap";
import { updatedData } from "../helpers/helper";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function ClusterExplorer() {
  const [patents, setPatents] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/patents_output.json");
        if (!response.ok) throw new Error("Failed to load patent data");
        const patents = await response.json();
        const data = updatedData(patents);

        const clusterMap = {};
        data.forEach((p) => {
          if (!clusterMap[p.cluster_id]) {
            clusterMap[p.cluster_id] = {
              name: p.cluster,
              count: 0,
              keywords: new Set(),
              patents: [],
            };
          }
          clusterMap[p.cluster_id].count += 1;
          p.keywords.forEach((k) => clusterMap[p.cluster_id].keywords.add(k));
          clusterMap[p.cluster_id].patents.push(p);
        });

        const clusterData = Object.entries(clusterMap).map(([id, info]) => ({
          cluster_id: parseInt(id),
          name: info.name,
          count: info.count,
          keywords: [...info.keywords],
          patents: info.patents,
        }));

        setPatents(data);
        setClusters(clusterData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const colors = [
    "#2563eb", // Primary blue
    "#3b82f6", // Lighter blue
    "#60a5fa", // Even lighter
    "#93c5fd", // Lightest blue
    "#1d4ed8", // Darker blue
    "#1e40af", // Darkest blue
  ];

  const plotData = clusters.map((c, i) => ({
    x: [c.cluster_id],
    y: [c.count],
    type: "scatter",
    mode: "markers",
    marker: {
      size: Math.max(c.count * 5, 10),
      color: colors[i % colors.length],
      opacity: 0.8,
      line: { width: 2, color: "#ffffff" },
    },
    text: [c.name],
    hovertemplate: `<b>${c.name}</b><br>Patents: ${
      c.count
    }<br>Keywords: ${c.keywords.slice(0, 5).join(", ")}<extra></extra>`,
  }));

  const barData = {
    labels: clusters.map((c) => c.name),
    datasets: [
      {
        label: "Patent Count",
        data: clusters.map((c) => c.count),
        backgroundColor: clusters.map(
          (_, i) => colors[i % colors.length] + "80"
        ),
        borderColor: clusters.map((_, i) => colors[i % colors.length]),
        borderWidth: 1,
        hoverBackgroundColor: clusters.map((_, i) => colors[i % colors.length]),
      },
    ],
  };

  const years = [...new Set(patents.map((p) => p.year))].sort();
  const timeTrendData = {
    labels: years,
    datasets: clusters.map((c, i) => ({
      label: c.name,
      data: years.map(
        (year) =>
          patents.filter(
            (p) => p.cluster_id === c.cluster_id && p.year === year
          ).length
      ),
      fill: false,
      borderColor: colors[i % colors.length],
      backgroundColor: colors[i % colors.length],
      pointBackgroundColor: colors[i % colors.length],
      tension: 0.3,
      pointHoverRadius: 8,
    })),
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="text-center py-5 text-danger fw-bold">Error: {error}</div>
    );

  return (
    <div className="container py-5">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="d-flex justify-content-between align-items-center mb-5"
      >
        <h1 className="h2 fw-bold">Cluster Explorer</h1>
        <Dropdown>
          <Dropdown.Toggle
            variant="outline-primary"
            id="dropdown-cluster"
            className="fw-medium"
          >
            {selectedCluster ? selectedCluster.name : "Select Cluster"}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {clusters.map((c) => (
              <Dropdown.Item
                key={c.cluster_id}
                onClick={() => setSelectedCluster(c)}
              >
                {c.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </motion.div>

      <div className="row mb-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-lg-6 mb-4"
        >
          <div className="card shadow border-0 chart-card">
            <div className="card-body">
              <h3 className="card-title h5 fw-semibold mb-3">
                Cluster Distribution
              </h3>
              <Plot
                data={plotData}
                layout={{
                  font: { family: "Inter, sans-serif", color: "#1f2937" },
                  xaxis: {
                    title: "Cluster ID",
                    gridcolor: "#e5e7eb",
                    titlefont: { size: 14 },
                  },
                  yaxis: {
                    title: "Patent Count",
                    gridcolor: "#e5e7eb",
                    titlefont: { size: 14 },
                  },
                  hovermode: "closest",
                  showlegend: false,
                  plot_bgcolor: "#ffffff",
                  paper_bgcolor: "#ffffff",
                  margin: { t: 30, b: 80, l: 60, r: 30 },
                  border: "1px solid #e5e7eb",
                }}
                style={{ width: "100%", height: "400px" }}
                config={{ responsive: true, displayModeBar: true }}
                onClick={(data) => {
                  const clusterId = data.points[0].x;
                  const cluster = clusters.find(
                    (c) => c.cluster_id === clusterId
                  );
                  setSelectedCluster(cluster);
                }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="col-lg-6 mb-4"
        >
          <div className="card shadow border-0 chart-card">
            <div className="card-body">
              <h3 className="card-title h5 fw-semibold mb-3">Cluster Sizes</h3>
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: "Cluster Sizes",
                      font: { family: "Inter", size: 18, weight: "600" },
                      color: "#1f2937",
                    },
                    tooltip: {
                      backgroundColor: "#1f2937",
                      titleFont: { family: "Inter", size: 14 },
                      bodyFont: { family: "Inter", size: 12 },
                      padding: 12,
                      cornerRadius: 6,
                    },
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "#e5e7eb" },
                      title: {
                        display: true,
                        text: "Patent Count",
                        font: { family: "Inter", size: 14 },
                        color: "#1f2937",
                      },
                    },
                    x: {
                      grid: { display: false },
                      title: {
                        display: true,
                        text: "Cluster",
                        font: { family: "Inter", size: 14 },
                        color: "#1f2937",
                      },
                    },
                  },
                  animation: {
                    duration: 1200,
                    easing: "easeOutQuart",
                  },
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mb-5"
      >
        <div className="card shadow border-0 chart-card">
          <div className="card-body">
            <h3 className="card-title h5 fw-semibold mb-3">
              Patent Trends Over Time
            </h3>
            <Line
              data={timeTrendData}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: "Patent Trends Over Time",
                    font: { family: "Inter", size: 18, weight: "600" },
                    color: "#1f2937",
                  },
                  tooltip: {
                    backgroundColor: "#1f2937",
                    titleFont: { family: "Inter", size: 14 },
                    bodyFont: { family: "Inter", size: 12 },
                    padding: 12,
                    cornerRadius: 6,
                  },
                  legend: {
                    position: "top",
                    labels: {
                      font: { family: "Inter", size: 12 },
                      color: "#1f2937",
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: "#e5e7eb" },
                    title: {
                      display: true,
                      text: "Patent Count",
                      font: { family: "Inter", size: 14 },
                      color: "#1f2937",
                    },
                  },
                  x: {
                    grid: { display: false },
                    title: {
                      display: true,
                      text: "Year",
                      font: { family: "Inter", size: 14 },
                      color: "#1f2937",
                    },
                  },
                },
                animation: {
                  duration: 1200,
                  easing: "easeOutQuart",
                },
              }}
            />
          </div>
        </div>
      </motion.div>

      {selectedCluster && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="card shadow border-0"
        >
          <div className="card-body">
            <h2 className="card-title h4 fw-bold mb-3">
              {selectedCluster.name}
            </h2>
            <p className="card-text text-secondary mb-3">
              Patents: {selectedCluster.count}
            </p>
            <div className="mb-4">
              <h3 className="h5 fw-semibold mb-2">Keywords</h3>
              <div className="d-flex flex-wrap gap-2">
                {selectedCluster.keywords.map((k, i) => (
                  <motion.span
                    key={k}
                    className="badge cluster-badge"
                    whileHover={{ scale: 1.1 }}
                    style={{ backgroundColor: colors[i % colors.length] }}
                  >
                    {k}
                  </motion.span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="h5 fw-semibold mb-2">Patents</h3>
              <ul className="list-group list-group-flush">
                {selectedCluster.patents.slice(0, 5).map((p) => (
                  <motion.li
                    key={p.No}
                    className="list-group-item border-0 py-3"
                    whileHover={{ backgroundColor: "#f3f4f6" }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={`/patent/${p.No}`}
                      className="h6 mb-1 text-primary text-decoration-none fw-medium"
                    >
                      {p.Title}
                    </a>
                    <p className="mb-0 small text-secondary">
                      {p.Applicants.substring(0, 150)}...
                    </p>
                  </motion.li>
                ))}
              </ul>
              {selectedCluster.patents.length > 5 && (
                <a
                  href={`/cluster/${selectedCluster.cluster_id}`}
                  className="text-primary fw-medium text-decoration-none"
                >
                  View More ({selectedCluster.patents.length - 5} more)
                </a>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ClusterExplorer;
