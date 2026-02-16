export default function Hero() {
  return (
    <section className="hero hidden">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="hero-pill">Trusted by 18,000+ students</p>
          <h1>Shop smarter. Sell faster. Right on campus.</h1>
          <p className="hero-subtitle">
            Discover verified student listings, affordable tech, and
            hostel-ready essentials across Rwanda. Buy now, or list your item in
            under two minutes.
          </p>
          <div className="hero-search">
            <input
              type="text"
              placeholder="Search for laptops, textbooks, furniture..."
              aria-label="Search products"
            />
            <button className="primary-button" type="button">
              Search
            </button>
          </div>
          <div className="hero-stats">
            <div>
              <div className="stat-number">4.9/5</div>
              <div className="stat-label">Average rating</div>
            </div>
            <div>
              <div className="stat-number">2,600+</div>
              <div className="stat-label">Active listings</div>
            </div>
            <div>
              <div className="stat-number">90 min</div>
              <div className="stat-label">Avg. sell time</div>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-header">
            <p>Today on UniMarket</p>
            <span className="chip">New</span>
          </div>
          <div className="hero-card-body">
            <div className="hero-item">
              <img
                src="https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=800&q=80"
                alt="Wireless headphones"
              />
              <div>
                <h3>Wireless Headphones</h3>
                <p>28,000 RWF • KG 15 mins ago</p>
              </div>
            </div>
            <div className="hero-item">
              <img
                src="https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&w=800&q=80"
                alt="Minimal study desk"
              />
              <div>
                <h3>Minimal Study Desk</h3>
                <p>85,000 RWF • UR Huye</p>
              </div>
            </div>
            <div className="hero-item">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
                alt="Coding books stack"
              />
              <div>
                <h3>Programming Books</h3>
                <p>12,000 RWF • CMU Africa</p>
              </div>
            </div>
          </div>
          <button className="secondary-button" type="button">
            Browse all listings
          </button>
        </div>
      </div>
    </section>
  );
}
