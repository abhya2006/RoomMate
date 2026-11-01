import { useMemo, useRef, useState, useEffect, type FormEvent } from 'react';
import {
  ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Bath, BedDouble, Building2,
  Check, ChevronDown, Compass, Heart, House, KeyRound, LoaderCircle, LockKeyhole,
  Mail, MapPin, Menu, Search, ShieldCheck, SlidersHorizontal, Sparkles, Users, Wifi, X,
  Camera, Plus,
} from 'lucide-react';
import { api } from './lib/api';
import type { RoomMateUser } from './lib/api';
import { useAuth } from './context/AuthContext';

type StayType = 'Monthly stays' | 'Short stays';
type ModalMode = 'login' | 'register' | 'forgot' | null;
type Room = { id: number; title: string; area: string; detail: string; price: number; period: string; type: StayType; room: string; color: string; image: string; tag: string; rating: string };

const rooms: Room[] = [
  { id: 1, title: 'A sunny private room in a shared home', area: 'Kolar Road, Bhopal', detail: 'Furnished · Wi-Fi · Kitchen access', price: 7500, period: '/ month', type: 'Monthly stays', room: 'Private room', color: 'sand', image: 'photo-1522708323590-d24dbb6b0267', tag: 'Great for students', rating: '4.9' },
  { id: 2, title: 'A calm spot close to the city centre', area: 'MP Nagar, Bhopal', detail: 'Single room · Attached bath · Balcony', price: 850, period: '/ night', type: 'Short stays', room: 'Private room', color: 'sage', image: 'photo-1505693416388-ac5ce068fe85', tag: 'Move-in ready', rating: '4.8' },
  { id: 3, title: 'Bright room in a student-friendly flat', area: 'Hoshangabad Road, Bhopal', detail: 'Sharing · Furnished · Near bus route', price: 6000, period: '/ month', type: 'Monthly stays', room: 'Shared room', color: 'lilac', image: 'photo-1494526585095-c41746248156', tag: 'Popular area', rating: '4.9' },
  { id: 4, title: 'Minimal studio with a little balcony', area: 'Arera Colony, Bhopal', detail: 'Private studio · Kitchenette · Quiet lane', price: 11000, period: '/ month', type: 'Monthly stays', room: 'Studio', color: 'clay', image: 'photo-1600210492486-724fe5c67fb0', tag: 'A little extra space', rating: '4.7' },
  { id: 5, title: 'A cosy short stay for your next trip', area: 'Shamla Hills, Bhopal', detail: 'Entire place · Wi-Fi · City views', price: 1250, period: '/ night', type: 'Short stays', room: 'Entire place', color: 'blue', image: 'photo-1600607687939-ce8a6c25118c', tag: 'Weekend favourite', rating: '4.9' },
  { id: 6, title: 'Easygoing shared flat near campus', area: 'Raisen Road, Bhopal', detail: 'Shared flat · Laundry · Transit nearby', price: 5200, period: '/ month', type: 'Monthly stays', room: 'Shared room', color: 'peach', image: 'photo-1600566753086-00f18fb6b3ea', tag: 'Budget friendly', rating: '4.6' },
];

function Logo() { return <a className="logo" href="#home" aria-label="RoomMate home"><House className="logo-house" size={35}/><span><b>Room</b><strong>Mate</strong><small>Find · Stay · Co-live</small></span></a>; }

function Header({ openModal, onFindRoom, onAddRoom }: { openModal: (mode: ModalMode) => void; onFindRoom: () => void; onAddRoom: () => void }) {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="header"><div className="header-inner">
    <Logo />
    <nav className={menuOpen ? 'nav nav-open' : 'nav'}><a className="nav-active" href="#home" onClick={() => setMenuOpen(false)}>Home</a><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it Works</a><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a><a href="#safety" onClick={() => setMenuOpen(false)}>Safety & Trust</a><a href="#support" onClick={() => setMenuOpen(false)}>Support</a></nav>
    <div className="header-actions"><button className="host-link" type="button" onClick={onAddRoom}>＋ List Your Room</button>
      {!loading && (user ? <div className="profile-menu"><span className="avatar">{user.fullName?.charAt(0)?.toUpperCase() || 'U'}</span><span className="profile-name">{user.fullName?.split(' ')[0] || user.username}</span><button className="icon-button" aria-label="Log out" onClick={logout}><KeyRound size={16}/></button></div> : <><button className="login-link" onClick={() => openModal('login')}>♙ &nbsp;Login</button><button className="signup-button" onClick={() => openModal('register')}>Sign Up</button></>)}
      <button className="mobile-menu icon-button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </div>
  </div></header>;
}

function SearchPanel({ onSearch }: { onSearch: (query: string, budget: string, room: string) => void }) {
  const [stay, setStay] = useState<StayType>('Monthly stays');
  const [query, setQuery] = useState('Bhopal');
  const [budget, setBudget] = useState('Any budget');
  const [room, setRoom] = useState('Any room');
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [locationBusy, setLocationBusy] = useState(false);
  function useCurrentLocation() {
    if (!navigator.geolocation) { setLocationStatus('Location is not supported by this browser.'); return; }
    setLocationBusy(true); setLocationStatus('Requesting your location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setLocationStatus(`Location detected (${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}).`); setLocationBusy(false); },
      () => { setLocationStatus('Location permission was denied. Enter your city manually.'); setLocationBusy(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }
  return <div className="search-shell"><div className="search-tabs" role="tablist" aria-label="Stay type">
    {(['Monthly stays', 'Short stays'] as StayType[]).map((item) => <button key={item} type="button" role="tab" aria-selected={stay === item} className={stay === item ? 'search-tab selected' : 'search-tab'} onClick={() => { setStay(item); setBudget('Any budget'); }}>{item === 'Monthly stays' ? <House size={15}/> : <KeyRound size={15}/>} {item}</button>)}
  </div><form className="search-panel" onSubmit={(e) => { e.preventDefault(); onSearch(query, budget, room); }}>
    <label className={`search-field location-field ${locationOpen ? 'location-open' : ''}`} onMouseEnter={() => setLocationOpen(true)} onMouseLeave={() => setLocationOpen(false)}><button type="button" className="location-trigger" aria-label="Open map location picker" onClick={() => setLocationOpen((open) => !open)}><MapPin className="field-icon" size={19}/></button><span className="field-content"><small>WHERE</small><input aria-label="City or locality" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="City or locality"/></span>{locationOpen && <div className="location-picker" onMouseEnter={() => setLocationOpen(true)}><div className="location-map-preview"><MapPin size={24}/><span>Choose your location</span></div><label>Enter city or locality<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Bhopal, MP Nagar"/></label><button type="button" className="manual-location-button" onClick={() => { setLocationStatus('Manual location selected.'); setLocationOpen(false); }}>Use this location <Check size={15}/></button><button type="button" className="auto-location-button" disabled={locationBusy} onClick={useCurrentLocation}><Compass size={16}/>{locationBusy ? 'Detecting…' : 'Use my current location'}</button>{locationStatus && <small className="location-status">{locationStatus}</small>}</div>}</label>
    <label className="search-field"><span className="rupee-icon">₹</span><span className="field-content"><small>{stay === 'Monthly stays' ? 'MONTHLY BUDGET' : 'NIGHTLY BUDGET · FROM ₹200'}</small><select aria-label="Budget" value={budget} onChange={(e) => setBudget(e.target.value)}><option>Any budget</option>{stay === 'Monthly stays' ? <><option>Under ₹5,000</option><option>₹5,000 – ₹8,000</option><option>₹8,000 – ₹12,000</option><option>₹12,000+</option></> : <><option>₹200 – ₹500</option><option>₹500 – ₹1,000</option><option>₹1,000 – ₹2,000</option><option>₹2,000+</option></>}</select></span><ChevronDown size={14} className="select-chevron"/></label>
    <label className="search-field"><BedDouble className="field-icon" size={19}/><span className="field-content"><small>ROOM TYPE</small><select aria-label="Room type" value={room} onChange={(e) => setRoom(e.target.value)}><option>Any room</option><option>Private room</option><option>Shared room</option><option>Studio</option><option>Entire place</option></select></span><ChevronDown size={14} className="select-chevron"/></label>
    <button className="search-submit" type="submit"><Search size={17}/> Search homes</button>
  </form><div className="search-meta"><span>Looking for a fresh start?</span><a href="#neighbourhood">Explore popular areas <ArrowUpRight size={13}/></a></div>
  </div>;
}

function RoomCard({ room, saved, onSave }: { room: Room; saved: boolean; onSave: (id: number) => void }) {
  return <article className="room-card"><div className={`room-photo ${room.color}`} style={{ backgroundImage: `linear-gradient(180deg, rgba(20,30,24,.03), rgba(20,30,24,.08)), url(https://images.unsplash.com/${room.image}?auto=format&fit=crop&w=900&q=85)` }}>
    <span className="room-tag">{room.tag}</span><button className={saved ? 'save-button saved' : 'save-button'} type="button" aria-label={saved ? 'Remove saved home' : 'Save home'} onClick={() => onSave(room.id)}><Heart size={18} fill={saved ? 'currentColor' : 'none'}/></button><span className="photo-count">01 <i/> 04</span>
  </div><div className="room-info"><div className="room-location"><MapPin size={12}/>{room.area}<span className="rating">★ {room.rating}</span></div><h3>{room.title}</h3><p>{room.detail}</p><div className="room-bottom"><div className="room-price"><strong>₹{room.price.toLocaleString('en-IN')}</strong><span>{room.period}</span></div><span className="reviewed"><BadgeCheck size={14}/> Sample listing</span></div></div></article>;
}

function Listings({ filters, openModal }: { filters: { query: string; budget: string; room: string } | null; openModal: (mode: ModalMode) => void }) {
  const [saved, setSaved] = useState<number[]>([]);
  const visible = useMemo(() => rooms.filter((r) => {
    if (filters?.query && !`${r.area} ${r.title}`.toLowerCase().includes(filters.query.toLowerCase()) && !'bhopal'.includes(filters.query.toLowerCase())) return false;
    if (filters?.room && filters.room !== 'Any room' && r.room !== filters.room) return false;
    if (filters?.budget && filters.budget !== 'Any budget') {
      const amount = r.price; const b = filters.budget;
      if (b === '₹200 – ₹500' && (amount < 200 || amount > 500)) return false;
      if (b === '₹500 – ₹1,000' && (amount < 500 || amount > 1000)) return false;
      if (b === '₹1,000 – ₹2,000' && (amount < 1000 || amount > 2000)) return false;
      if (b === '₹2,000+' && amount < 2000) return false;
      if (b === 'Under ₹5,000' && amount >= 5000) return false;
      if (b === '₹5,000 – ₹8,000' && (amount < 5000 || amount > 8000)) return false;
      if (b === '₹8,000 – ₹12,000' && (amount < 8000 || amount > 12000)) return false;
      if (b === '₹12,000+' && amount < 12000) return false;
    }
    return true;
  }), [filters]);
  return <section className="listings section-container" id="explore"><div className="section-heading"><div><div className="eyebrow">A GOOD PLACE TO BEGIN</div><h2>Places you might like<span className="heading-period">.</span></h2><p>Thoughtful spaces for wherever life is taking you.</p></div><a className="view-all" href="#explore">Explore all homes <ArrowRight size={16}/></a></div>
    {filters && <div className="results-line"><span>{visible.length} places to explore</span><span>Filters applied <SlidersHorizontal size={13}/></span></div>}
    {visible.length ? <div className="room-grid">{visible.map((r) => <RoomCard key={r.id} room={r} saved={saved.includes(r.id)} onSave={(id) => setSaved((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])}/>)}</div> : <div className="empty-results"><Compass size={26}/><h3>No places match those filters yet</h3><p>Try a wider budget or another room type.</p><button className="text-button" onClick={() => window.location.hash = 'explore'}>Clear your search <ArrowRight size={14}/></button></div>}
    <p className="demo-disclaimer">Illustrative sample listings · Real listings and booking are not connected yet.</p>
  </section>;
}

function Neighbourhood() { return <section className="neighbourhood section-container" id="neighbourhood"><div className="neighbour-copy"><div className="eyebrow">GET TO KNOW THE NEIGHBOURHOOD</div><h2>Feel at home<br/>before you arrive<span>.</span></h2><p>A great place is about more than four walls. Explore the areas, find your everyday essentials, and picture your life here.</p><a className="text-link" href="#explore">Discover Bhopal <ArrowRight size={15}/></a><div className="area-chips"><span><Building2 size={13}/> Student-friendly</span><span><Users size={13}/> Shared living</span><span><Wifi size={13}/> Work-ready</span></div></div>
  <div className="map-illustration real-map"><iframe title="Bhopal neighbourhood map" src="https://www.openstreetmap.org/export/embed.html?bbox=77.3000%2C23.1800%2C77.5000%2C23.3200&layer=mapnik&marker=23.2599%2C77.4126" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/><a className="map-attribution" href="https://www.openstreetmap.org/?mlat=23.2599&mlon=77.4126#map=13/23.2599/77.4126" target="_blank" rel="noreferrer">View larger map</a></div>
 </section>; }

function FeatureStrip() { const items = [['♢','Lowest Price','Guaranteed'],['♢','Verified','Owners & Rooms'],['♧','Find','Roommate'],['▣','Flexible','Stay'],['♧','24×7','Support'],['▣','Secure','Payments'],['✧','Trust &','Safety']]; return <section className="feature-strip section-container">{items.map(([icon, title, sub]) => <div className="feature-item" key={title}><span>{icon}</span><b>{title}<small>{sub}</small></b></div>)}</section>; }

function HowItWorks() { const steps = [{icon:<Users/>, n:'1', title:'Create Your Account', desc:'Sign up with your student or professional details.'},{icon:<Search/>,n:'2',title:'Search or List',desc:'Find a room/roommate or add your own space.'},{icon:<Check/>,n:'3',title:'Verify & Connect',desc:'Book safely with verified owners and secure chat.'}]; return <section className="how-section" id="how-it-works"><div className="section-container"><div className="how-title"><h2>How Room<span>Mate</span> Works?</h2></div><div className="steps-grid">{steps.map((s) => <article className="step-card" key={s.n}><span className="step-number">{s.n}</span><div className="step-icon">{s.icon}</div><h3>{s.title}</h3><p>{s.desc}</p></article>)}</div></div></section>; }

function TrustPanel() { return <section className="trust-panel section-container" id="safety"><div><ShieldCheck size={25}/><h2>User Trust, Our Priority</h2></div><div className="trust-stats"><span>★ <b>4.8/5</b><small>Average User Rating<br/>(10K+ Reviews)</small></span><span><b>50K+</b><small>Verified Users</small></span><span><House size={27}/><b>25K+</b><small>Verified Listings</small></span></div></section>; }

function HostBanner({ onAddRoom }: { onAddRoom: () => void }) { return <section className="host-banner section-container" id="host"><div className="host-person">✦</div><div className="host-copy"><h2>List Your Room</h2><p>Reach thousands of verified students and professionals looking for a stay.</p></div><div className="host-benefits"><span>♢ Get More<br/><b>Visibility</b></span><span>♢ Verified<br/><b>Tenants</b></span><span>ϟ Quick &<br/><b>Secure Listing</b></span></div><button type="button" onClick={onAddRoom} className="host-cta">Add Your Room Now <ArrowRight size={16}/></button></section>; }

function Footer({ openModal }: { openModal: (mode: ModalMode) => void }) { return <footer className="footer"><div className="section-container footer-main"><div className="footer-brand"><Logo/><p>Helping new beginnings<br/>find a place.</p></div><div className="footer-column"><b>Explore</b><a href="#explore">Find a place</a><a href="#neighbourhood">Neighbourhoods</a><a href="#how-it-works">How it works</a></div><div className="footer-column"><b>RoomMate</b><a href="#host">List your space</a><button onClick={() => openModal('register')}>Create account</button><a href="mailto:hello@roommate.example">Contact</a></div><div className="footer-note"><span>MADE FOR YOUR NEXT CHAPTER</span><p>New city. New keys.<br/><em>Same feeling of home.</em></p><span>✳</span></div></div><div className="section-container footer-bottom"><span>© 2026 RoomMate. A place to land.</span><span>Made with care in India <span className="footer-heart">♥</span></span></div></footer>; }

function AuthModal({ mode, onClose, onModeChange }: { mode: ModalMode; onClose: () => void; onModeChange: (mode: ModalMode) => void }) {
  const { setSession } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationBusy, setVerificationBusy] = useState<'email' | 'phone' | null>(null);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [digiLockerStarted, setDigiLockerStarted] = useState(false);
  const [form, setForm] = useState({ identifier:'', password:'', username:'', email:'', fullName:'', phoneNumber:'', aadhaarNumber:'' });
  if (!mode) return null;
  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));
  async function sendOtp(kind: 'email' | 'phone') {
    const value = kind === 'email' ? form.email.trim() : form.phoneNumber.trim();
    if (!value) { setError(`Enter your ${kind === 'email' ? 'email address' : 'mobile number'} first.`); return; }
    setVerificationBusy(kind); setError('');
    try {
      if (kind === 'email') { setEmailOtpSent(true); await api.sendEmailOtp(value); }
      else { setPhoneOtpSent(true); await api.sendPhoneOtp(value); }
    } catch (err) { setError(err instanceof Error ? err.message : `Could not send ${kind} OTP.`); }
    finally { setVerificationBusy(null); }
  }
  async function verifyOtp(kind: 'email' | 'phone') {
    const value = kind === 'email' ? form.email.trim() : form.phoneNumber.trim();
    const otp = kind === 'email' ? emailOtp.trim() : phoneOtp.trim();
    if (!otp) { setError('Enter the OTP you received.'); return; }
    setVerificationBusy(kind); setError('');
    try {
      const result = kind === 'email' ? await api.verifyEmailOtp(value, otp) : await api.verifyPhoneOtp(value, otp);
      if (!result.verified) throw new Error(`${kind === 'email' ? 'Email' : 'Phone'} OTP is invalid or expired.`);
      if (kind === 'email') setEmailVerified(true); else setPhoneVerified(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'OTP verification failed.'); }
    finally { setVerificationBusy(null); }
  }
  async function verifyDigiLocker() {
    const token = localStorage.getItem('roommate_token');
    if (!token) { setError('DigiLocker verification starts after account creation. Please complete signup first, then verify from your dashboard.'); return; }
    setBusy(true); setError('');
    try {
      const result = await api.startDigiLocker(token);
      setDigiLockerStarted(true);
      window.location.assign(result.authorizationUrl);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not start DigiLocker verification.'); }
    finally { setBusy(false); }
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (mode === 'forgot') {
        await api.forgotPassword(form.email.trim());
        setError('If an account exists for this email, a reset link has been sent.');
      } else {
        if (mode === 'register' && (!emailVerified || !phoneVerified)) {
          throw new Error('Please verify both your email and phone number before creating your account.');
        }
        const result = mode === 'login'
          ? await api.login(form.identifier.trim(), form.password)
          : await api.register({ username: form.username.trim(), email: form.email.trim(), password: form.password, fullName: form.fullName.trim(), phoneNumber: form.phoneNumber.trim(), aadhaarNumber: form.aadhaarNumber.trim() });
        setSession(result.token, result.user); onClose();
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="modal-close" onClick={onClose} aria-label="Close"><X size={19}/></button><div className="modal-brand"><span className="logo-symbol">r</span></div><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h2 id="auth-title">{mode === 'login' ? 'Welcome back.' : mode === 'forgot' ? 'Reset your password.' : 'Make yourself at home.'}</h2><p className="modal-intro">{mode === 'login' ? 'Log in to pick up where you left off.' : mode === 'forgot' ? 'Enter your email and we will send reset instructions.' : 'Create an account to get started with RoomMate.'}</p>
    <form className="auth-form" onSubmit={submit}>
      {mode === 'forgot' ? <label>Email address<input type="email" autoComplete="email" required placeholder="you@example.com" value={form.email} onChange={(e) => update('email',e.target.value)}/></label> : mode === 'register' ? <>
        <label>Full name<input autoComplete="name" required minLength={2} maxLength={120} placeholder="Your full name" value={form.fullName} onChange={(e) => update('fullName',e.target.value)}/></label>
        <label>Username<input autoComplete="username" required minLength={3} maxLength={50} placeholder="Choose a username" value={form.username} onChange={(e) => update('username',e.target.value)}/></label>
        <label>Mobile number<div className="verification-input"><input inputMode="numeric" autoComplete="tel-national" required pattern="[6-9][0-9]{9}" maxLength={10} placeholder="10-digit number" value={form.phoneNumber} onChange={(e) => { setPhoneVerified(false); setPhoneOtpSent(false); update('phoneNumber',e.target.value.replace(/\D/g,'').slice(0,10)); }}/><button type="button" disabled={verificationBusy === 'phone' || phoneVerified} onClick={() => sendOtp('phone')}>{phoneVerified ? 'Verified' : verificationBusy === 'phone' ? 'Sending…' : phoneOtpSent ? 'Resend OTP' : 'Send OTP'}</button></div><div className="otp-row"><input className="otp-input" inputMode="numeric" maxLength={6} placeholder="Enter phone OTP here" value={phoneOtp} disabled={!phoneOtpSent || phoneVerified} onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g,'').slice(0,6))}/><button type="button" onClick={() => verifyOtp('phone')} disabled={!phoneOtpSent || verificationBusy === 'phone' || phoneVerified}>Verify OTP</button></div></label>
        <label>Email address<div className="verification-input"><input type="email" autoComplete="email" required placeholder="you@example.com" value={form.email} onChange={(e) => { setEmailVerified(false); setEmailOtpSent(false); update('email',e.target.value); }}/><button type="button" disabled={verificationBusy === 'email' || emailVerified} onClick={() => sendOtp('email')}>{emailVerified ? 'Verified' : verificationBusy === 'email' ? 'Sending…' : emailOtpSent ? 'Resend OTP' : 'Send OTP'}</button></div><div className="otp-row"><input className="otp-input" inputMode="numeric" maxLength={6} placeholder="Enter email OTP here" value={emailOtp} disabled={!emailOtpSent || emailVerified} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g,'').slice(0,6))}/><button type="button" onClick={() => verifyOtp('email')} disabled={!emailOtpSent || verificationBusy === 'email' || emailVerified}>Verify OTP</button></div></label>
        <label>Aadhaar number <span className="field-hint">12 digits · sent to your backend over the configured connection</span><input inputMode="numeric" required pattern="[0-9]{12}" maxLength={12} placeholder="XXXX XXXX XXXX" value={form.aadhaarNumber} onChange={(e) => update('aadhaarNumber',e.target.value.replace(/\D/g,'').slice(0,12))}/></label>
      </> : <label>Email or username<input autoComplete="username" required placeholder="Enter email or username" value={form.identifier} onChange={(e) => update('identifier',e.target.value)}/></label>}
      {mode !== 'forgot' && <label>Password<div className="password-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} maxLength={72} required placeholder="At least 8 characters" value={form.password} onChange={(e) => update('password',e.target.value)}/><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>}
      {error && <div className="form-error" role="alert">{error}</div>}
      {mode === 'register' && <><label className="digilocker-check"><input type="checkbox" checked={digiLockerStarted} onChange={verifyDigiLocker} disabled={busy || digiLockerStarted}/><span><strong>Verify with DigiLocker</strong><small>Click to securely verify your identity</small></span><ShieldCheck size={19}/></label><p className="verification-summary"><span className={emailVerified ? 'verified' : ''}>✉ Email {emailVerified ? 'verified' : 'not verified'}</span><span className={phoneVerified ? 'verified' : ''}>⌕ Phone {phoneVerified ? 'verified' : 'not verified'}</span><span className={digiLockerStarted ? 'verified' : ''}>♢ DigiLocker {digiLockerStarted ? 'started' : 'pending'}</span></p><p className="privacy-note"><LockKeyhole size={13}/> DigiLocker opens a secure government verification page. If you are new, complete signup first and verify from your dashboard.</p></>}
      <button className="auth-submit" disabled={busy} type="submit">{busy ? <LoaderCircle className="spin" size={17}/> : null}{busy ? 'Please wait…' : mode === 'login' ? 'Log in to RoomMate' : mode === 'forgot' ? 'Send reset link' : 'Create my account'}{!busy && <ArrowRight size={17}/>}</button>
    </form><div className="auth-switch">{mode === 'login' ? <><button className="forgot-link" onClick={() => { setError(''); onModeChange('forgot'); }}>Forgot password?</button><span>New around here?</span><button onClick={() => { setError(''); onModeChange('register'); }}>Create an account</button></> : mode === 'forgot' ? <><span>Remembered your password?</span><button onClick={() => { setError(''); onModeChange('login'); }}>Log in</button></> : <>Already have an account? <button onClick={() => { setError(''); onModeChange('login'); }}>Log in</button></>}</div>
  </section></div>;
}

function WelcomeStrip({ user }: { user: RoomMateUser }) { const { token, refreshUser } = useAuth(); const [message,setMessage] = useState(''); const [busy,setBusy] = useState(false); async function verify(){ if(!token)return;setBusy(true);setMessage('');try{const result=await api.startDigiLocker(token);window.location.assign(result.authorizationUrl);}catch(e){setMessage(e instanceof Error?e.message:'DigiLocker is not configured yet.');}finally{setBusy(false);}} return <div className="welcome-strip"><div><span className="welcome-kicker">GOOD TO HAVE YOU HERE</span><strong>Welcome, {user.fullName || user.username}.</strong><span className="welcome-sub">Your next chapter is looking good.</span></div><div className="verification-status"><span className={user.digilockerVerified?'status-ok':'status-pending'}><ShieldCheck size={15}/>{user.digilockerVerified?'Identity verified':'Identity pending'}</span><button disabled={busy || user.digilockerVerified} onClick={verify}>{busy?'Connecting…':user.digilockerVerified?'Verified':'Verify with DigiLocker'} <ArrowUpRight size={13}/></button>{message && <small>{message}</small>}</div></div>; }

type RoomForm = { title: string; location: string; capacity: string; occupancy: string; privacy: 'Private' | 'Shared'; stayType: 'Monthly' | 'One day / One night'; rent: string; description: string; image360: string };

function AddRoomForm({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<RoomForm>({ title:'', location:'', capacity:'1', occupancy:'', privacy:'Private', stayType:'Monthly', rent:'', description:'', image360:'' });
  const [saved, setSaved] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const update = (key: keyof RoomForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);
  function chooseImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => update('image360', String(reader.result));
    reader.readAsDataURL(file);
  }
  async function openCamera() {
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) { setCameraError('Camera access is not supported in this browser.'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream; setCameraOpen(true);
      requestAnimationFrame(() => { if (videoRef.current) videoRef.current.srcObject = stream; });
    } catch { setCameraError('Camera permission was denied. Allow camera access or upload an image instead.'); }
  }
  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null; setCameraOpen(false);
  }
  function captureImage() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) { setCameraError('Camera is still starting. Try again in a moment.'); return; }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    update('image360', canvas.toDataURL('image/jpeg', 0.9)); closeCamera();
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    localStorage.setItem('roommate_room_draft', JSON.stringify(form));
    setSaved(true);
  }
  return <><section className="workspace section-container"><button className="back-link" onClick={onBack}><ArrowRight size={16} className="back-arrow"/> Back to dashboard</button><div className="workspace-heading"><div><div className="eyebrow">LIST YOUR SPACE</div><h1>Add a room<span>.</span></h1><p>Share the details people need before choosing their next home.</p></div><div className="workspace-icon"><Plus size={27}/></div></div>
    <form className="room-form" onSubmit={submit}><div className="room-form-main"><label>Room title<input required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Bright room near the city centre"/></label><div className="form-row"><label>Location<input required value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Area, city"/></label><label>{form.stayType === 'Monthly' ? 'Monthly rent' : 'Price for one day / one night'}<input required type="number" min="0" value={form.rent} onChange={(e) => update('rent', e.target.value)} placeholder={form.stayType === 'Monthly' ? '₹ 8,000' : '₹ 500'}/></label></div><fieldset><legend>Stay duration</legend><div className="choice-row"><label className={form.stayType === 'Monthly' ? 'choice selected' : 'choice'}><input type="radio" name="stayType" checked={form.stayType === 'Monthly'} onChange={() => update('stayType','Monthly')}/> Monthly stay</label><label className={form.stayType === 'One day / One night' ? 'choice selected' : 'choice'}><input type="radio" name="stayType" checked={form.stayType === 'One day / One night'} onChange={() => update('stayType','One day / One night')}/> One day / one night</label></div></fieldset><div className="form-row"><label>How many people can stay?<input required type="number" min="1" value={form.capacity} onChange={(e) => update('capacity', e.target.value)}/></label><label>People currently staying<input type="number" min="0" value={form.occupancy} onChange={(e) => update('occupancy', e.target.value)} placeholder="0"/></label></div><fieldset><legend>Room type</legend><div className="choice-row"><label className={form.privacy === 'Private' ? 'choice selected' : 'choice'}><input type="radio" name="privacy" checked={form.privacy === 'Private'} onChange={() => update('privacy','Private')}/> Private room</label><label className={form.privacy === 'Shared' ? 'choice selected' : 'choice'}><input type="radio" name="privacy" checked={form.privacy === 'Shared'} onChange={() => update('privacy','Shared')}/> Shared room</label></div></fieldset><label>Description<textarea required rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Tell people about the room, amenities and house rules"/></label></div><div className="room-form-side">    <div className="upload-box"><Camera size={30}/><strong>360° room image</strong><span>Capture a live room image or upload a panoramic image.</span><div className="image-actions"><button type="button" className="camera-button" onClick={openCamera}><Camera size={16}/> Open camera</button><label className="upload-button">Upload image<input type="file" accept="image/*" onChange={(e) => chooseImage(e.target.files?.[0])}/></label></div>{form.image360 && <img src={form.image360} alt="Room preview"/>}{cameraError && <small className="camera-error">{cameraError}</small>}</div><button className="auth-submit" type="submit">{saved ? <Check size={17}/> : <Plus size={17}/>} {saved ? 'Room saved as draft' : 'Save room listing'}</button></div></form>
  </section>{cameraOpen && <div className="camera-modal" role="dialog" aria-modal="true" aria-label="Capture room image"><div className="camera-panel"><video ref={videoRef} autoPlay playsInline/><div className="camera-controls"><button type="button" onClick={captureImage}><Camera size={18}/> Capture image</button><button type="button" onClick={closeCamera}>Cancel</button></div></div></div>}</>;
}

function Dashboard({ user }: { user: RoomMateUser }) {
  const [view, setView] = useState<'home' | 'search' | 'add'>('home');
  const [filters, setFilters] = useState<{ query: string; budget: string; room: string } | null>(null);
  function search(query: string, budget: string, room: string) { setFilters({ query, budget, room }); setView('search'); }
  if (view === 'add') return <AddRoomForm onBack={() => setView('home')}/>;
  if (view === 'search') return <main className="workspace section-container"><button className="back-link" onClick={() => setView('home')}><ArrowRight size={16} className="back-arrow"/> Back to dashboard</button><div className="workspace-heading"><div><div className="eyebrow">FIND YOUR NEXT HOME</div><h1>Search rooms<span>.</span></h1><p>Filter available spaces by location, budget and room type.</p></div></div><SearchPanel onSearch={search}/><Listings filters={filters} openModal={() => undefined}/></main>;
  return <main className="dashboard section-container"><div className="dashboard-greeting"><div><div className="eyebrow">YOUR ROOMMATE SPACE</div><h1>Welcome, {user.fullName?.split(' ')[0] || user.username}<span>.</span></h1><p>What would you like to do today?</p></div><span className="dashboard-avatar">{user.fullName?.charAt(0)?.toUpperCase() || 'U'}</span></div><div className="dashboard-actions"><button className="dashboard-card search-card" onClick={() => setView('search')}><span className="dashboard-card-icon"><Search size={28}/></span><strong>Search room</strong><span>Find a private or shared room that fits your life.</span><b>Explore available rooms <ArrowRight size={18}/></b></button><button className="dashboard-card add-card" onClick={() => setView('add')}><span className="dashboard-card-icon"><Plus size={28}/></span><strong>Add room</strong><span>List your available room and help someone find home.</span><b>Create a room listing <ArrowRight size={18}/></b></button></div><WelcomeStrip user={user}/></main>;
}

export default function App() {
  const [modal, setModal] = useState<ModalMode>(null);
  const [filters, setFilters] = useState<{ query: string; budget: string; room: string } | null>(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const { user } = useAuth();
  function requireLogin(action: () => void) { if (user) action(); else setModal('login'); }
  function handleSearch(query: string,budget:string,room:string){ requireLogin(() => { setFilters({query,budget,room}); document.getElementById('explore')?.scrollIntoView({behavior:'smooth'}); }); }
  function openAddRoom() { requireLogin(() => setShowAddRoom(true)); }
  if (user) return <><Header openModal={setModal} onFindRoom={() => undefined} onAddRoom={openAddRoom}/><Dashboard user={user}/><Footer openModal={setModal}/></>;
  return <><Header openModal={setModal} onFindRoom={() => setModal('login')} onAddRoom={() => setModal('login')}/>{showAddRoom ? <AddRoomForm onBack={() => setShowAddRoom(false)}/> : <main id="home"><section className="hero section-container"><div className="hero-content"><div className="hero-badge">♢ India's Student Stay Platform</div><h1>Find a Place to Stay,<br/>List Your Space &<br/>Get the Right <em>Roommate</em></h1><p>Verified rooms, lowest prices, trusted owners and compatible roommates — built for students & young professionals.</p><div className="hero-actions"><button className="hero-primary" onClick={() => setModal('login')}><Search size={20}/> Find a Room <ArrowRight size={17}/></button><button className="hero-secondary" onClick={() => setModal('login')}><Plus size={20}/> List Your Room <ArrowRight size={17}/></button></div><div className="hero-trust"><span>✓ Lowest Price</span><span>✓ Verified Listings</span><span>✓ Secure & Safe</span><span>✓ Student Friendly</span></div></div><div className="hero-visual"><div className="hero-photo"/><div className="hero-photo-overlay"/><div className="hero-script">Stay<br/>Share<br/>Save<br/>Together ♡</div></div></section>
    <FeatureStrip/>
    <div className="section-container search-position"><SearchPanel onSearch={handleSearch}/></div>
    {user && <div className="section-container"><WelcomeStrip user={user}/></div>}
    <Listings filters={filters} openModal={setModal}/><Neighbourhood/><HowItWorks/><TrustPanel/><HostBanner onAddRoom={() => setModal('login')}/></main>}<Footer openModal={setModal}/><AuthModal mode={modal} onClose={() => setModal(null)} onModeChange={setModal}/></>;
}
