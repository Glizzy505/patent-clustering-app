import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function UploadAbstract() {
  const [abstract, setAbstract] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef(null);

  const mockPredictCluster = async (inputAbstract) => {
    try {
      const response = await fetch("/patents_output.json");
      if (!response.ok) throw new Error("Failed to load patent data");
      const patents = await response.json();

      const stopWords = ["this", "for", "with", "and", "the", "in", "a"];
      const words = inputAbstract
        .toLowerCase()
        .split(/\W+/)
        .filter((word) => word.length > 3 && !stopWords.includes(word));
      const keywords = [...new Set(words)].slice(0, 5);

      const similarityVector = Array(5)
        .fill(0)
        .map(() => Math.random());

      const cosineSimilarity = (vec1, vec2) => {
        const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
        const magnitude1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
        const magnitude2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));
        return dotProduct / (magnitude1 * magnitude2) || 0;
      };

      const similarities = patents.map((p) => ({
        cluster: p.cluster,
        cluster_id: p.cluster_id,
        similarity: cosineSimilarity(
          similarityVector,
          p.similarity_vector || Array(5).fill(0)
        ),
      }));
      const bestMatch = similarities.reduce((a, b) =>
        a.similarity > b.similarity ? a : b
      );

      const similarPatents = patents
        .filter((p) => p.cluster_id === bestMatch.cluster_id)
        .map((p) => ({
          ...p,
          similarity: cosineSimilarity(
            similarityVector,
            p.similarity_vector || Array(5).fill(0)
          ),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);

      return {
        cluster: bestMatch.cluster,
        cluster_id: bestMatch.cluster_id,
        keywords,
        similarPatents,
      };
    } catch (err) {
      throw new Error("Prediction failed: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      let inputAbstract = abstract;

      if (file) {
        const text = await file.text();
        if (!text.trim()) throw new Error("Uploaded file is empty");
        inputAbstract = text;
      }

      if (!inputAbstract.trim()) {
        throw new Error("Please enter or upload an abstract");
      }

      const prediction = await mockPredictCluster(inputAbstract);
      setResult(prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/plain") {
      setFile(selectedFile);
      setAbstract("");
      setError(null);
    } else {
      setError("Please upload a .txt file");
      setFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("border-primary", "border-2");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("border-primary", "border-2");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("border-primary", "border-2");
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/plain") {
      setFile(droppedFile);
      setAbstract("");
      setError(null);
    } else {
      setError("Please drop a .txt file");
      setFile(null);
    }
  };

  const handleAbstractChange = (e) => {
    const value = e.target.value;
    setAbstract(value);
    setCharCount(value.length);
    if (file) {
      setFile(null);
    }
  };

  return (
    <div className="container py-5">
      <motion.h1
        className="h2 fw-bold text-center mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Upload Patent Abstract
      </motion.h1>
      <motion.div
        className="card shadow border-0 filter-card mb-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{ maxWidth: "800px", margin: "0 auto" }}
      >
        <div className="card-body">
          <h3 className="h4 fw-semibold mb-3">Submit Abstract</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="abstract" className="form-label fw-medium">
                Enter Abstract
              </label>
              <textarea
                id="abstract"
                className={`form-control ${
                  charCount > 1000 ? "is-invalid" : ""
                } custom-tooltip`}
                rows="5"
                value={abstract}
                onChange={handleAbstractChange}
                placeholder="Paste or type the patent abstract here..."
                data-bs-toggle="tooltip"
                data-bs-placement="top"
                title="Enter a patent abstract (max 1000 characters)"
                disabled={file !== null}
              />
              <div className="form-text mt-2">
                <span
                  className={charCount > 1000 ? "text-danger" : "text-primary"}
                >
                  {charCount}/1000 characters
                </span>
                {charCount > 1000 && (
                  <span className="text-danger ms-2"> (Too long)</span>
                )}
              </div>
            </div>
            <div
              className="mb-4 upload-area rounded p-4 text-center custom-tooltip"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: "pointer" }}
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Drag and drop or click to upload a .txt file"
            >
              <FontAwesomeIcon
                icon={faUpload}
                className="text-primary mb-2"
                size="2x"
              />
              <p className="mb-0 text-secondary">
                {file
                  ? file.name
                  : "Drag & Drop or Click to Upload Abstract (.txt)"}
              </p>
              <input
                id="file"
                type="file"
                className="d-none"
                accept=".txt"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
            <motion.button
              type="submit"
              className="btn btn-primary w-100 custom-tooltip"
              disabled={loading || (charCount > 1000 && !file)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Submit to predict the cluster"
            >
              {loading ? (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : null}
              {loading ? "Predicting..." : "Predict Cluster"}
            </motion.button>
          </form>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="alert alert-danger mt-4"
              role="alert"
            >
              {error}
            </motion.div>
          )}
        </div>
      </motion.div>
      {result && (
        <motion.div
          className="card shadow border-0 chart-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{ maxWidth: "800px", margin: "0 auto" }}
        >
          <div className="card-body">
            <h3 className="h4 fw-semibold mb-3">Prediction Result</h3>
            <p className="text-secondary">
              <strong>Predicted Cluster:</strong> {result.cluster} (ID:{" "}
              {result.cluster_id})
            </p>
            <div className="mb-4">
              <strong>Keywords:</strong>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {result.keywords.map((k, i) => (
                  <motion.span
                    key={k}
                    className="badge"
                    whileHover={{ scale: 1.1 }}
                    style={{
                      backgroundColor: [
                        "#2563eb",
                        "#3b82f6",
                        "#60a5fa",
                        "#93c5fd",
                        "#dbeafe",
                      ][i % 5],
                      color: "#ffffff",
                    }}
                  >
                    {k}
                  </motion.span>
                ))}
              </div>
            </div>
            <div>
              <strong>Similar Patents:</strong>
              <div className="row g-3 mt-2">
                {result.similarPatents.map((p) => (
                  <motion.div
                    key={p.id}
                    className="col-12 patent-card"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="card shadow-sm border-0">
                      <div className="card-body">
                        <h6 className="mb-1">
                          <a
                            href={`/patent/${p.id}`}
                            className="text-primary text-decoration-none fw-medium"
                          >
                            {p.title}
                          </a>
                        </h6>
                        <p className="mb-0 small text-secondary">
                          {p.abstract.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/clusters"
                className="btn btn-outline-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Cluster
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default UploadAbstract;
