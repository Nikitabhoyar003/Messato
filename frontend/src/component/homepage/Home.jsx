import "./Home.css";

export default function Home() {
  return (
    <>
      {/* HERO SECTION */}
      <section className="home" id="home">
        <div className="home-content">
          <h1>
            Fresh <span>Home-Style</span> Tiffins
          </h1>

          <p>
            Healthy meals cooked by trusted home kitchens <br />
            Delivered fresh to your doorstep every day
          </p>

          <div className="hero-buttons">
            <button className="primary">Explore Tiffins</button>
            <button className="secondary">Become a Vendor</button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <h2>How Messato Works</h2>

        <div className="steps">
          <div className="step">
            <span>📍</span>
            <h3>Select Location</h3>
            <p>Find trusted tiffin services near you</p>
          </div>

          <div className="step">
            <span>🍱</span>
            <h3>Choose Tiffin</h3>
            <p>Select daily, weekly or monthly plans</p>
          </div>

          <div className="step">
            <span>🚚</span>
            <h3>Fast Delivery</h3>
            <p>Fresh food delivered on time</p>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="why-messato">
        <h2>Why Choose Messato?</h2>

        <div className="reasons">
          <div>✅ Hygienic Home Kitchens</div>
          <div>✅ Verified Vendors</div>
          <div>✅ Affordable Subscription Plans</div>
          <div>✅ Daily Fresh Cooking</div>
        </div>
      </section>

      {/* POPULAR PLANS */}
      <section className="plans" id="plans">

        <h2>Popular Tiffin Plans</h2>

        <div className="plan-cards">
          <div className="plan">
            <h3>Daily Plan</h3>
            <p>₹120 / meal</p>
            <button>View Plan</button>
          </div>

          <div className="plan highlight">
            <h3>Weekly Plan</h3>
            <p>₹750 / week</p>
            <button>Most Popular</button>
          </div>

          <div className="plan">
            <h3>Monthly Plan</h3>
            <p>₹2800 / month</p>
            <button>View Plan</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Start Eating Healthy Today 🍽️</h2>
        <p>Join thousands of users enjoying home-style meals</p>
        <button>Get Started</button>
      </section>
    </>
  );
}
