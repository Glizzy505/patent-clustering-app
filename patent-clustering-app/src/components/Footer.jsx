import React from "react";

function Footer() {
  return (
    <footer className="full-width footer" data-testid="footer">
      <div className="container" data-testid="footer-container">
        <div className="row">
          <div className="col-md-4">
            <h5 data-testid="footer-about-h5">About Us</h5>
            <p data-testid="footer-about-p">
              Exploring patent clusters with cutting-edge visualizations.
            </p>
          </div>
          <div className="col-md-4">
            <h5 data-testid="footer-links-h5">Links</h5>
            <p data-testid="footer-links-p">
              <a href="/" className="hover-link" data-testid="footer-link-home">
                Home
              </a>
              <br />
              <a
                href="/about"
                className="hover-link"
                data-testid="footer-link-about"
              >
                About
              </a>
            </p>
          </div>
          <div className="col-md-4">
            <h5 data-testid="footer-contact-h5">Contact</h5>
            <p data-testid="footer-contact-p">
              <a
                href="mailto:info@example.com"
                className="hover-link"
                data-testid="footer-link-email"
              >
                info@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
