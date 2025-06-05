import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Dropdown } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTh, faList } from "@fortawesome/free-solid-svg-icons";
import { updatedData } from "../helpers/helper";

function PatentList() {
  const [patents, setPatents] = useState([]);
  const [filteredPatents, setFilteredPatents] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [years, setYears] = useState([]);
  const [countries, setCountries] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [filters, setFilters] = useState({
    cluster: "",
    year: "",
    country: "",
    keyword: "",
    search: "",
  });
  const [view, setView] = useState("grid");
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colors = [
    "#2563eb", // Primary blue
    "#3b82f6",
    "#60a5fa",
    "#93c5fd",
    "#1d4ed8",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/patents_output.json");
        if (!response.ok) throw new Error("Failed to load patent data");
        const patents = await response.json();
        const data = updatedData(patents);

        const uniqueClusters = [...new Set(data.map((p) => p.cluster))].sort();
        const uniqueYears = [...new Set(data.map((p) => p.year))].sort();
        const uniqueCountries = [...new Set(data.map((p) => p.country))].sort();
        const uniqueKeywords = [
          ...new Set(data.flatMap((p) => p.keywords || [])),
        ].sort();

        setPatents(data);
        setFilteredPatents(data);
        setClusters(uniqueClusters);
        setYears(uniqueYears);
        setCountries(uniqueCountries);
        setKeywords(uniqueKeywords);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const filtered = patents.filter((p) => {
      return (
        (!filters.cluster || p.cluster === filters.cluster) &&
        (!filters.year || p.year.toString() === filters.year) &&
        (!filters.country || p.country === filters.country) &&
        (!filters.keyword || (p.keywords || []).includes(filters.keyword)) &&
        (!filters.search ||
          (p.Title || "")
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          (p.Applicants || "")
            .toLowerCase()
            .includes(filters.search.toLowerCase()))
      );
    });
    setFilteredPatents(filtered);
  }, [filters, patents]);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const cosineSimilarity = (vec1, vec2) => {
    const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));
    return dotProduct / (magnitude1 * magnitude2) || 0;
  };

  const getSimilarPatents = (patent) => {
    return patents
      .filter((p) => p.No !== patent.No)
      .map((p) => ({
        ...p,
        similarity: cosineSimilarity(
          patent.similarity_vector || Array(5).fill(0),
          p.similarity_vector || Array(5).fill(0)
        ),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  };

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
        <p className="mt-2 fw-medium">Loading Patents...</p>
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
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Patent List
      </motion.h1>
      <motion.div
        className="card shadow border-0 filter-card mb-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="card-body">
          <h3 className="h5 fw-semibold mb-3">Filter Patents</h3>
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-primary"
                  id="dropdown-cluster"
                  className="w-100 text-start fw-medium"
                >
                  {filters.cluster || "All Clusters"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  <Dropdown.Item
                    onClick={() => handleFilterChange("cluster", "")}
                  >
                    All Clusters
                  </Dropdown.Item>
                  {clusters.map((c) => (
                    <Dropdown.Item
                      key={c}
                      onClick={() => handleFilterChange("cluster", c)}
                    >
                      {c}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="col-md-3">
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-primary"
                  id="dropdown-year"
                  className="w-100 text-start fw-medium"
                >
                  {filters.year || "All Years"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  <Dropdown.Item onClick={() => handleFilterChange("year", "")}>
                    All Years
                  </Dropdown.Item>
                  {years.map((y) => (
                    <Dropdown.Item
                      key={y}
                      onClick={() => handleFilterChange("year", y)}
                    >
                      {y}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="col-md-3">
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-primary"
                  id="dropdown-country"
                  className="w-100 text-start fw-medium"
                >
                  {filters.country || "All Countries"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  <Dropdown.Item
                    onClick={() => handleFilterChange("country", "")}
                  >
                    All Countries
                  </Dropdown.Item>
                  {countries.map((c) => (
                    <Dropdown.Item
                      key={c}
                      onClick={() => handleFilterChange("country", c)}
                    >
                      {c}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="col-md-3">
              <Dropdown>
                <Dropdown.Toggle
                  variant="outline-primary"
                  id="dropdown-keyword"
                  className="w-100 text-start fw-medium"
                >
                  {filters.keyword || "All Keywords"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  <Dropdown.Item
                    onClick={() => handleFilterChange("keyword", "")}
                  >
                    All Keywords
                  </Dropdown.Item>
                  {keywords.map((k) => (
                    <Dropdown.Item
                      key={k}
                      onClick={() => handleFilterChange("keyword", k)}
                    >
                      {k}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
          <div className="d-flex gap-3 align-items-center">
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={(e) =>
                handleFilterChange(e.target.name, e.target.value)
              }
              placeholder="Search title or abstract..."
              className="form-control flex-grow-1"
              title="Search patents by title or abstract"
            />
            <motion.button
              onClick={() => setView(view === "grid" ? "list" : "grid")}
              className="btn btn-outline-primary d-flex align-items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Toggle between grid and list view"
            >
              <FontAwesomeIcon icon={view === "grid" ? faList : faTh} />
              {view === "grid" ? "List View" : "Grid View"}
            </motion.button>
          </div>
        </div>
      </motion.div>
      <motion.div
        className={view === "grid" ? "row g-4" : "d-flex flex-column gap-3"}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {filteredPatents.length === 0 ? (
          <motion.p
            variants={itemVariants}
            className="text-center text-secondary fw-medium"
          >
            No patents match the selected filters.
          </motion.p>
        ) : (
          filteredPatents.map((p) => (
            <div
              key={p.No}
              className={view === "grid" ? "col-md-4" : "card patent-card"}
              onClick={() => setSelectedPatent(p)}
            >
              <motion.div
                className="card h-100 shadow border patent-card"
                variants={itemVariants}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="card-body">
                  <a
                    href={`/patent/${p.No}`}
                    className="card-title h5 fw-semibold text-primary text-decoration-none mb-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.Title || "Untitled"}
                  </a>
                  <p className="card-text text-secondary mb-2">
                    {(p.Applicants || "").substring(0, 100)}...
                  </p>
                  <p className="card-text small text-secondary">
                    Cluster: {p.cluster} | Year: {p.year} | Country:{" "}
                    {p.country || "N/A"}
                  </p>
                </div>
              </motion.div>
            </div>
          ))
        )}
      </motion.div>
      {selectedPatent && (
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
                  {selectedPatent.Title || "Untitled"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedPatent(null)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-secondary">
                  {selectedPatent.abstract || "No abstract available"}
                </p>
                <p className="small text-secondary">
                  ID: {selectedPatent.id} | Cluster: {selectedPatent.cluster} |
                  Year: {selectedPatent.year} | Country:{" "}
                  {selectedPatent.country || "N/A"}
                </p>
                <div className="mb-4">
                  <h6 className="fw-semibold">Keywords</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {(selectedPatent.keywords || []).map((k, i) => (
                      <motion.span
                        key={k}
                        className="badge cluster-badge"
                        style={{ background: colors[i % colors.length] }}
                        whileHover={{ scale: 1.1 }}
                        title={`Keyword: ${k}`}
                      >
                        {k}
                      </motion.span>
                    ))}
                  </div>
                </div>
                <div>
                  <h6 className="fw-semibold mb-3">Similar Patents</h6>
                  <div className="card shadow border-0">
                    <div className="card-body">
                      {getSimilarPatents(selectedPatent).map((p) => (
                        <motion.div
                          key={p.No}
                          className="py-2 border-bottom"
                          whileHover={{ backgroundColor: "#f3f4f6" }}
                          transition={{ duration: 0.2 }}
                        >
                          <a
                            href={`/patent/${p.No}`}
                            className="h6 mb-1 text-primary text-decoration-none fw-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {p.Title || "Untitled"}
                          </a>
                          <p className="mb-0 small text-secondary">
                            {(p.Title || "").substring(0, 100)}...
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <motion.button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setSelectedPatent(null)}
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

export default PatentList;
