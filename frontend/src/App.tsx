import { useMemo, useRef, useState, useEffect, type FormEvent } from 'react';
import {
  ArrowDown, ArrowRight, ArrowUpRight, ArrowLeft, BadgeCheck, Bath, BedDouble, Building2,
  Check, ChevronDown, Compass, Heart, House, KeyRound, LoaderCircle, LockKeyhole,
  Mail, MapPin, Menu, Search, ShieldCheck, SlidersHorizontal, Sparkles, Users, Wifi, X, Phone, LifeBuoy,
  Camera, Plus, Sun, Moon, LogOut,
} from 'lucide-react';
import { api } from './lib/api';
import type { Booking as ApiBooking, RoomListing, RoomMateUser } from './lib/api';
import { useAuth } from './context/AuthContext';

type StayType = 'Monthly stays' | 'Short stays';
type ModalMode = 'login' | 'register' | 'forgot' | null;
type Room = { id: number; title: string; area: string; detail: string; price: number; period: string; type: StayType; room: string; color: string; image: string; imageUrls?: string[]; tag: string; rating: string; ownerName?: string; ownerContact?: string; latitude?: number; longitude?: number };
type Booking = Room & { bookingId: number; bookingOtp?: string; renterArrivedAt?: string; status: ApiBooking['status']; bookedAt: string; renterName?: string; renterPhone?: string };

const rooms: Room[] = [
  { id: 1, title: 'A sunny private room in a shared home', area: 'Kolar Road, Bhopal', detail: 'Furnished · Wi-Fi · Kitchen access', price: 7500, period: '/ month', type: 'Monthly stays', room: 'Private room', color: 'sand', image: 'photo-1522708323590-d24dbb6b0267', tag: 'Great for students', rating: '4.9' },
  { id: 2, title: 'A calm spot close to the city centre', area: 'MP Nagar, Bhopal', detail: 'Single room · Attached bath · Balcony', price: 850, period: '/ night', type: 'Short stays', room: 'Private room', color: 'sage', image: 'photo-1505693416388-ac5ce068fe85', tag: 'Move-in ready', rating: '4.8' },
  { id: 3, title: 'Bright room in a student-friendly flat', area: 'Hoshangabad Road, Bhopal', detail: 'Sharing · Furnished · Near bus route', price: 6000, period: '/ month', type: 'Monthly stays', room: 'Shared room', color: 'lilac', image: 'photo-1494526585095-c41746248156', tag: 'Popular area', rating: '4.9' },
  { id: 4, title: 'Minimal studio with a little balcony', area: 'Arera Colony, Bhopal', detail: 'Private studio · Kitchenette · Quiet lane', price: 11000, period: '/ month', type: 'Monthly stays', room: 'Studio', color: 'clay', image: 'photo-1600210492486-724fe5c67fb0', tag: 'A little extra space', rating: '4.7' },
  { id: 5, title: 'A cosy short stay for your next trip', area: 'Shamla Hills, Bhopal', detail: 'Entire place · Wi-Fi · City views', price: 1250, period: '/ night', type: 'Short stays', room: 'Entire place', color: 'blue', image: 'photo-1600607687939-ce8a6c25118c', tag: 'Weekend favourite', rating: '4.9' },
  { id: 6, title: 'Easygoing shared flat near campus', area: 'Raisen Road, Bhopal', detail: 'Shared flat · Laundry · Transit nearby', price: 5200, period: '/ month', type: 'Monthly stays', room: 'Shared room', color: 'peach', image: 'photo-1600566753086-00f18fb6b3ea', tag: 'Budget friendly', rating: '4.6' },
];

function Logo() { return <a className="logo" href="#home" aria-label="RoomMate home"><House className="logo-house" size={35}/><span><b>Room</b><strong>Mate</strong><small>Find · Stay · Co-live</small></span></a>; }

function Header({ openModal, onFindRoom, onAddRoom, theme, onToggleTheme }: { openModal: (mode: ModalMode) => void; onFindRoom: () => void; onAddRoom: () => void; theme: 'day' | 'night'; onToggleTheme: () => void }) {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!profileOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [profileOpen]);
  return <header className="header"><div className="header-inner">
    <Logo />
    <nav className={menuOpen ? 'nav nav-open' : 'nav'}><a className="nav-active" href="#home" onClick={() => setMenuOpen(false)}>Home</a><a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it Works</a><a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a><a href="#safety" onClick={() => setMenuOpen(false)}>Safety & Trust</a><a href="#support" onClick={() => setMenuOpen(false)}>Support</a></nav>
    <div className="header-actions"><button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'day' ? 'night' : 'day'} mode`} title={`Switch to ${theme === 'day' ? 'night' : 'day'} mode`}>{theme === 'day' ? <Moon size={16}/> : <Sun size={16}/>}<span>{theme === 'day' ? 'Night' : 'Day'}</span></button><button className="host-link" type="button" onClick={onAddRoom}>＋ List Your Room</button>
      {user ? <div className="profile-menu" ref={profileRef}>
        <button className="profile-trigger" type="button" aria-haspopup="menu" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)}>
          <span className="avatar">{user.fullName?.charAt(0)?.toUpperCase() || 'U'}</span><span className="profile-name">{user.fullName?.split(' ')[0] || user.username}</span><ChevronDown size={14}/>
        </button>
        {profileOpen && <div className="profile-dropdown" role="menu">
          <div className="profile-summary"><span className="avatar profile-avatar-large">{user.fullName?.charAt(0)?.toUpperCase() || 'U'}</span><div><strong>{user.fullName || user.username}</strong><span>{user.email}</span></div></div>
          <div className="profile-divider" />
          <button className="profile-logout" type="button" role="menuitem" onClick={() => { setProfileOpen(false); logout(); }}><LogOut size={16}/> Log out</button>
        </div>}
      </div> : <><button className="login-link" disabled={loading} aria-busy={loading} onClick={() => openModal('login')}>♙ &nbsp;Login</button><button className="signup-button" disabled={loading} aria-busy={loading} onClick={() => openModal('register')}>Sign Up</button></>}
      <button className="mobile-menu icon-button" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </div>
  </div></header>;
}

function SearchPanel({ onSearch, initialQuery = 'Bhopal' }: { onSearch: (query: string, budget: string, room: string, stay: StayType) => void; initialQuery?: string }) {
  const [stay, setStay] = useState<StayType>('Monthly stays');
  const [query, setQuery] = useState(initialQuery);
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
  </div><form className="search-panel" onSubmit={(e) => { e.preventDefault(); onSearch(query, budget, room, stay); }}>
    <label className={`search-field location-field ${locationOpen ? 'location-open' : ''}`} onMouseEnter={() => setLocationOpen(true)} onMouseLeave={() => setLocationOpen(false)}><button type="button" className="location-trigger" aria-label="Open map location picker" onClick={() => setLocationOpen((open) => !open)}><MapPin className="field-icon" size={19}/></button><span className="field-content"><small>WHERE</small><input aria-label="City or locality" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="City or locality"/></span>{locationOpen && <div className="location-picker" onMouseEnter={() => setLocationOpen(true)}><div className="location-map-preview"><MapPin size={24}/><span>Choose your location</span></div><label>Enter city or locality<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Bhopal, MP Nagar"/></label><button type="button" className="manual-location-button" onClick={() => { setLocationStatus('Manual location selected.'); setLocationOpen(false); }}>Use this location <Check size={15}/></button><button type="button" className="auto-location-button" disabled={locationBusy} onClick={useCurrentLocation}><Compass size={16}/>{locationBusy ? 'Detecting…' : 'Use my current location'}</button>{locationStatus && <small className="location-status">{locationStatus}</small>}</div>}</label>
    <label className="search-field"><span className="rupee-icon">₹</span><span className="field-content"><small>{stay === 'Monthly stays' ? 'MONTHLY BUDGET' : 'NIGHTLY BUDGET · FROM ₹200'}</small><select aria-label="Budget" value={budget} onChange={(e) => setBudget(e.target.value)}><option>Any budget</option>{stay === 'Monthly stays' ? <><option>Under ₹5,000</option><option>₹5,000 – ₹8,000</option><option>₹8,000 – ₹12,000</option><option>₹12,000+</option></> : <><option>₹200 – ₹500</option><option>₹500 – ₹1,000</option><option>₹1,000 – ₹2,000</option><option>₹2,000+</option></>}</select></span><ChevronDown size={14} className="select-chevron"/></label>
    <label className="search-field"><BedDouble className="field-icon" size={19}/><span className="field-content"><small>ROOM TYPE</small><select aria-label="Room type" value={room} onChange={(e) => setRoom(e.target.value)}><option>Any room</option><option>Private room</option><option>Shared room</option><option>Studio</option><option>Entire place</option></select></span><ChevronDown size={14} className="select-chevron"/></label>
    <button className="search-submit" type="submit"><Search size={17}/> Search homes</button>
  </form><div className="search-meta"><span>Looking for a fresh start?</span><a href="#neighbourhood">Explore popular areas <ArrowUpRight size={13}/></a></div>
  </div>;
}

function RoomCard({ room, saved, onSave, onBook }: { room: Room; saved: boolean; onSave: (id: number) => void; onBook: (room: Room) => void }) {
  const photos = room.imageUrls?.length ? room.imageUrls : [`https://images.unsplash.com/${room.image}?auto=format&fit=crop&w=900&q=85`];
  const [photoIndex, setPhotoIndex] = useState(0);
  return <article className="room-card"><div className={`room-photo ${room.color}`} style={{ backgroundImage: `linear-gradient(180deg, rgba(20,30,24,.03), rgba(20,30,24,.08)), url("${photos[photoIndex]}")` }}>
    <span className="room-tag">{room.tag}</span><button className={saved ? 'save-button saved' : 'save-button'} type="button" aria-label={saved ? 'Remove saved home' : 'Save home'} onClick={() => onSave(room.id)}><Heart size={18} fill={saved ? 'currentColor' : 'none'}/></button>{photos.length > 1 && <><button className="photo-nav photo-prev" type="button" aria-label="Previous room photo" onClick={() => setPhotoIndex((index) => (index - 1 + photos.length) % photos.length)}><ArrowLeft size={14}/></button><button className="photo-nav photo-next" type="button" aria-label="Next room photo" onClick={() => setPhotoIndex((index) => (index + 1) % photos.length)}><ArrowRight size={14}/></button><span className="photo-count">{String(photoIndex + 1).padStart(2, '0')} <i/> {String(photos.length).padStart(2, '0')}</span></>}
    </div><div className="room-info"><div className="room-location"><MapPin size={12}/>{room.area}<span className="rating">★ {room.rating}</span></div><h3>{room.title}</h3>{room.ownerName && <p className="room-owner-name">Owner: {room.ownerName}</p>}<p>{room.detail}</p><div className="room-bottom"><div className="room-price"><strong>₹{room.price.toLocaleString('en-IN')}</strong><span>{room.period}</span></div><button className="book-button" type="button" onClick={() => onBook(room)}>Book now <ArrowRight size={14}/></button></div></div></article>;
}

function BookingModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const mapUrl = booking.latitude && booking.longitude ? `https://www.google.com/maps/search/?api=1&query=${booking.latitude},${booking.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.area)}`;
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title"><button className="modal-close" type="button" onClick={onClose} aria-label="Close booking confirmation"><X size={18}/></button><div className="eyebrow">{booking.status === 'CONFIRMED' ? 'BOOKING CONFIRMED' : 'BOOKING REQUESTED'}</div><h2 id="booking-title">{booking.status === 'CONFIRMED' ? 'Your stay is confirmed' : 'Request sent to owner'}<span>.</span></h2><p className="booking-room-title">{booking.title}</p><div className="booking-details"><div><small>OWNER FULL NAME</small><strong>{booking.ownerName || 'RoomMate owner'}</strong></div><div><small>PHONE NUMBER</small><a className="booking-phone" href={`tel:${booking.ownerContact}`}>{booking.ownerContact || 'Contact unavailable'}</a></div><div><small>LOCATION</small><strong>{booking.area}</strong><a className="map-link" href={mapUrl} target="_blank" rel="noreferrer"><MapPin size={14}/> Open in Google Maps</a></div>{booking.bookingOtp && <div className="booking-otp"><small>BOOKING OTP</small><strong>{booking.bookingOtp}</strong></div>}</div><p className="booking-note">{booking.status === 'CONFIRMED' ? 'Owner verified your OTP. Payment gateway will be added later.' : booking.bookingOtp ? 'Share this OTP with the owner. It stays visible in My Bookings until the owner confirms.' : 'This older booking does not have a saved OTP. New booking requests show the OTP immediately.'}</p><button className="auth-submit" type="button" onClick={onClose}>Done</button></section></div>;
}

function BookingCard({ booking, onOpen }: { booking: Booking; onOpen: () => void }) {
  return <article className="booking-card"><div><div className="eyebrow">MY BOOKING · {booking.status}</div><h3>{booking.title}</h3><p><MapPin size={14}/> {booking.area}</p><strong>{booking.ownerName} · {booking.ownerContact}</strong>{booking.bookingOtp ? <div className="booking-card-otp"><small>BOOKING OTP · SHARE THIS WITH THE OWNER</small><strong>{booking.bookingOtp}</strong></div> : booking.status === 'REQUESTED' && <div className="booking-otp-pending"><small>BOOKING OTP</small><strong>Unavailable for this older booking. New bookings show the OTP here.</strong></div>}</div><button className="book-button" type="button" onClick={onOpen}>View booking <ArrowRight size={14}/></button></article>;
}
function Listings({ filters, onLoginRequired }: { filters: { query: string; budget: string; room: string; stay: StayType } | null; onLoginRequired?: () => void }) {
  const [saved, setSaved] = useState<number[]>([]);
  const [bookingRoom, setBookingRoom] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { token } = useAuth();
  const [nearby, setNearby] = useState<RoomListing[]>([]);
  const [locationError, setLocationError] = useState('');
  const [locationNotice, setLocationNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const cityCoordinates: Record<string, [number, number]> = {
    bhopal: [23.2599, 77.4126], delhi: [28.6139, 77.2090], noida: [28.5355, 77.3910],
    mumbai: [19.0760, 72.8777], bengaluru: [12.9716, 77.5946], bangalore: [12.9716, 77.5946],
    pune: [18.5204, 73.8567], indore: [22.7196, 75.8577], hyderabad: [17.3850, 78.4867],
  };
  useEffect(() => {
    if (token) void api.myBookings(token).then((items) => setBookings(items.map(toBooking))).catch(() => undefined);
  }, [token]);
  useEffect(() => {
    if (!token) return;
    const timer = window.setInterval(() => {
      void api.myBookings(token).then((items) => setBookings(items.map(toBooking))).catch(() => undefined);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [token]);
  useEffect(() => {
    if (!filters) return;
    let active = true;
    const city = Object.keys(cityCoordinates).find((name) => filters.query.toLowerCase().includes(name));
    const stayType = filters.stay === 'Monthly stays' ? 'Monthly' : 'One day / One night';
    setLoading(true); setLocationError(''); setLocationNotice('');
    const getGps = () => new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('GPS is not supported in this browser.')); return; }
      navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error('Allow location access or enter a supported city to find nearby rooms.')),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
    });
    void (async () => {
      try {
        const textMatches = filters.query.trim()
          ? await api.searchRooms(filters.query, stayType)
          : [];
        if (!active) return;
        if (textMatches.length) {
          setNearby(textMatches);
          setLocationNotice(`Showing ${textMatches.length} room${textMatches.length === 1 ? '' : 's'} matching ${filters.query}.`);
          return;
        }
        let latitude: number; let longitude: number;
        if (city) [latitude, longitude] = cityCoordinates[city];
        else { const position = await getGps(); latitude = position.coords.latitude; longitude = position.coords.longitude; }
        const nearbyRooms = await api.nearbyRooms(latitude, longitude, stayType);
        if (!active) return;
        setNearby(nearbyRooms);
        setLocationNotice(city ? `Showing rooms near ${city}.` : 'Showing rooms near your location.');
      } catch (error) {
        if (active) setLocationError(error instanceof Error ? error.message : 'Could not load rooms.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [filters]);
  const visible = useMemo(() => nearby.filter((r) => {
    const searchedCity = filters?.query && Object.keys(cityCoordinates).some((name) => filters.query.toLowerCase().includes(name));
    if (filters?.query && !searchedCity && !`${r.location} ${r.title}`.toLowerCase().includes(filters.query.toLowerCase())) return false;
    if (filters?.room && filters.room !== 'Any room' &&
      ((filters.room === 'Shared room' && r.privacy !== 'Shared') ||
        (filters.room === 'Private room' && r.privacy !== 'Private'))) return false;
    if (filters?.budget && filters.budget !== 'Any budget') {
      const amount = r.rent; const b = filters.budget;
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
  }).map((r) => ({
    id: r.id, title: r.title, area: r.location, detail: `${r.privacy} room · ${r.capacity} people · ${r.distanceKm?.toFixed(1) ?? '?'} km away`,
    price: r.rent, period: r.stayType === 'Monthly' ? '/ month' : '/ night', type: filters?.stay || 'Monthly stays',
    room: r.privacy === 'Shared' ? 'Shared room' : 'Private room', color: 'sage', image: 'photo-1522708323590-d24dbb6b0267',
    ownerName: r.ownerFullName, ownerContact: r.ownerPhoneNumber, latitude: r.latitude, longitude: r.longitude, imageUrls: r.imageUrls,
    tag: r.distanceKm !== undefined ? `${r.distanceKm.toFixed(1)} km away` : 'Nearby room', rating: 'New',
  } as Room)), [nearby, filters]);
  function toBooking(item: ApiBooking): Booking {
    return { id: item.roomId, title: item.roomTitle, area: item.location, detail: `${item.status === 'CONFIRMED' ? 'Confirmed' : 'Awaiting owner confirmation'} · ₹${item.rent}`, price: item.rent, period: '/ stay', type: 'Monthly stays', room: 'Room', color: 'sage', image: 'photo-1522708323590-d24dbb6b0267', tag: item.status, rating: 'New', ownerName: item.ownerFullName, ownerContact: item.ownerPhoneNumber, latitude: item.latitude, longitude: item.longitude, bookingId: item.id, bookingOtp: item.bookingOtp, renterArrivedAt: item.renterArrivedAt, status: item.status, bookedAt: item.createdAt, renterName: item.renterFullName, renterPhone: item.renterPhoneNumber };
  }
  async function bookRoom(room: Room) {
    if (!token) { onLoginRequired?.(); return; }
    try {
      const created = await api.createBooking(token, room.id);
      const booking = toBooking(created);
      setBookings((current) => [booking, ...current.filter((item) => item.bookingId !== booking.bookingId)]);
      setBookingRoom(booking);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Could not create booking.');
    }
  }
  return <section className="listings section-container" id="explore">  {bookings.length > 0 && <div className="my-bookings"><div className="section-heading"><div><div className="eyebrow">YOUR TRIPS</div><h2>My bookings<span className="heading-period">.</span></h2></div></div>{bookings.map((booking) => <BookingCard key={booking.bookingId} booking={booking} onOpen={() => setBookingRoom(booking)}/>)}</div>}<div className="section-heading"><div><div className="eyebrow">A GOOD PLACE TO BEGIN</div><h2>Places you might like<span className="heading-period">.</span></h2><p>Thoughtful spaces for wherever life is taking you.</p></div><a className="view-all" href="#explore">Explore all homes <ArrowRight size={16}/></a></div>
    {filters && <div className="results-line"><span>{loading ? 'Finding nearby rooms…' : `${visible.length} ${filters.stay.toLowerCase()} nearby`}</span><span>Sorted by distance <SlidersHorizontal size={13}/></span></div>}
    {locationNotice && <div className="location-status"><Compass size={15}/><span>{locationNotice}</span></div>}
    {locationError ? <div className="empty-results"><Compass size={26}/><h3>Location is needed</h3><p>{locationError}</p></div> : visible.length ? <div className="room-grid">{visible.map((r) => <RoomCard key={r.id} room={r} saved={saved.includes(r.id)} onSave={(id) => setSaved((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])} onBook={bookRoom}/>)}</div> : !loading && <div className="empty-results"><Compass size={26}/><h3>No nearby rooms found</h3><p>Try another stay type, location or budget.</p></div>}
    <p className="demo-disclaimer">Live listings are sorted by your GPS distance. Room owners must save their listing location.</p>
    {bookingRoom && <BookingModal booking={bookingRoom} onClose={() => setBookingRoom(null)}/>}
  </section>;
}

function Neighbourhood() { return <section className="neighbourhood section-container" id="neighbourhood"><div className="neighbour-copy"><div className="eyebrow">GET TO KNOW THE NEIGHBOURHOOD</div><h2>Feel at home<br/>before you arrive<span>.</span></h2><p>A great place is about more than four walls. Explore the areas, find your everyday essentials, and picture your life here.</p><a className="text-link" href="#explore">Discover Bhopal <ArrowRight size={15}/></a><div className="area-chips"><span><Building2 size={13}/> Student-friendly</span><span><Users size={13}/> Shared living</span><span><Wifi size={13}/> Work-ready</span></div></div>
  <div className="map-illustration real-map"><iframe title="Bhopal neighbourhood map" src="https://www.openstreetmap.org/export/embed.html?bbox=77.3000%2C23.1800%2C77.5000%2C23.3200&layer=mapnik&marker=23.2599%2C77.4126" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/><a className="map-attribution" href="https://www.openstreetmap.org/?mlat=23.2599&mlon=77.4126#map=13/23.2599/77.4126" target="_blank" rel="noreferrer">View larger map</a></div>
 </section>; }

function FeatureStrip() { const items = [['♢','Lowest Price','Guaranteed'],['♢','Verified','Owners & Rooms'],['♧','Find','Roommate'],['▣','Flexible','Stay'],['♧','24×7','Support'],['▣','Secure','Payments'],['✧','Trust &','Safety']]; return <section className="feature-strip section-container">{items.map(([icon, title, sub]) => <div className="feature-item" key={title}><span>{icon}</span><b>{title}<small>{sub}</small></b></div>)}</section>; }

function HowItWorks() { const steps = [{icon:<Users/>, n:'1', title:'Create Your Account', desc:'Sign up with your student or professional details.'},{icon:<Search/>,n:'2',title:'Search or List',desc:'Find a room/roommate or add your own space.'},{icon:<Check/>,n:'3',title:'Verify & Connect',desc:'Book safely with verified owners and secure chat.'}]; return <section className="how-section" id="how-it-works"><div className="section-container"><div className="how-title"><h2>How Room<span>Mate</span> Works?</h2></div><div className="steps-grid">{steps.map((s) => <article className="step-card" key={s.n}><span className="step-number">{s.n}</span><div className="step-icon">{s.icon}</div><h3>{s.title}</h3><p>{s.desc}</p></article>)}</div></div></section>; }

function TrustPanel() { return <section className="trust-panel section-container" id="safety"><div><ShieldCheck size={25}/><h2>User Trust, Our Priority</h2></div><div className="trust-stats"><span>★ <b>4.8/5</b><small>Average User Rating<br/>(10K+ Reviews)</small></span><span><b>50K+</b><small>Verified Users</small></span><span><House size={27}/><b>25K+</b><small>Verified Listings</small></span></div></section>; }

function HostBanner({ onAddRoom }: { onAddRoom: () => void }) { return <section className="host-banner section-container" id="host"><div className="host-person">✦</div><div className="host-copy"><h2>List Your Room</h2><p>Reach thousands of verified students and professionals looking for a stay.</p></div><div className="host-benefits"><span>♢ Get More<br/><b>Visibility</b></span><span>♢ Verified<br/><b>Tenants</b></span><span>ϟ Quick &<br/><b>Secure Listing</b></span></div><button type="button" onClick={onAddRoom} className="host-cta">Add Your Room Now <ArrowRight size={16}/></button></section>; }

function Footer({ openModal }: { openModal: (mode: ModalMode) => void }) { return <><section className="safety-support section-container" id="support"><div><div className="eyebrow">HELP WHEN YOU NEED IT</div><h2>Support & safety<span>.</span></h2><p>For an emergency in India, call 112. For a nearby police station, open the map search.</p></div><div className="safety-actions"><a className="safety-action sos-action" href="tel:112"><Phone size={19}/><span><b>SOS · Call 112</b><small>Emergency help in India</small></span></a><a className="safety-action" href="https://www.google.com/maps/search/police+station+near+me" target="_blank" rel="noreferrer"><MapPin size={19}/><span><b>Find a police station</b><small>Search nearby on Google Maps</small></span></a><a className="safety-action" href="mailto:roommate6200@gmail.com?subject=RoomMate%20Help%20Desk"><LifeBuoy size={19}/><span><b>RoomMate help desk</b><small>roommate6200@gmail.com</small></span></a></div></section><footer className="footer"><div className="section-container footer-main"><div className="footer-brand"><Logo/><p>Helping new beginnings<br/>find a place.</p></div><div className="footer-column"><b>Explore</b><a href="#explore">Find a place</a><a href="#neighbourhood">Neighbourhoods</a><a href="#how-it-works">How it works</a></div><div className="footer-column"><b>RoomMate</b><a href="#host">List your space</a><button onClick={() => openModal('register')}>Create account</button><a href="#support">Help desk & safety</a></div><div className="footer-note"><span>MADE FOR YOUR NEXT CHAPTER</span><p>New city. New keys.<br/><em>Same feeling of home.</em></p><span>✳</span></div></div><div className="section-container footer-bottom"><span>© 2026 RoomMate. A place to land.</span><span>Made with care in India <span className="footer-heart">♥</span></span></div></footer></>; }

function AuthModal({ mode, onClose, onModeChange }: { mode: ModalMode; onClose: () => void; onModeChange: (mode: ModalMode) => void }) {
  const { setSession } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpRequired, setPhoneOtpRequired] = useState(true);
  const [challengeId, setChallengeId] = useState('');
  const [digiLockerStarted, setDigiLockerStarted] = useState(false);
  const [form, setForm] = useState({ identifier:'', password:'', username:'', email:'', fullName:'', phoneNumber:'', aadhaarNumber:'' });
  if (!mode) return null;
  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));
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
  async function resendRegistrationOtp() {
    if (!challengeId) return;
    setBusy(true); setError('');
    try {
      const result = await api.resendRegistrationOtp(challengeId);
      setChallengeId(result.challengeId);
      setPhoneOtpRequired(result.phoneOtpRequired);
      setEmailOtp(''); setPhoneOtp('');
      setError('A new OTP was sent to your email.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not resend the OTP.'); }
    finally { setBusy(false); }
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (mode === 'forgot') {
        if (!challengeId) {
          const result = await api.forgotPassword(form.email.trim());
          setChallengeId(result.challengeId);
          setPhoneOtpRequired(result.phoneOtpRequired);
          setError(result.phoneOtpRequired ? 'OTP sent to your email and phone. Enter both codes and your new password.' : 'OTP sent to your email. Enter the code and your new password.');
          return;
        }
        await api.verifyForgotPassword(challengeId, emailOtp.trim(), phoneOtp.trim(), form.password);
        setError('Password reset successful. You can now log in.');
        setChallengeId('');
        onModeChange('login');
      } else {
        if (mode === 'login') {
          const result = await api.login(form.identifier.trim(), form.password);
          setSession(result.token, result.user); onClose();
        } else if (!challengeId) {
          const result = await api.register({ username: form.username.trim(), email: form.email.trim(), password: form.password, fullName: form.fullName.trim(), phoneNumber: form.phoneNumber.trim(), aadhaarNumber: form.aadhaarNumber.trim() });
          setChallengeId(result.challengeId);
          setPhoneOtpRequired(result.phoneOtpRequired);
          setError(result.phoneOtpRequired ? 'OTP sent to your email and phone. Enter both codes to continue registration.' : 'OTP sent to your email. Enter the code to continue registration.');
        } else {
          const result = await api.verifyRegistrationOtp(challengeId, emailOtp.trim(), phoneOtp.trim());
          setSession(result.token, result.user); onClose();
        }
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="modal-close" onClick={onClose} aria-label="Close"><X size={19}/></button><div className="modal-brand"><span className="logo-symbol">r</span></div><div className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</div><h2 id="auth-title">{mode === 'login' ? 'Welcome back.' : mode === 'forgot' ? 'Reset your password.' : 'Make yourself at home.'}</h2><p className="modal-intro">{mode === 'login' ? 'Log in to pick up where you left off.' : mode === 'forgot' ? 'Enter your email and we will send reset instructions.' : 'Create an account to get started with RoomMate.'}</p>
    <form className="auth-form" onSubmit={submit}>
      {mode === 'forgot' ? <label>Email address<input type="email" autoComplete="email" required placeholder="you@example.com" value={form.email} onChange={(e) => update('email',e.target.value)}/></label> : mode === 'register' ? <>
        <label>Full name<input autoComplete="name" required minLength={2} maxLength={120} placeholder="Your full name" value={form.fullName} onChange={(e) => update('fullName',e.target.value)}/></label>
        <label>Username<input autoComplete="username" required minLength={3} maxLength={50} placeholder="Choose a username" value={form.username} onChange={(e) => update('username',e.target.value)}/></label>
        <label>Mobile number<input inputMode="numeric" autoComplete="tel-national" required pattern="[6-9][0-9]{9}" maxLength={10} placeholder="10-digit number" value={form.phoneNumber} onChange={(e) => update('phoneNumber',e.target.value.replace(/\D/g,'').slice(0,10))}/></label>
        <label>Email address<input type="email" autoComplete="email" required placeholder="you@example.com" value={form.email} onChange={(e) => update('email',e.target.value)}/></label>
        <label>Aadhaar number <span className="field-hint">12 digits · sent to your backend over the configured connection</span><input inputMode="numeric" required pattern="[0-9]{12}" maxLength={12} placeholder="XXXX XXXX XXXX" value={form.aadhaarNumber} onChange={(e) => update('aadhaarNumber',e.target.value.replace(/\D/g,'').slice(0,12))}/></label>
      </> : <label>Email or username<input autoComplete="username" required placeholder="Enter email or username" value={form.identifier} onChange={(e) => update('identifier',e.target.value)}/></label>}
      <label>{mode === 'forgot' ? 'New password' : 'Password'}<div className="password-wrap"><input type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} maxLength={72} required placeholder="At least 8 characters" value={form.password} onChange={(e) => update('password',e.target.value)}/><button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
      {challengeId && <><label>Email OTP<input className="otp-input" inputMode="numeric" maxLength={6} required placeholder="6-digit email OTP" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g,'').slice(0,6))}/></label>{phoneOtpRequired && <label>Phone OTP<input className="otp-input" inputMode="numeric" maxLength={6} required placeholder="6-digit phone OTP" value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g,'').slice(0,6))}/></label>}</>}
      {mode === 'register' && challengeId && <button className="forgot-link" type="button" disabled={busy} onClick={resendRegistrationOtp}>Resend OTP</button>}
      {error && <div className="form-error" role="alert">{error}</div>}
      {mode === 'register' && <><label className="digilocker-check"><input type="checkbox" checked={digiLockerStarted} onChange={verifyDigiLocker} disabled={busy || digiLockerStarted}/><span><strong>Verify with DigiLocker</strong><small>Click to securely verify your identity</small></span><ShieldCheck size={19}/></label><p className="verification-summary"><span className={challengeId ? 'verified' : ''}>✉ {phoneOtpRequired ? 'Email + phone OTPs' : 'Email OTP'} {challengeId ? 'sent' : 'pending'}</span><span className={digiLockerStarted ? 'verified' : ''}>♢ DigiLocker {digiLockerStarted ? 'started' : 'pending'}</span></p><p className="privacy-note"><LockKeyhole size={13}/> {phoneOtpRequired ? 'Email and phone codes are sent after signup.' : 'A verification code is sent to your email after signup.'}</p></>}
      <button className="auth-submit" disabled={busy} type="submit">{busy ? <LoaderCircle className="spin" size={17}/> : null}{busy ? 'Please wait…' : mode === 'login' ? 'Log in to RoomMate' : mode === 'forgot' ? 'Send reset link' : 'Create my account'}{!busy && <ArrowRight size={17}/>}</button>
    </form><div className="auth-switch">{mode === 'login' ? <><button className="forgot-link" onClick={() => { setError(''); onModeChange('forgot'); }}>Forgot password?</button><span>New around here?</span><button onClick={() => { setError(''); onModeChange('register'); }}>Create an account</button></> : mode === 'forgot' ? <><span>Remembered your password?</span><button onClick={() => { setError(''); onModeChange('login'); }}>Log in</button></> : <>Already have an account? <button onClick={() => { setError(''); onModeChange('login'); }}>Log in</button></>}</div>
  </section></div>;
}

function WelcomeStrip({ user }: { user: RoomMateUser }) { const { token, refreshUser } = useAuth(); const [message,setMessage] = useState(''); const [busy,setBusy] = useState(false); async function verify(){ if(!token)return;setBusy(true);setMessage('');try{const result=await api.startDigiLocker(token);window.location.assign(result.authorizationUrl);}catch(e){setMessage(e instanceof Error?e.message:'DigiLocker is not configured yet.');}finally{setBusy(false);}} return <div className="welcome-strip"><div><span className="welcome-kicker">GOOD TO HAVE YOU HERE</span><strong>Welcome, {user.fullName || user.username}.</strong><span className="welcome-sub">Your next chapter is looking good.</span></div><div className="verification-status"><span className={user.digilockerVerified?'status-ok':'status-pending'}><ShieldCheck size={15}/>{user.digilockerVerified?'Identity verified':'Identity pending'}</span><button disabled={busy || user.digilockerVerified} onClick={verify}>{busy?'Connecting…':user.digilockerVerified?'Verified':'Verify with DigiLocker'} <ArrowUpRight size={13}/></button>{message && <small>{message}</small>}</div></div>; }

type RoomForm = { title: string; location: string; capacity: string; occupancy: string; privacy: 'Private' | 'Shared'; stayType: 'Monthly' | 'One day / One night'; rent: string; description: string; images: string[]; latitude: string; longitude: string };

function AddRoomForm({ onBack, onSaved }: { onBack: () => void; onSaved?: (location: string, stayType: StayType) => void }) {
  const { token, user } = useAuth();
  const [form, setForm] = useState<RoomForm>({ title:'', location:'', capacity:'1', occupancy:'', privacy:'Private', stayType:'Monthly', rent:'', description:'', images:[], latitude:'', longitude:'' });
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const update = (key: keyof RoomForm, value: string) => setForm((current) => ({ ...current, [key]: value }));
  function useListingLocation() {
    if (!navigator.geolocation) { setError('GPS is not supported in this browser.'); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { update('latitude', String(coords.latitude)); update('longitude', String(coords.longitude)); setError('GPS location saved for nearest-room recommendations.'); },
      () => setError('Location permission was denied. Allow GPS access to enable nearest-room recommendations.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }
  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);
  function addImage(dataUrl: string) {
    setForm((current) => current.images.length >= 8 ? current : ({ ...current, images: [...current.images, dataUrl] }));
  }
  async function chooseImages(files: FileList | null) {
    if (!files) return;
    const remaining = Math.max(0, 8 - form.images.length);
    const chosen = Array.from(files).filter((file) => file.type.startsWith('image/')).slice(0, remaining);
    const optimized = await Promise.all(chosen.map((file) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read one of the selected images.'));
      reader.onload = () => {
        const source = new Image();
        source.onerror = () => reject(new Error('One of the selected files is not a valid image.'));
        source.onload = () => {
          const scale = Math.min(1, 1600 / Math.max(source.width, source.height));
          const canvas = document.createElement('canvas'); canvas.width = Math.round(source.width * scale); canvas.height = Math.round(source.height * scale);
          canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        };
        source.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    })));
    setForm((current) => ({ ...current, images: [...current.images, ...optimized].slice(0, 8) }));
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
    addImage(canvas.toDataURL('image/jpeg', 0.82)); closeCamera();
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!token) { setError('Please log in before saving a room listing.'); return; }
    if (!form.latitude || !form.longitude) { setError('Save the room GPS location before submitting so renters can find it in search.'); return; }
    setBusy(true); setError('');
    try {
      await api.createRoom(token, {
        title: form.title,
        location: form.location,
        capacity: Number(form.capacity),
        occupancy: Number(form.occupancy || 0),
        privacy: form.privacy,
        stayType: form.stayType,
        rent: Number(form.rent),
        description: form.description,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        imageUrls: form.images,
      });
      setSaved(true);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this room listing.');
    } finally { setBusy(false); }
  }
  return <><section className="workspace section-container"><button className="back-link" onClick={onBack}><ArrowRight size={16} className="back-arrow"/> Back to dashboard</button><div className="workspace-heading"><div><div className="eyebrow">LIST YOUR SPACE</div><h1>Add a room<span>.</span></h1><p>Share the details people need before choosing their next home.</p></div><div className="workspace-icon"><Plus size={27}/></div></div>
    <form className="room-form" onSubmit={submit}><div className="room-form-main"><label>Owner name<input readOnly value={user?.fullName || user?.username || ''}/></label><label>Room title<input required value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Bright room near the city centre"/></label><div className="form-row"><label>Location<input required value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Area, city"/></label><label>{form.stayType === 'Monthly' ? 'Monthly rent' : 'Price for one day / one night'}<input required type="number" min="0" value={form.rent} onChange={(e) => update('rent', e.target.value)} placeholder={form.stayType === 'Monthly' ? '₹ 8,000' : '₹ 500'}/></label></div>    <div className="location-status"><button type="button" className="auto-location-button" onClick={useListingLocation}><Compass size={16}/> {form.latitude ? 'GPS location saved' : 'Save room GPS location'}</button>{form.latitude && <small>{Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}</small>}</div><fieldset><legend>Stay duration</legend><div className="choice-row"><label className={form.stayType === 'Monthly' ? 'choice selected' : 'choice'}><input type="radio" name="stayType" checked={form.stayType === 'Monthly'} onChange={() => update('stayType','Monthly')}/> Monthly stay</label><label className={form.stayType === 'One day / One night' ? 'choice selected' : 'choice'}><input type="radio" name="stayType" checked={form.stayType === 'One day / One night'} onChange={() => update('stayType','One day / One night')}/> One day / one night</label></div></fieldset><div className="form-row"><label>How many people can stay?<input required type="number" min="1" value={form.capacity} onChange={(e) => update('capacity', e.target.value)}/></label><label>People currently staying<input type="number" min="0" value={form.occupancy} onChange={(e) => update('occupancy', e.target.value)} placeholder="0"/></label></div><fieldset><legend>Room type</legend><div className="choice-row"><label className={form.privacy === 'Private' ? 'choice selected' : 'choice'}><input type="radio" name="privacy" checked={form.privacy === 'Private'} onChange={() => update('privacy','Private')}/> Private room</label><label className={form.privacy === 'Shared' ? 'choice selected' : 'choice'}><input type="radio" name="privacy" checked={form.privacy === 'Shared'} onChange={() => update('privacy','Shared')}/> Shared room</label></div></fieldset><label>Description<textarea required rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Tell people about the room, amenities and house rules"/></label></div><div className="room-form-side"><div className="upload-box"><Camera size={30}/><strong>Room photos ({form.images.length}/8)</strong><span>Upload up to 8 clear room photos or take them with your camera.</span><div className="image-actions"><button type="button" className="camera-button" onClick={openCamera}><Camera size={16}/> Open camera</button><label className="upload-button">Add photos<input type="file" accept="image/*" multiple disabled={form.images.length >= 8} onChange={(e) => { void chooseImages(e.target.files).catch((err) => setError(err.message)); e.currentTarget.value = ''; }}/></label></div>{form.images.length > 0 && <div className="room-photo-preview">{form.images.map((photo, index) => <div key={`${index}-${photo.length}`}><img src={photo} alt={`Room photo ${index + 1}`}/><button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => setForm((current) => ({ ...current, images: current.images.filter((_, i) => i !== index) }))}><X size={14}/></button></div>)}</div>}{cameraError && <small className="camera-error">{cameraError}</small>}</div>{error && <div className="form-error" role="alert">{error}</div>}<button className="auth-submit" disabled={busy} type="submit">{busy ? <LoaderCircle className="spin" size={17}/> : saved ? <Check size={17}/> : <Plus size={17}/>} {busy ? 'Saving…' : saved ? 'Room listing saved' : 'Save room listing'}</button></div></form>
  </section>{submitted && <div className="modal-backdrop" role="presentation"><section className="booking-modal room-submitted-modal" role="dialog" aria-modal="true" aria-labelledby="room-submitted-title"><div className="eyebrow">ROOM LISTED</div><h2 id="room-submitted-title">Your room was submitted<span>.</span></h2><p className="booking-room-title">{form.title}</p><p className="booking-note">Your listing is saved and can be found in nearby room search.</p><button className="auth-submit" type="button" onClick={() => onSaved?.(form.location, form.stayType === 'Monthly' ? 'Monthly stays' : 'Short stays')}>Search rooms <ArrowRight size={16}/></button><button className="submitted-close" type="button" onClick={() => { setSubmitted(false); onBack(); }}>Back to dashboard</button></section></div>}{cameraOpen && <div className="camera-modal" role="dialog" aria-modal="true" aria-label="Capture room image"><div className="camera-panel"><video ref={videoRef} autoPlay playsInline/><div className="camera-controls"><button type="button" onClick={captureImage}><Camera size={18}/> Capture image</button><button type="button" onClick={closeCamera}>Cancel</button></div></div></div>}</>;
}

function OwnerBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState<ApiBooking[]>([]);
  const [otpById, setOtpById] = useState<Record<number, string>>({});
  const [error, setError] = useState('');
  useEffect(() => {
    if (token) void api.ownerBookings(token).then(setBookings).catch((err) => setError(err instanceof Error ? err.message : 'Could not load booking requests.'));
  }, [token]);
  async function confirm(bookingId: number) {
    if (!token) return;
    try {
      const updated = await api.confirmBooking(token, bookingId, otpById[bookingId] || '');
      setBookings((items) => items.map((item) => item.id === bookingId ? updated : item));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm booking.');
    }
  }
  if (!bookings.length && !error) return null;
  return <section className="owner-bookings"><div className="eyebrow">OWNER REQUESTS</div><h2>Booking requests<span>.</span></h2>{error && <div className="form-error">{error}</div>}{bookings.map((booking) => <article className="owner-booking-card" key={booking.id}><div><strong>{booking.roomTitle}</strong><span><MapPin size={13}/> {booking.location}</span><span>Renter: {booking.renterFullName} · {booking.renterPhoneNumber}</span></div><div className="owner-booking-action"><b>{booking.status}</b>{booking.status === 'REQUESTED' && <><input aria-label={`OTP for booking ${booking.id}`} value={otpById[booking.id] || ''} onChange={(event) => setOtpById((current) => ({ ...current, [booking.id]: event.target.value }))} placeholder="6-digit OTP" inputMode="numeric" maxLength={6}/><button className="book-button" type="button" onClick={() => void confirm(booking.id)}>Confirm OTP</button></>}</div></article>)}</section>;
}

function MyRoomListings({ onSearch }: { onSearch: (location: string, stayType: StayType) => void }) {
  const { token } = useAuth();
  const [listings, setListings] = useState<RoomListing[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!token) return;
    void api.myRooms(token).then(setListings).catch((err) => setError(err instanceof Error ? err.message : 'Could not load your rooms.'));
  }, [token]);
  if (!listings.length && !error) return null;
  return <section className="my-room-listings"><div className="section-heading"><div><div className="eyebrow">YOUR LISTINGS</div><h2>Rooms you added<span className="heading-period">.</span></h2><p>Your saved rooms appear here and in matching search results.</p></div></div>{error && <div className="form-error">{error}</div>}<div className="my-room-list-grid">{listings.map((room) => <article className="my-room-list-card" key={room.id}><img src={room.imageUrls?.[0] || room.imageUrl || `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80`} alt={room.title}/><div className="my-room-list-copy"><span className="room-list-status">{room.status}</span><h3>{room.title}</h3><p><MapPin size={13}/>{room.location}</p><strong>₹{room.rent.toLocaleString('en-IN')} {room.stayType === 'Monthly' ? '/ month' : '/ night'}</strong><button className="text-button" type="button" onClick={() => onSearch(room.location, room.stayType === 'Monthly' ? 'Monthly stays' : 'Short stays')}>Show in search <ArrowRight size={14}/></button></div></article>)}</div></section>;
}

function Dashboard({ user }: { user: RoomMateUser }) {
  const [view, setView] = useState<'home' | 'search' | 'add'>('home');
  const [filters, setFilters] = useState<{ query: string; budget: string; room: string; stay: StayType } | null>(null);
  function search(query: string, budget: string, room: string, stay: StayType) { setFilters({ query, budget, room, stay }); setView('search'); }
  if (view === 'add') return <AddRoomForm onBack={() => setView('home')} onSaved={(query, stay) => { setFilters({ query, budget: 'Any budget', room: 'Any room', stay }); setView('search'); }}/>;
  if (view === 'search') return <main className="workspace section-container"><button className="back-link" onClick={() => setView('home')}><ArrowRight size={16} className="back-arrow"/> Back to dashboard</button><div className="workspace-heading"><div><div className="eyebrow">FIND YOUR NEXT HOME</div><h1>Search rooms<span>.</span></h1><p>Filter live listings by location, stay type, budget and room type.</p></div></div><SearchPanel onSearch={search} initialQuery={filters?.query || 'Bhopal'}/><Listings filters={filters}/></main>;
  return <main className="dashboard section-container"><div className="dashboard-greeting"><div><div className="eyebrow">YOUR ROOMMATE SPACE</div><h1>Welcome, {user.fullName?.split(' ')[0] || user.username}<span>.</span></h1><p>What would you like to do today?</p></div><span className="dashboard-avatar">{user.fullName?.charAt(0)?.toUpperCase() || 'U'}</span></div><div className="dashboard-actions"><button className="dashboard-card search-card" onClick={() => setView('search')}><span className="dashboard-card-icon"><Search size={28}/></span><strong>Search room</strong><span>Find a private or shared room that fits your life.</span><b>Explore available rooms <ArrowRight size={18}/></b></button><button className="dashboard-card add-card" onClick={() => setView('add')}><span className="dashboard-card-icon"><Plus size={28}/></span><strong>Add room</strong><span>List your available room and help someone find home.</span><b>Create a room listing <ArrowRight size={18}/></b></button></div><MyRoomListings onSearch={(location, stay) => search(location, 'Any budget', 'Any room', stay)}/><OwnerBookings/><WelcomeStrip user={user}/></main>;
}

export default function App() {
  const [modal, setModal] = useState<ModalMode>(null);
  const [roomLightOn, setRoomLightOn] = useState(true);
  const [theme, setTheme] = useState<'day' | 'night'>(() => localStorage.getItem('roommate-theme') === 'night' ? 'night' : 'day');
  const [filters, setFilters] = useState<{ query: string; budget: string; room: string; stay: StayType } | null>({ query: 'Bhopal', budget: 'Any budget', room: 'Any room', stay: 'Monthly stays' });
  const [showAddRoom, setShowAddRoom] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('roommate-theme', theme);
  }, [theme]);
  function toggleTheme() { setTheme((current) => current === 'day' ? 'night' : 'day'); }
  function requireLogin(action: () => void) { if (user) action(); else setModal('login'); }
  function handleSearch(query: string,budget:string,room:string,stay: StayType){ requireLogin(() => { setFilters({query,budget,room,stay}); document.getElementById('explore')?.scrollIntoView({behavior:'smooth'}); }); }
  function openAddRoom() { requireLogin(() => setShowAddRoom(true)); }
  if (user) return <><Header openModal={setModal} onFindRoom={() => undefined} onAddRoom={openAddRoom} theme={theme} onToggleTheme={toggleTheme}/><Dashboard user={user}/><Footer openModal={setModal}/></>;
  return <><Header openModal={setModal} onFindRoom={() => setModal('login')} onAddRoom={() => setModal('login')} theme={theme} onToggleTheme={toggleTheme}/>{showAddRoom ? <AddRoomForm onBack={() => setShowAddRoom(false)}/> : <main id="home"><section className="hero section-container"><div className="hero-content"><div className="hero-badge">♢ India's Student Stay Platform</div><h1>Find a Place to Stay,<br/>List Your Space &<br/>Get the Right <em>Roommate</em></h1><p>Verified rooms, lowest prices, trusted owners and compatible roommates — built for students & young professionals.</p><div className="hero-actions"><button className="hero-primary" onClick={() => setModal('login')}><Search size={20}/> Find a Room <ArrowRight size={17}/></button><button className="hero-secondary" onClick={() => setModal('login')}><Plus size={20}/> List Your Room <ArrowRight size={17}/></button></div><div className="hero-trust"><span>✓ Lowest Price</span><span>✓ Verified Listings</span><span>✓ Secure & Safe</span><span>✓ Student Friendly</span></div></div><div className={roomLightOn ? 'hero-visual light-on' : 'hero-visual light-off'} aria-label="Interactive animated room preview"><div className="hero-3d-scene"><div className="hero-photo"/><div className="hero-photo-overlay"/><div className="hero-room-lamp"><span/></div><button className="hero-light-switch" type="button" onClick={() => setRoomLightOn((on) => !on)} aria-pressed={roomLightOn} aria-label={roomLightOn ? 'Turn room light off' : 'Turn room light on'}><span/><small>{roomLightOn ? 'LIGHT ON' : 'LIGHT OFF'}</small></button><div className="hero-3d-orb">RM</div><div className="hero-3d-card hero-3d-card-two"><span>★ 4.9</span><strong>Made for living</strong><small>Find your nearby fit</small></div></div><div className="hero-script">Stay<br/>Share<br/>Save<br/>Together ♡</div></div></section>
    <FeatureStrip/>
    <div className="section-container search-position"><SearchPanel onSearch={handleSearch}/></div>
    {user && <div className="section-container"><WelcomeStrip user={user}/></div>}
    <Listings filters={filters} onLoginRequired={() => setModal('login')}/><Neighbourhood/><HowItWorks/><TrustPanel/><HostBanner onAddRoom={() => setModal('login')}/></main>}<Footer openModal={setModal}/><AuthModal mode={modal} onClose={() => setModal(null)} onModeChange={setModal}/></>;
}
