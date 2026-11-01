const stays = [
  {
    area: "Kolar Road, Bhopal",
    title: "Sunny private room in a shared home",
    detail: "Furnished · Wi-Fi · Kitchen access",
    price: "₹7,500",
    period: "/ month",
    kind: "Monthly stay",
    tone: "peach",
    initials: "KR",
  },
  {
    area: "MP Nagar, Bhopal",
    title: "A calm spot close to the city centre",
    detail: "Single room · Attached bath · Balcony",
    price: "₹850",
    period: "/ night",
    kind: "Short stay",
    tone: "sage",
    initials: "MP",
  },
  {
    area: "Hoshangabad Road, Bhopal",
    title: "Bright room in a student-friendly flat",
    detail: "Sharing · Furnished · Near bus route",
    price: "₹6,000",
    period: "/ month",
    kind: "Monthly stay",
    tone: "lavender",
    initials: "HR",
  },
];

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#home" aria-label="RoomMate home">
          <span className="brand-mark">r</span> roommate<span className="brand-dot">.</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a className="active" href="#explore">Find a place</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="top-actions">
          <a className="host-link" href="#host">List your space</a>
          <button className="login-button" type="button">Log in</button>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT CITY, MADE EASIER</div>
          <h1>A place to land.<br /><span>A city to call yours.</span></h1>
          <p>Find a room, a short stay, or a roommate who makes a new city feel a little more like home.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sun-shape" />
          <div className="art-window"><div /><div /><div /><div /></div>
          <div className="art-plant"><i /><i /><i /><b /></div>
          <div className="art-floor" />
          <div className="art-note"><span>✳</span><div><strong>New city?</strong><small>Start right here.</small></div></div>
        </div>
      </section>

      <section className="search-wrap" aria-label="Search places">
        <div className="stay-tabs" role="tablist" aria-label="Stay type">
          <button className="stay-tab selected" type="button" role="tab" aria-selected="true">Monthly stays</button>
          <button className="stay-tab" type="button" role="tab" aria-selected="false">Short stays</button>
        </div>
        <form className="search-panel" action="#explore">
          <label className="search-field city-field">
            <span className="field-icon">⌖</span>
            <span className="field-copy"><span className="field-label">CITY OR LOCALITY</span><input aria-label="City or locality" defaultValue="Bhopal" /></span>
          </label>
          <label className="search-field">
            <span className="field-icon">₹</span>
            <span className="field-copy"><span className="field-label">MONTHLY BUDGET</span><select aria-label="Monthly budget" defaultValue="₹5,000 – ₹8,000"><option>₹5,000 – ₹8,000</option><option>Under ₹5,000</option><option>₹8,000 – ₹12,000</option><option>₹12,000+</option></select></span>
          </label>
          <label className="search-field">
            <span className="field-icon">⌂</span>
            <span className="field-copy"><span className="field-label">ROOM TYPE</span><select aria-label="Room type" defaultValue="Any room"><option>Any room</option><option>Private room</option><option>Shared room</option><option>PG</option><option>Flat</option></select></span>
          </label>
          <button className="search-button" type="submit"><span>⌕</span> Search homes</button>
        </form>
        <p className="search-hint">New to Bhopal? <a href="#areas">Explore popular areas <span>↗</span></a></p>
      </section>

      <section className="listings section-shell" id="explore">
        <div className="section-heading">
          <div><div className="eyebrow muted">A GOOD PLACE TO BEGIN</div><h2>Places you might like</h2><p>Thoughtful spaces for wherever life is taking you.</p></div>
          <a className="view-all" href="#explore">Explore all homes <span>→</span></a>
        </div>
        <div className="listing-grid">
          {stays.map((stay, index) => (
            <article className="listing-card" key={stay.title}>
              <div className={`listing-art ${stay.tone}`}>
                <span className="stay-badge">{stay.kind}</span>
                <button className="save-button" type="button" aria-label={`Save ${stay.title}`}>♡</button>
                <div className="scene-window"><span /><span /><span /><span /></div>
                <div className="scene-sofa"><i /><i /><b /></div>
                <div className="scene-plant"><i /><i /><i /><b /></div>
                <span className="scene-code">{stay.initials}</span>
                <div className="photo-dots"><i className="on" /><i /><i /><i /></div>
              </div>
              <div className="listing-info">
                <div className="listing-location">{stay.area}</div>
                <h3>{stay.title}</h3>
                <p>{stay.detail}</p>
                <div className="listing-bottom"><div><strong>{stay.price}</strong><span>{stay.period}</span></div><span className="verified"><span>✓</span> Reviewed listing</span></div>
              </div>
            </article>
          ))}
        </div>
        <div className="demo-note">Preview only · Example listings shown to demonstrate the experience.</div>
      </section>

      <section className="areas section-shell" id="areas">
        <div className="area-copy"><div className="eyebrow muted">GET TO KNOW THE NEIGHBOURHOOD</div><h2>Feel at home<br />before you arrive.</h2><p>Explore a locality, get a feel for the daily commute, and find the kind of place that fits your routine.</p><a className="text-link" href="#explore">Discover Bhopal <span>→</span></a></div>
        <div className="area-map" aria-label="Illustration of neighbourhood places">
          <div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" />
          <span className="map-label label-home">⌂ <small>your place</small></span><span className="map-label label-market">✳ <small>market</small></span><span className="map-label label-campus">▤ <small>campus</small></span><span className="map-label label-transit">↗ <small>bus stop</small></span>
          <div className="map-pin"><span>r</span></div>
        </div>
      </section>

      <section className="host-banner" id="host">
        <div className="host-mark">✳</div><div><span className="eyebrow">HAVE A ROOM TO SHARE?</span><h2>Your extra space could mean<br />someone’s fresh start.</h2></div><a href="mailto:hello@roommate.example">Become a host <span>→</span></a>
      </section>

      <footer id="how-it-works"><a className="brand footer-brand" href="#home"><span className="brand-mark">r</span> roommate<span className="brand-dot">.</span></a><p>Helping new beginnings find a place.</p><span>Designed for the next move · India</span></footer>
    </main>
  );
}
