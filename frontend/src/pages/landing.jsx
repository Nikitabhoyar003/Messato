// import { useNavigate } from "react-router-dom";
import "./Landing.css";
import Navbar from "../components/navbar"
import foodVideo from "../assets/3578-172488167_small.mp4"
// import SearchBar from "../components/searchBar"
import Footer from "../components/footer";

const Landing = () => {
  // const navigate = useNavigate();

  return (
    <>
    <Navbar/>
    {/* <SearchBar/> */}
    <section className="video-hero">
      
      {/* Background Video */}
      <video
        className="bg-video"
        src={foodVideo}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="overlay"></div>
      <div className="hero-content">
        <h1>Messato</h1>
        <h2>India’s trusted home-style tiffin service</h2>
        <p>Fresh • Hygienic • Homemade food near you</p>


     </div>
    <div className="scroll-down">Scroll down ⌄</div>

    </section>
    <section className="how-it-works">
       <h2>How Messato Works</h2>

  <div className="steps">
    <div className="step-card">
      <span className="step-icon">📍</span>
      <h3>Search Nearby Vendors</h3>
      <p>Find verified tiffin vendors within 1 km of your location.</p>
    </div>

    <div className="step-card">
      <span className="step-icon">📝</span>
      <h3>Place Order in Advance</h3>
      <p>Order breakfast & lunch a day before, dinner before 2 PM.</p>
    </div>

    <div className="step-card">
      <span className="step-icon">🚚</span>
      <h3>Get Timely Delivery</h3>
      <p>Fresh food delivered at your selected time.</p>
    </div>

    <div className="step-card">
      <span className="step-icon">🔐</span>
      <h3>OTP Verification</h3>
      <p>Secure delivery using OTP confirmation.</p>
    </div>

    <div className="step-card">
      <span className="step-icon">♻️</span>
      <h3>Tiffin Pickup</h3>
      <p>Request vendor to collect tiffin after meal.</p>
    </div>
  </div>
  <p className="about-mission">
        Our mission is to provide affordable, healthy meals with reliability
        and transparency for everyone.
      </p>
      </section>
      <Footer/>
    </>
  );
};

export default Landing;
