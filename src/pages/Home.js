import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATS = [
  { v:'',           l:'✦ Tous',          color:'#FF4D2E' },
  { v:'conference', l:'🎤 Conférences',  color:'#667eea' },
  { v:'concert',    l:'🎵 Concerts',     color:'#f5576c' },
  { v:'atelier',    l:'🎨 Ateliers',     color:'#43e97b' },
  { v:'sport',      l:'⚡ Sport',        color:'#fa709a' },
  { v:'networking', l:'🤝 Networking',   color:'#4facfe' },
];

const GRADS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
];

export default function Home() {
  const { user, logout } = useAuth();
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [cat, setCat]         = useState('');
  const [menuOpen, setMenu]   = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const p = {};
      if (search) p.search   = search;
      if (cat)    p.category = cat;
      getEvents(p)
        .then(r => setEvents(r.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, cat]);

  const parallax = scrollY * 0.35;

  return (
    <>
      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-12px) rotate(1deg); }
          66%      { transform: translateY(-6px) rotate(-1deg); }
        }
        @keyframes gradMove {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes ripple {
          0%   { transform: scale(0.8); opacity:1; }
          100% { transform: scale(2.4); opacity:0; }
        }
        @keyframes countUp {
          from { opacity:0; transform: translateY(8px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes borderPulse {
          0%,100% { border-color: rgba(255,77,46,0.3); }
          50%      { border-color: rgba(255,77,46,0.8); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        .hero-badge {
          animation: borderPulse 2.5s ease-in-out infinite;
        }
        .float-1 { animation: float 6s ease-in-out infinite; }
        .float-2 { animation: float 8s ease-in-out infinite 1s; }
        .float-3 { animation: float 7s ease-in-out infinite 2s; }

        .home-events-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        .event-card-wrap { text-decoration: none; display: block; }
        .event-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--border);
          transition: all 0.32s cubic-bezier(0.34,1.56,0.64,1);
          height: 100%;
          position: relative;
        }
        .event-card::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          opacity: 0;
          transition: opacity 0.3s;
          box-shadow: 0 28px 64px rgba(0,0,0,0.16);
          pointer-events: none;
        }
        .event-card:hover {
          transform: translateY(-8px) scale(1.01);
          border-color: transparent;
        }
        .event-card:hover::after { opacity: 1; }

        .event-card .card-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55) 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .event-card:hover .card-img-overlay { opacity: 1; }

        .card-hover-btn {
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          transition: bottom 0.3s cubic-bezier(0.34,1.56,0.64,1);
          background: var(--accent);
          color: white;
          padding: 8px 20px;
          border-radius: 100px;
          font-weight: 600;
          font-size: 13px;
          opacity: 0;
        }
        .event-card:hover .card-hover-btn {
          bottom: 16px;
          opacity: 1;
        }

        .home-nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .hamburger-btn:hover { background: var(--cream); }
        .mobile-menu {
          background: white;
          border-bottom: 1px solid var(--border);
          padding: 0 20px;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s ease, padding 0.35s ease;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .mobile-menu.open {
          max-height: 400px;
          padding: 16px 20px;
        }
        .filter-chips { display: flex; gap: 8px; flex-wrap: wrap; }

        .stat-counter {
          animation: countUp 0.6s ease forwards;
        }

        .search-input-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
          max-width: 340px;
        }
        .search-input-wrap::before {
          content: '🔍';
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          pointer-events: none;
        }

        .section-title-line {
          display: inline-block;
          position: relative;
        }
        .section-title-line::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--accent);
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.5s ease 0.3s;
        }
        .section-title-line.visible::after {
          transform: scaleX(1);
        }

        .ripple-btn {
          position: relative;
          overflow: hidden;
        }
        .ripple-btn::after {
          content: '';
          position: absolute;
          top: 50%; left: 50%;
          width: 100%; height: 100%;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          transform: translate(-50%,-50%) scale(0);
          transition: transform 0.5s ease;
        }
        .ripple-btn:active::after {
          transform: translate(-50%,-50%) scale(2.5);
          opacity: 0;
          transition: transform 0.5s ease, opacity 0.5s ease 0.2s;
        }

        @media (max-width: 1100px) { .home-events-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px) {
          .home-events-grid { grid-template-columns: 1fr; }
          .home-nav-links   { display: none; }
          .hamburger-btn    { display: flex; }
        }
      `}</style>

      <div style={{ background:'var(--paper)', minHeight:'100vh' }}>

        {/* ── NAVBAR ── */}
        <nav className="navbar" style={{ transition:'box-shadow 0.3s', boxShadow: scrollY > 20 ? '0 4px 24px rgba(0,0,0,0.08)' : 'none' }}>
          <div className="navbar-inner">
            <Link to="/" className="navbar-logo">
              <div className="logo-icon" style={{ transition:'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform='rotate(-8deg) scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform='rotate(0) scale(1)'}>E</div>
              <span className="logo-text">Eventify</span>
            </Link>

            <div className="home-nav-links">
              {!user ? (
                <>
                  <Link to="/login" className="nav-link">Se connecter</Link>
                  <Link to="/register" className="btn btn-primary ripple-btn" style={{ padding:'9px 20px' }}>
                    ✨ Créer un compte
                  </Link>
                </>
              ) : (
                <>
                  {user.role==='participant' &&
                    <Link to="/my-events" className="nav-link">🎟️ Mes inscriptions</Link>}
                  {user.role==='organizer' &&
                    <Link to="/dashboard" className="nav-link">📊 Dashboard</Link>}
                  <div className="user-pill" onClick={logout}
                    title="Cliquer pour se déconnecter">
                    <div className="user-avatar">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <span style={{ fontSize:'13px', fontWeight:600 }}>{user.first_name}</span>
                    <span style={{ fontSize:'10px', color:'var(--muted)' }}>✕</span>
                  </div>
                </>
              )}
            </div>

            <button className="hamburger-btn" onClick={() => setMenu(!menuOpen)}>
              <div style={{ display:'flex', flexDirection:'column', gap:'5px', width:'22px' }}>
                <div style={{ height:'2px', background:'var(--ink)', borderRadius:'2px', transition:'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }}/>
                <div style={{ height:'2px', background:'var(--ink)', borderRadius:'2px', transition:'all 0.3s', opacity: menuOpen ? 0 : 1 }}/>
                <div style={{ height:'2px', background:'var(--ink)', borderRadius:'2px', transition:'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }}/>
              </div>
            </button>
          </div>

          {/* MENU MOBILE */}
          <div className={`mobile-menu ${menuOpen?'open':''}`}>
            {!user ? (
              <>
                <Link to="/login" style={{ color:'var(--ink)', textDecoration:'none', fontSize:'15px', fontWeight:500, padding:'10px 0', borderBottom:'1px solid var(--border)' }} onClick={() => setMenu(false)}>
                  🔑 Se connecter
                </Link>
                <Link to="/register" className="btn btn-primary ripple-btn" style={{ justifyContent:'center', padding:'12px', marginTop:'4px' }} onClick={() => setMenu(false)}>
                  ✨ Créer un compte
                </Link>
              </>
            ) : (
              <>
                <div style={{ fontSize:'14px', fontWeight:700, paddingBottom:'12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'10px' }}>
                  <div className="user-avatar">{user.first_name?.[0]}{user.last_name?.[0]}</div>
                  {user.first_name} {user.last_name}
                </div>
                {user.role==='participant' && <Link to="/my-events" style={{ color:'var(--ink)', textDecoration:'none', fontSize:'14px', fontWeight:500, padding:'10px 0' }} onClick={() => setMenu(false)}>🎟️ Mes inscriptions</Link>}
                {user.role==='organizer'   && <Link to="/dashboard"  style={{ color:'var(--ink)', textDecoration:'none', fontSize:'14px', fontWeight:500, padding:'10px 0' }} onClick={() => setMenu(false)}>📊 Dashboard</Link>}
                <button onClick={() => { logout(); setMenu(false); }} className="btn btn-danger" style={{ marginTop:'4px' }}>
                  🚪 Déconnexion
                </button>
              </>
            )}
          </div>
        </nav>

        {/* ── HERO ── */}
        <section ref={heroRef} style={{ background:'var(--ink)', padding:'clamp(64px,8vw,112px) 24px clamp(80px,10vw,132px)', position:'relative', overflow:'hidden', minHeight:'90vh', display:'flex', alignItems:'center' }}>

          {/* BACKGROUND EFFECTS */}
          <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
            {/* Glow orbs */}
            <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'70vw', height:'70vw', maxWidth:'800px', maxHeight:'800px', background:'radial-gradient(circle,rgba(255,77,46,0.12) 0%,transparent 65%)', transform:`translateY(${parallax * 0.3}px)`, transition:'transform 0.1s linear' }}/>
            <div style={{ position:'absolute', bottom:'-20%', left:'10%', width:'50vw', height:'50vw', maxWidth:'600px', maxHeight:'600px', background:'radial-gradient(circle,rgba(255,184,0,0.08) 0%,transparent 65%)', transform:`translateY(${-parallax * 0.2}px)`, transition:'transform 0.1s linear' }}/>
            <div style={{ position:'absolute', top:'30%', left:'-5%', width:'30vw', height:'30vw', maxWidth:'400px', background:'radial-gradient(circle,rgba(103,126,234,0.06) 0%,transparent 65%)' }}/>

            {/* Floating shapes */}
            <div className="float-1" style={{ position:'absolute', top:'15%', right:'8%', width:'80px', height:'80px', borderRadius:'24px', background:'rgba(255,77,46,0.08)', border:'1px solid rgba(255,77,46,0.15)', transform:`translateY(${parallax * 0.5}px)` }}/>
            <div className="float-2" style={{ position:'absolute', bottom:'25%', right:'20%', width:'48px', height:'48px', borderRadius:'50%', background:'rgba(255,184,0,0.1)', border:'1px solid rgba(255,184,0,0.2)' }}/>
            <div className="float-3" style={{ position:'absolute', top:'45%', right:'40%', width:'32px', height:'32px', borderRadius:'10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
            <div className="float-1" style={{ position:'absolute', top:'20%', left:'15%', width:'20px', height:'20px', borderRadius:'6px', background:'rgba(255,77,46,0.15)', animationDelay:'3s' }}/>

            {/* Grid overlay */}
            <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize:'60px 60px' }}/>
          </div>

          <div style={{ maxWidth:'1400px', margin:'0 auto', width:'100%', position:'relative' }}>

            {/* BADGE */}
            <div className="animate-fadeUp hero-badge" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,77,46,0.1)', border:'1px solid rgba(255,77,46,0.3)', color:'#FF7A5C', padding:'7px 18px', borderRadius:'100px', fontSize:'13px', fontWeight:600, marginBottom:'32px' }}>
              <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#FF7A5C', display:'inline-block', animation:'ripple 1.5s ease-out infinite' }}/>
              🔥 Plateforme événementielle #1 au Sénégal
            </div>

            {/* TITLE */}
            <h1 className="animate-fadeUp delay-1" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(40px,7vw,90px)', fontWeight:800, color:'white', lineHeight:1.0, letterSpacing:'-3px', maxWidth:'900px', marginBottom:'28px' }}>
              Découvrez les<br/>
              événements qui{' '}
              <span style={{ color:'var(--accent)', display:'inline-block', position:'relative' }}>
                vous inspirent
                <svg style={{ position:'absolute', bottom:'-8px', left:0, width:'100%' }} height="6" viewBox="0 0 200 6" preserveAspectRatio="none">
                  <path d="M0,5 Q50,0 100,5 Q150,10 200,5" stroke="rgba(255,77,46,0.5)" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            <p className="animate-fadeUp delay-2" style={{ color:'rgba(255,255,255,0.45)', fontSize:'clamp(15px,2vw,19px)', maxWidth:'520px', lineHeight:1.75, marginBottom:'48px', fontWeight:300, letterSpacing:'0.1px' }}>
              Conférences, concerts, ateliers — trouvez votre prochain événement ou créez le vôtre en quelques minutes.
            </p>

            {/* CTA BUTTONS */}
            <div className="animate-fadeUp delay-3" style={{ display:'flex', gap:'14px', flexWrap:'wrap', marginBottom:'72px' }}>
              <a href="#events" className="ripple-btn" style={{ background:'var(--accent)', color:'white', padding:'16px 32px', borderRadius:'14px', textDecoration:'none', fontWeight:700, fontSize:'15px', boxShadow:'0 6px 24px rgba(255,77,46,0.45)', transition:'all 0.25s', display:'flex', alignItems:'center', gap:'8px' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 32px rgba(255,77,46,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 6px 24px rgba(255,77,46,0.45)'; }}>
                Explorer les événements →
              </a>
              {!user && (
                <Link to="/register" style={{ background:'rgba(255,255,255,0.07)', color:'white', padding:'16px 32px', borderRadius:'14px', textDecoration:'none', fontWeight:600, fontSize:'15px', border:'1.5px solid rgba(255,255,255,0.15)', transition:'all 0.25s', backdropFilter:'blur(8px)' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.28)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; }}>
                  Devenir organisateur
                </Link>
              )}
            </div>

          </div>
          {/* STATS */}
<div className="animate-fadeUp delay-4" style={{ display:'flex', gap:'clamp(28px,5vw,64px)', paddingTop:'40px', borderTop:'1px solid rgba(255,255,255,0.07)', flexWrap:'wrap', rowGap:'20px' }}>
  {[
    ['2 400+', 'Événements'],
    ['18 000', 'Participants'],
    ['340',    'Organisateurs'],
    ['98%',    'Satisfaction'],
  ].map(([n, l], i) => (
    <div key={i} className="stat-counter" style={{ animationDelay:`${0.5+i*0.1}s` }}>
      <div style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(24px,3.5vw,36px)', fontWeight:800, color:'white', letterSpacing:'-1.5px' }}>
        {n}
      </div>
      <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', marginTop:'5px', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:500 }}>
        {l}
      </div>
    </div>
  ))}
</div>
        </section>

        {/* ── FILTRES ── */}
        <div style={{ background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', padding:'clamp(10px,1.5vw,16px) 24px', position:'sticky', top:'64px', zIndex:99, transition:'box-shadow 0.3s', boxShadow: scrollY > 100 ? '0 4px 20px rgba(0,0,0,0.06)' : 'none' }}>
          <div style={{ maxWidth:'1400px', margin:'0 auto', display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' }}>
            <div className="search-input-wrap">
              <input
                type="text"
                placeholder="  Rechercher un événement..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width:'100%', padding:'10px 16px 10px 38px', borderRadius:'12px', border:'1.5px solid var(--border)', background:'var(--paper)', fontFamily:'DM Sans,sans-serif', fontSize:'14px', color:'var(--ink)', outline:'none', transition:'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px rgba(255,77,46,0.1)'; }}
                onBlur={e  => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
              />
            </div>
            <div className="filter-chips">
              {CATS.map(c => (
                <button key={c.v} onClick={() => setCat(c.v)}
                  style={{ padding:'8px 18px', borderRadius:'100px', border:`1.5px solid ${cat===c.v?c.color:'var(--border)'}`, background:cat===c.v?`${c.color}14`:'white', color:cat===c.v?c.color:'var(--muted)', fontSize:'13px', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'DM Sans,sans-serif', transition:'all 0.2s', transform: cat===c.v ? 'scale(1.05)' : 'scale(1)' }}>
                  {c.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── EVENTS SECTION ── */}
        <section id="events" style={{ maxWidth:'1400px', margin:'0 auto', padding:'clamp(32px,4vw,56px) 24px' }}>

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
            <div>
              <h2 className="section-title-line visible" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(20px,2.5vw,26px)', fontWeight:800, letterSpacing:'-0.8px' }}>
                Événements à venir
              </h2>
              {!loading && events.length > 0 && (
                <p style={{ color:'var(--muted)', fontSize:'13px', marginTop:'4px' }}>
                  {events.length} événement{events.length!==1?'s':''} disponible{events.length!==1?'s':''}
                </p>
              )}
            </div>
            {!loading && events.length > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 14px', background:'white', border:'1px solid var(--border)', borderRadius:'100px', fontSize:'13px', color:'var(--muted)', fontWeight:500 }}>
                <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--green)', display:'inline-block', animation:'ripple 2s ease-out infinite' }}/>
                En direct
              </div>
            )}
          </div>

          {/* LOADING SKELETONS */}
          {loading ? (
            <div className="home-events-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ background:'white', borderRadius:'20px', overflow:'hidden', border:'1px solid var(--border)', animationDelay:`${i*0.08}s` }} className="animate-fadeUp">
                  <div className="skeleton" style={{ height:'200px', borderRadius:0 }}/>
                  <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'10px' }}>
                    <div className="skeleton" style={{ height:'11px', width:'55px', borderRadius:'6px' }}/>
                    <div className="skeleton" style={{ height:'22px', width:'85%', borderRadius:'6px' }}/>
                    <div className="skeleton" style={{ height:'14px', width:'65%', borderRadius:'6px' }}/>
                    <div className="skeleton" style={{ height:'14px', width:'50%', borderRadius:'6px' }}/>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px' }}>
                      <div className="skeleton" style={{ height:'18px', width:'70px', borderRadius:'6px' }}/>
                      <div className="skeleton" style={{ height:'18px', width:'80px', borderRadius:'6px' }}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          ) : events.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 24px', background:'white', borderRadius:'24px', border:'1px solid var(--border)' }} className="animate-fadeUp">
              <div style={{ fontSize:'72px', marginBottom:'20px', filter:'grayscale(0.2)' }}>📭</div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'22px', fontWeight:800, marginBottom:'10px', letterSpacing:'-0.5px' }}>
                Aucun événement trouvé
              </h3>
              <p style={{ color:'var(--muted)', marginBottom:'28px' }}>
                {search || cat ? 'Essayez une autre recherche ou catégorie' : 'Aucun événement disponible pour le moment'}
              </p>
              {(search || cat) && (
                <button onClick={() => { setSearch(''); setCat(''); }} className="btn btn-secondary">
                  Effacer les filtres
                </button>
              )}
            </div>

          ) : (
            <div className="home-events-grid">
              {events.map((ev, idx) => (
                <Link
                  key={ev.id}
                  to={`/events/${ev.id}`}
                  className="event-card-wrap animate-fadeUp"
                  style={{ animationDelay:`${idx * 0.07}s`, opacity:0 }}
                >
                  <div className="event-card">

                    {/* IMAGE */}
                    <div style={{ height:'210px', background:GRADS[ev.id % GRADS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'64px', position:'relative', overflow:'hidden' }}>
                      {ev.image
                        ? <img src={`http://127.0.0.1:8000${ev.image}`} alt={ev.title} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s ease' }}
                            onMouseEnter={e => e.target.style.transform='scale(1.05)'}
                            onMouseLeave={e => e.target.style.transform='scale(1)'}/>
                        : <span className="float-1">🎉</span>
                      }

                      {/* Overlay hover */}
                      <div className="card-img-overlay"/>

                      {/* Voir plus btn */}
                      <div className="card-hover-btn">Voir l'événement →</div>

                      {/* BADGES */}
                      <div style={{ position:'absolute', top:'14px', left:'14px', padding:'5px 12px', borderRadius:'100px', fontSize:'11px', fontWeight:600, background:ev.is_private?'rgba(13,13,18,0.75)':'rgba(255,255,255,0.92)', color:ev.is_private?'white':'var(--ink)', WebkitBackdropFilter:'blur(8px)', backdropFilter:'blur(8px)', letterSpacing:'0.3px' }}>
                        {ev.is_private?'🔒 Privé':'✅ Public'}
                      </div>

                      {ev.price==0
                        ? <div style={{ position:'absolute', top:'14px', right:'14px', padding:'5px 12px', borderRadius:'100px', fontSize:'11px', fontWeight:700, background:'rgba(29,185,84,0.9)', color:'white', letterSpacing:'0.5px' }}>GRATUIT</div>
                        : ev.capacity - ev.registrations_count <= 5 && ev.capacity - ev.registrations_count > 0
                          ? <div style={{ position:'absolute', top:'14px', right:'14px', padding:'5px 12px', borderRadius:'100px', fontSize:'11px', fontWeight:700, background:'rgba(255,77,46,0.9)', color:'white' }}>🔥 {ev.capacity-ev.registrations_count} places !</div>
                          : null
                      }
                    </div>

                    {/* BODY */}
                    <div style={{ padding:'20px' }}>
                      <div style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'1.2px', color:'var(--accent)', marginBottom:'8px' }}>
                        {ev.category}
                      </div>
                      <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'17px', fontWeight:700, letterSpacing:'-0.3px', lineHeight:1.3, marginBottom:'14px', color:'var(--ink)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {ev.title}
                      </h3>

                      <div style={{ display:'flex', flexDirection:'column', gap:'7px', marginBottom:'16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'var(--muted)' }}>
                          📅 {new Date(ev.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          📍 {ev.location}
                        </div>
                      </div>

                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'14px', borderTop:'1px solid var(--border)' }}>
                        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'17px', color:ev.price==0?'var(--green)':'var(--ink)' }}>
                          {ev.price==0 ? 'Gratuit' : `${Number(ev.price).toLocaleString()} XOF`}
                        </span>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'var(--muted)' }}>
                          <div style={{ width:'56px', height:'5px', background:'var(--border)', borderRadius:'3px', overflow:'hidden' }}>
                            <div style={{
                              width:`${Math.min(100,Math.round(ev.registrations_count/ev.capacity*100))}%`,
                              height:'100%',
                              background: Math.round(ev.registrations_count/ev.capacity*100) > 80 ? 'var(--accent)' : 'var(--green)',
                              borderRadius:'3px',
                              transition:'width 1s ease',
                            }}/>
                          </div>
                          <span>{ev.capacity-ev.registrations_count} pl.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── FOOTER CTA ── */}
        {!user && (
          <section className="animate-fadeUp" style={{ background:'var(--ink)', margin:'0 24px 48px', borderRadius:'28px', padding:'clamp(40px,5vw,64px)', textAlign:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:'-100px', left:'50%', transform:'translateX(-50%)', width:'500px', height:'500px', background:'radial-gradient(circle,rgba(255,77,46,0.15) 0%,transparent 65%)', pointerEvents:'none' }}/>
            <div style={{ position:'relative' }}>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:'white', letterSpacing:'-1.5px', marginBottom:'16px' }}>
                Vous organisez des événements ?
              </h2>
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'16px', marginBottom:'32px', maxWidth:'480px', margin:'0 auto 32px', lineHeight:1.7 }}>
                Créez votre compte organisateur et publiez vos événements en quelques minutes.
              </p>
              <Link to="/register" className="btn btn-primary ripple-btn" style={{ fontSize:'16px', padding:'16px 36px', boxShadow:'0 6px 24px rgba(255,77,46,0.45)' }}>
                Commencer gratuitement →
              </Link>
            </div>
          </section>
        )}

      </div>
    </>
  );
}