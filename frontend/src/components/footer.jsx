import "./footer.css"
const Footer = () => {
  return (
    <footer className="messato-footer">
      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-col brand">
          <h2 className="logo">Messato</h2>
          <p className="tagline">
            Healthy • Homemade • On-Time Tiffin Services
          </p>
        </div>

        {/* COMPANY */}
        <div className="footer-col">
          <h4>Messato</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">How It Works</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Investor Relations</a></li>
          </ul>
        </div>

        {/* TIFFIN SERVICES */}
        <div className="footer-col">
          <h4>Tiffin Services</h4>
          <ul>
            <li><a href="#">Lunch Tiffins</a></li>
            <li><a href="#">Breakfast Tiffins</a></li>
            <li><a href="#">Dinner Tiffins</a></li>
            <li><a href="#">Monthly Plans</a></li>
            <li><a href="#">Diet & Jain Meals</a></li>
          </ul>
        </div>

        {/* FOR VENDORS */}
        <div className="footer-col">
          <h4>For Vendors</h4>
          <ul>
            <li><a href="#">Register Kitchen</a></li>
            <li><a href="#">Vendor Dashboard</a></li>
            <li><a href="#">Delivery Support</a></li>
            <li><a href="#">Partner Help</a></li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Terms & Conditions</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Refund Policy</a></li>
          </ul>
        </div>

        {/* SOCIAL */}
        <div className="footer-col social">
          <h4>Connect With Us</h4>

          <div className="social-icons">
            <a href="#">in</a>
            <a href="#">ig</a>
            <a href="#">fb</a>
            <a href="#">x</a>
          </div>

          <div className="store-buttons">
            <button>📱 App Store</button>
            <button>▶ Google Play</button>
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <p>
          © 2025 Messato Pvt. Ltd. All rights reserved. <br />
          By using Messato, you agree to our Terms, Privacy & Cookie Policies.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
