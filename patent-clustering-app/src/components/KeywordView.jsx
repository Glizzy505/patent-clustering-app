import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Dropdown } from "react-bootstrap";
import { updatedData } from "../helpers/helper";

function KeywordView() {
  const [patents, setPatents] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/patents_output.json");
        if (!response.ok) throw new Error("Failed to load patent data");
        const patents = await response.json();
        const data = updatedData(patents);

        const uniqueClusters = [...new Set(data.map((p) => p.cluster))].sort();
        setPatents(data);
        setClusters(uniqueClusters);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!patents.length || !canvasRef.current || !window.WordCloud) {
      console.log("WordCloud not available:", window.WordCloud);
      return;
    }

    const updateCanvasSize = () => {
      const container = containerRef.current;
      if (container) {
        const width = container.offsetWidth;
        canvasRef.current.width = width;
        canvasRef.current.height = Math.max(width * 0.5, 300);
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const keywordCounts = {};
    const filteredPatents = selectedCluster
      ? patents.filter((p) => p.cluster === selectedCluster)
      : patents;

    filteredPatents.forEach((p) =>
      p.keywords.forEach((k) => {
        keywordCounts[k] = (keywordCounts[k] || 0) + 1;
      })
    );

    const wordList = Object.entries(keywordCounts).map(([word, count]) => [
      word,
      count * 10,
    ]);

    window.WordCloud(canvasRef.current, {
      list: wordList,
      gridSize: 8,
      weightFactor: 10,
      fontFamily: "Inter, sans-serif",
      color: (word, weight) => {
        const maxWeight = Math.max(...wordList.map((w) => w[1]));
        if (weight > maxWeight * 0.66) return "#2563eb"; // High frequency: Blue
        if (weight > maxWeight * 0.33) return "#6d28d9"; // Medium frequency: Purple
        return "#6b7280"; // Low frequency: Gray
      },
      backgroundColor: "#ffffff",
      rotateRatio: 0.5,
      rotationSteps: 2,
      drawOutOfBound: false,
      click: (item) => {
        setSelectedKeyword({
          word: item[0],
          weight: item[1],
          patents: filteredPatents.filter((p) => p.keywords.includes(item[0])),
        });
      },
      hover: (item) => {
        canvasRef.current.style.cursor = item ? "pointer" : "default";
      },
    });

    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [patents, selectedCluster]);

  if (loading) {
    return (
      <motion.div
        className="text-center py-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 fw-medium">Loading Keywords...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="text-center py-5 text-danger fw-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Error: {error}
      </motion.div>
    );
  }

  return (
    <div className="container py-5">
      <motion.h1
        className="h2 fw-bold text-center mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Keyword Explorer
      </motion.h1>
      <motion.div
        className="card shadow border-0 filter-card mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="card-body">
          <h3 className="h5 fw-semibold mb-3">Filter by Cluster</h3>
          <Dropdown>
            <Dropdown.Toggle
              variant="outline-primary"
              id="dropdown-cluster"
              className="w-100 text-start fw-medium"
            >
              {selectedCluster || "All Clusters"}
            </Dropdown.Toggle>
            <Dropdown.Menu className="w-100">
              <Dropdown.Item onClick={() => setSelectedCluster("")}>
                All Clusters
              </Dropdown.Item>
              {clusters.map((c) => (
                <Dropdown.Item key={c} onClick={() => setSelectedCluster(c)}>
                  {c}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </motion.div>
      <motion.div
        className="card shadow border-0 chart-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        ref={containerRef}
      >
        <div className="card-body">
          <h3 className="h5 fw-semibold mb-3">Keyword Cloud</h3>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "auto" }}
          ></canvas>
        </div>
      </motion.div>
      {selectedKeyword && (
        <motion.div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <motion.div
              className="modal-content shadow border-0"
              style={{ borderRadius: "12px" }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="modal-header border-0">
                <h5 className="modal-title h4 fw-bold">
                  Keyword: {selectedKeyword.word}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedKeyword(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-secondary mb-3">
                  Patent Count: {selectedKeyword.patents.length}
                </p>
                <h6 className="fw-semibold mb-2">Sample Patents</h6>
                <ul className="list-group list-group-flush">
                  {selectedKeyword.patents.slice(0, 5).map((p) => (
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
                        {p.Title || "Untitled"}
                      </a>
                      <p className="mb-0 small text-secondary">
                        {(p.Applicants || "").substring(0, 100)}...
                      </p>
                    </motion.li>
                  ))}
                </ul>
                {selectedKeyword.patents.length > 5 && (
                  <p className="text-secondary small">
                    And {selectedKeyword.patents.length - 5} more patents...
                  </p>
                )}
              </div>
              <div className="modal-footer border-0">
                <motion.button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setSelectedKeyword(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default KeywordView;
