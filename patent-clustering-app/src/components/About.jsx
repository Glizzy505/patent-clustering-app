import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faBrain,
  faLanguage,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="container py-5">
      <motion.h1
        className="h2 fw-bold text-center mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        About the Project
      </motion.h1>

      <motion.div
        className="card shadow border-0 mb-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="card-body">
          <h3 className="h4 fw-semibold mb-3">Project Overview</h3>
          <motion.p className="text-secondary mb-4" variants={itemVariants}>
            The{" "}
            <strong
              className="custom-tooltip"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="A tool for researchers and innovators"
            >
              Web Application for Patent Clustering & Exploration
            </strong>{" "}
            is designed to empower researchers and innovators by providing
            advanced tools to explore patent data through clustering and
            interactive visualizations.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link
              to="/clusters"
              className="btn btn-primary d-inline-flex align-items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Features
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="card shadow border-0 mb-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="card-body">
          <h3 className="h4 fw-semibold mb-3">How It Works</h3>
          <motion.p className="text-secondary mb-4" variants={itemVariants}>
            Our backend pipeline leverages a{" "}
            <span
              className="text-primary custom-tooltip"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="A neural network for unsupervised learning"
            >
              Deep Belief Network (DBN)
            </span>{" "}
            to cluster patents based on their abstracts and metadata.{" "}
            <span
              className="text-primary custom-tooltip"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Techniques for text analysis"
            >
              Natural Language Processing (NLP)
            </span>{" "}
            techniques extract keywords, while similarity vectors enable precise
            patent comparisons. The frontend, built with React and Plotly.js,
            delivers interactive visualizations and detailed patent insights.
          </motion.p>
        </div>
      </motion.div>

      <motion.div
        className="card shadow border-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="card-body">
          <h3 className="h4 fw-semibold mb-3">Methodology</h3>
          <div className="row g-4">
            <motion.div className="col-md-6" variants={itemVariants}>
              <div className="d-flex align-items-start gap-3">
                <FontAwesomeIcon
                  icon={faBook}
                  className="text-primary mt-1"
                  size="lg"
                />
                <div>
                  <h4 className="h6 fw-semibold mb-1">Data Ingestion</h4>
                  <p className="text-secondary small mb-0">
                    Patents are processed from a JSON file containing titles,
                    abstracts, and metadata.
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div className="col-md-6" variants={itemVariants}>
              <div className="d-flex align-items-start gap-3">
                <FontAwesomeIcon
                  icon={faLanguage}
                  className="text-primary mt-1"
                  size="lg"
                />
                <div>
                  <h4 className="h6 fw-semibold mb-1">NLP Processing</h4>
                  <p className="text-secondary small mb-0">
                    Keywords are extracted using advanced NLP models for
                    accurate analysis.
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div className="col-md-6" variants={itemVariants}>
              <div className="d-flex align-items-start gap-3">
                <FontAwesomeIcon
                  icon={faBrain}
                  className="text-primary mt-1"
                  size="lg"
                />
                <div>
                  <h4 className="h6 fw-semibold mb-1">Clustering</h4>
                  <p className="text-secondary small mb-0">
                    A DBN clusters patents into meaningful groups based on
                    abstract similarity.
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div className="col-md-6" variants={itemVariants}>
              <div className="d-flex align-items-start gap-3">
                <FontAwesomeIcon
                  icon={faChartLine}
                  className="text-primary mt-1"
                  size="lg"
                />
                <div>
                  <h4 className="h6 fw-semibold mb-1">Visualization</h4>
                  <p className="text-secondary small mb-0">
                    Interactive plots and lists enable users to explore clusters
                    and patents.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="card shadow border-0 mt-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: 1.0 }}
      >
        <div className="card-body">
          <h3 className="h4 fw-semibold mb-3">Future Plans</h3>
          <motion.p className="text-secondary mb-0" variants={itemVariants}>
            Future phases will introduce features like uploading patent
            abstracts for cluster prediction and enhanced search capabilities to
            further empower users.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}

export default About;
