import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATS = [
  { v:'',           l:'✦ Tous',         color:'#FF4D2E' },
  { v:'conference', l:'🎤 Conférences', color:'#667eea' },
  { v:'concert',    l:'🎵 Concerts',    color:'#f5576c' },
  { v:'atelier',    l:'🎨 Ateliers',    color:'#43e97b' },
  { v:'sport',      l:'⚡ Sport',       color:'#fa709a' },
  { v:'networking', l:'🤝 Networking',  color:'#4facfe' },
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
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [cat, setCat]           = useState('');
  const [menuOpen, setMenu]     = useState(false);
  const [scrollY, setScrollY]   = useState(0);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const p = {};
      if (search) p.search   = search;
      if (cat)    p.category = cat;
      getEvents(p).then(r => setEvents(r.data)).catch(console.error).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, cat]);

  return (
    <>
      <style>{`
        .home-events-grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 28px;
        }
        .event-card-wrap { text-decoration: none; display: block; }
        .event-card {
          background: white; border-radius: 20px; overflow: hidden;
          border: 1px solid var(--border); height: 100%;
          transition: all 0.32s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
        }
        .event-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 28px 64px rgba(0,0,0,0.13);
          border-color: transparent;
        }
        .card-hover-btn {
          position: absolute; bottom: -40px; left: 50%;
          transform: translateX(-50%); white-space: nowrap;
          transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          background: var(--accent); color: white;
          padding: 8px 20px; border-radius: 100px;
          font-weight: 600; font-size: 13px; opacity: 0;
          pointer-events: none;
        }
        .event-card:hover .card-hover-btn { bottom: 16px; opacity: 1; }
        .card-img { transition: transform 0.5s ease; }
        .event-card:hover .card-img { transform: scale(1.04); }
        @media (max-width: 1100px) { .home-events-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px)  { .home-events-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ background:'var(--paper)', minHeight:'100vh' }}>

        {/* ── NAVBAR ── */}
        <nav className="navbar" style={{ boxShadow: scrollY>20 ? '0 4px 24px rgba(0,0,0,0.07)' : 'none', transition:'box-shadow 0.3s' }}>
          <div className="navbar-inner">
            <Link to="/" className="navbar-logo">
              <div className="logo-icon">E</div>
              <span className="logo-text">Eventify</span>
            </Link>

            <div className="nav-links">
              {!user ? (
                <>
                  <Link to="/login"    className="nav-link">Se connecter</Link>
                  <Link to="/register" className="nav-link nav-btn">✨ Créer un compte</Link>
                </>
              ) : (
                <>
                  {user.role==='participant' && <Link to="/my-events" className="nav-link">🎟️ Mes inscriptions</Link>}
                  {user.role==='organizer'   && <Link to="/dashboard"  className="nav-link">📊 Dashboard</Link>}
                  <div className="user-pill" onClick={logout} title="Déconnexion">
                    <div className="user-avatar">{user.first_name?.[0]}{user.last_name?.[0]}</div>
                    <span style={{ fontSize:'13px', fontWeight:600 }}>{user.first_name}</span>
                    <span style={{ fontSize:'10px', color:'var(--muted)' }}>✕</span>
                  </div>
                </>
              )}
            </div>

            <button className="hamburger" onClick={() => setMenu(!menuOpen)}>
              <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none', transition:'all 0.3s' }}/>
              <span style={{ opacity: menuOpen ? 0 : 1, transition:'all 0.3s' }}/>
              <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none', transition:'all 0.3s' }}/>
            </button>
          </div>

          <div className={`mobile-menu ${menuOpen?'open':''}`}>
            {!user ? (
              <>
                <Link to="/login" className="mobile-menu-link" onClick={() => setMenu(false)}>🔑 Se connecter</Link>
                <Link to="/register" className="btn btn-primary" style={{ justifyContent:'center' }} onClick={() => setMenu(false)}>✨ Créer un compte</Link>
              </>
            ) : (
              <>
                <div style={{ padding:'8px 14px', fontSize:'13px', color:'var(--muted)', borderBottom:'1px solid var(--border)', paddingBottom:'12px', marginBottom:'4px' }}>
                  Connecté : <strong style={{ color:'var(--ink)' }}>{user.first_name} {user.last_name}</strong>
                </div>
                {user.role==='participant' && <Link to="/my-events" className="mobile-menu-link" onClick={() => setMenu(false)}>🎟️ Mes inscriptions</Link>}
                {user.role==='organizer'   && <Link to="/dashboard"  className="mobile-menu-link" onClick={() => setMenu(false)}>📊 Dashboard</Link>}
                <button onClick={() => { logout(); setMenu(false); }} className="mobile-menu-link" style={{ color:'var(--accent)' }}>🚪 Déconnexion</button>
              </>
            )}
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ background:'var(--ink)', padding:'clamp(64px,8vw,112px) 24px clamp(80px,10vw,132px)', position:'relative', overflow:'hidden', minHeight:'88vh', display:'flex', alignItems:'center' }}>
          <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
            <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'70vw', height:'70vw', maxWidth:'800px', background:'radial-gradient(circle,rgba(255,77,46,0.12) 0%,transparent 65%)', transform:`translateY(${scrollY*0.3}px)` }}/>
            <div style={{ position:'absolute', bottom:'-20%', left:'10%', width:'50vw', height:'50vw', maxWidth:'600px', background:'radial-gradient(circle,rgba(255,184,0,0.07) 0%,transparent 65%)', transform:`translateY(${-scrollY*0.2}px)` }}/>
            <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)', backgroundSize:'60px 60px' }}/>
            <div className="float-1" style={{ position:'absolute', top:'15%', right:'8%', width:'80px', height:'80px', borderRadius:'24px', background:'rgba(255,77,46,0.08)', border:'1px solid rgba(255,77,46,0.15)' }}/>
            <div className="float-2" style={{ position:'absolute', bottom:'25%', right:'22%', width:'48px', height:'48px', borderRadius:'50%', background:'rgba(255,184,0,0.08)', border:'1px solid rgba(255,184,0,0.15)' }}/>
            <div className="float-3" style={{ position:'absolute', top:'40%', right:'38%', width:'28px', height:'28px', borderRadius:'8px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}/>
          </div>

          <div style={{ maxWidth:'1400px', margin:'0 auto', width:'100%', position:'relative' }}>
            <div className="animate-fadeUp" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,77,46,0.1)', border:'1px solid rgba(255,77,46,0.3)', color:'#FF7A5C', padding:'7px 18px', borderRadius:'100px', fontSize:'13px', fontWeight:600, marginBottom:'32px', animation:'borderPulse 2.5s ease-in-out infinite' }}>
              <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#FF7A5C', display:'inline-block', animation:'ripple 1.5s ease-out infinite' }}/>
              🔥 Plateforme événementielle #1 au Sénégal
            </div>

            <h1 className="animate-fadeUp delay-1" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(40px,7vw,88px)', fontWeight:800, color:'white', lineHeight:1.0, letterSpacing:'-3px', maxWidth:'920px', marginBottom:'28px' }}>
              Découvrez les<br/>
              événements qui{' '}
              <span style={{ color:'var(--accent)', position:'relative', display:'inline-block' }}>
                vous inspirent
                <svg style={{ position:'absolute', bottom:'-6px', left:0, width:'100%' }} height="6" viewBox="0 0 300 6" preserveAspectRatio="none">
                  <path d="M0,5 Q75,0 150,5 Q225,10 300,5" stroke="rgba(255,77,46,0.45)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            <p className="animate-fadeUp delay-2" style={{ color:'rgba(255,255,255,0.45)', fontSize:'clamp(15px,2vw,19px)', maxWidth:'520px', lineHeight:1.75, marginBottom:'48px', fontWeight:300 }}>
              Conférences, concerts, ateliers — trouvez votre prochain événement ou créez le vôtre en quelques minutes.
            </p>

            <div className="animate-fadeUp delay-3" style={{ display:'flex', gap:'14px', flexWrap:'wrap', marginBottom:'72px' }}>
              <a href="#events"
                style={{ background:'var(--accent)', color:'white', padding:'16px 32px', borderRadius:'14px', textDecoration:'none', fontWeight:700, fontSize:'15px', boxShadow:'0 6px 24px rgba(255,77,46,0.45)', transition:'all 0.25s', display:'inline-flex', alignItems:'center', gap:'8px' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 10px 32px rgba(255,77,46,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 6px 24px rgba(255,77,46,0.45)'; }}>
                Explorer les événements →
              </a>
              {!user && (
                <Link to="/register"
                  style={{ background:'rgba(255,255,255,0.07)', color:'white', padding:'16px 32px', borderRadius:'14px', textDecoration:'none', fontWeight:600, fontSize:'15px', border:'1.5px solid rgba(255,255,255,0.15)', transition:'all 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.13)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; }}>
                  Devenir organisateur
                </Link>
              )}
            </div>

            <div className="animate-fadeUp delay-4" style={{ display:'flex', gap:'clamp(28px,5vw,64px)', paddingTop:'40px', borderTop:'1px solid rgba(255,255,255,0.07)', flexWrap:'wrap', rowGap:'20px' }}>
              {[['2 400+','Événements'],['18 000','Participants'],['340','Organisateurs'],['98%','Satisfaction']].map(([n,l],i) => (
                <div key={i}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(24px,3.5vw,36px)', fontWeight:800, color:'white', letterSpacing:'-1.5px' }}>{n}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', marginTop:'5px', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:500 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FILTRES ── */}
        <div style={{ background:'rgba(255,255,255,0.96)', WebkitBackdropFilter:'blur(20px)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)', padding:'clamp(10px,1.5vw,16px) 24px', position:'sticky', top:'64px', zIndex:99, boxShadow: scrollY>100 ? '0 4px 20px rgba(0,0,0,0.05)' : 'none', transition:'box-shadow 0.3s' }}>
          <div style={{ maxWidth:'1400px', margin:'0 auto', display:'flex', gap:'12px', alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ position:'relative', flex:1, minWidth:'180px', maxWidth:'320px' }}>
              <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'14px', pointerEvents:'none' }}>🔍</span>
              <input type="text" placeholder="Rechercher un événement..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width:'100%', padding:'10px 16px 10px 38px', borderRadius:'12px', border:'1.5px solid var(--border)', background:'var(--paper)', fontFamily:'DM Sans,sans-serif', fontSize:'14px', color:'var(--ink)', outline:'none', transition:'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px rgba(255,77,46,0.1)'; }}
                onBlur={e  => { e.target.style.borderColor='var(--border)';  e.target.style.boxShadow='none'; }}/>
            </div>
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
              {CATS.map(c => (
                <button key={c.v} onClick={() => setCat(c.v)} style={{ padding:'8px 18px', borderRadius:'100px', border:`1.5px solid ${cat===c.v?c.color:'var(--border)'}`, background:cat===c.v?`${c.color}18`:'white', color:cat===c.v?c.color:'var(--muted)', fontSize:'13px', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'DM Sans,sans-serif', transition:'all 0.2s', transform:cat===c.v?'scale(1.05)':'scale(1)' }}>
                  {c.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── EVENTS ── */}
        <section id="events" style={{ maxWidth:'1400px', margin:'0 auto', padding:'clamp(32px,4vw,56px) 24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
            <div>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(20px,2.5vw,26px)', fontWeight:800, letterSpacing:'-0.8px' }}>
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

          {loading ? (
            <div className="home-events-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ background:'white', borderRadius:'20px', overflow:'hidden', border:'1px solid var(--border)' }} className="animate-fadeUp">
                  <div className="skeleton" style={{ height:'210px', borderRadius:0 }}/>
                  <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'10px' }}>
                    <div className="skeleton" style={{ height:'11px', width:'60px', borderRadius:'6px' }}/>
                    <div className="skeleton" style={{ height:'22px', width:'85%', borderRadius:'6px' }}/>
                    <div className="skeleton" style={{ height:'14px', width:'65%', borderRadius:'6px' }}/>
                    <div className="skeleton" style={{ height:'14px', width:'50%', borderRadius:'6px' }}/>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 24px', background:'white', borderRadius:'24px', border:'1px solid var(--border)' }} className="animate-fadeUp">
              <div style={{ fontSize:'72px', marginBottom:'20px' }}>📭</div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'22px', fontWeight:800, marginBottom:'10px', letterSpacing:'-0.5px' }}>
                Aucun événement trouvé
              </h3>
              <p style={{ color:'var(--muted)', marginBottom:'28px' }}>
                {search||cat ? 'Essayez une autre recherche ou catégorie' : 'Aucun événement disponible pour le moment. Vérifiez que le backend est lancé.'}
              </p>
              {(search||cat) && (
                <button onClick={() => { setSearch(''); setCat(''); }} className="btn btn-secondary">
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="home-events-grid">
              {events.map((ev, idx) => (
                <Link key={ev.id} to={`/events/${ev.id}`} className="event-card-wrap animate-fadeUp"
                  style={{ animationDelay:`${idx*0.07}s`, opacity:0 }}>
                  <div className="event-card">
                    <div style={{ height:'210px', background:GRADS[ev.id%GRADS.length], display:'flex', alignItems:'center', justifyContent:'center', fontSize:'64px', position:'relative', overflow:'hidden' }}>
                      {ev.image
                        ? <img src={`http://127.0.0.1:8000${ev.image}`} alt={ev.title} className="card-img" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                        : <span className="float-1">🎉</span>
                      }
                      <div className="card-hover-btn">Voir l'événement →</div>
                      <div style={{ position:'absolute', top:'14px', left:'14px', padding:'5px 12px', borderRadius:'100px', fontSize:'11px', fontWeight:600, background:ev.is_private?'rgba(13,13,18,0.75)':'rgba(255,255,255,0.92)', color:ev.is_private?'white':'var(--ink)', WebkitBackdropFilter:'blur(8px)', backdropFilter:'blur(8px)' }}>
                        {ev.is_private?'🔒 Privé':'✅ Public'}
                      </div>
                      {ev.price==0
                        ? <div style={{ position:'absolute', top:'14px', right:'14px', padding:'5px 12px', borderRadius:'100px', fontSize:'11px', fontWeight:700, background:'rgba(29,185,84,0.9)', color:'white' }}>GRATUIT</div>
                        : (ev.capacity-ev.registrations_count<=5 && ev.capacity-ev.registrations_count>0)
                          ? <div style={{ position:'absolute', top:'14px', right:'14px', padding:'5px 12px', borderRadius:'100px', fontSize:'11px', fontWeight:700, background:'rgba(255,77,46,0.9)', color:'white' }}>🔥 {ev.capacity-ev.registrations_count} pl. !</div>
                          : null
                      }
                    </div>
                    <div style={{ padding:'20px' }}>
                      <div style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'1.2px', color:'var(--accent)', marginBottom:'8px' }}>{ev.category}</div>
                      <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'17px', fontWeight:700, letterSpacing:'-0.3px', lineHeight:1.3, marginBottom:'14px', color:'var(--ink)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{ev.title}</h3>
                      <div style={{ display:'flex', flexDirection:'column', gap:'7px', marginBottom:'16px' }}>
                        <div style={{ fontSize:'13px', color:'var(--muted)', display:'flex', alignItems:'center', gap:'8px' }}>📅 {new Date(ev.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</div>
                        <div style={{ fontSize:'13px', color:'var(--muted)', display:'flex', alignItems:'center', gap:'8px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>📍 {ev.location}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'14px', borderTop:'1px solid var(--border)' }}>
                        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'17px', color:ev.price==0?'var(--green)':'var(--ink)' }}>
                          {ev.price==0?'Gratuit':`${Number(ev.price).toLocaleString()} XOF`}
                        </span>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'var(--muted)' }}>
                          <div style={{ width:'56px', height:'5px', background:'var(--border)', borderRadius:'3px', overflow:'hidden' }}>
                            <div style={{ width:`${Math.min(100,Math.round(ev.registrations_count/ev.capacity*100))}%`, height:'100%', background:Math.round(ev.registrations_count/ev.capacity*100)>80?'var(--accent)':'var(--green)', borderRadius:'3px', transition:'width 1s ease' }}/>
                          </div>
                          {ev.capacity-ev.registrations_count} pl.
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
              <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'16px', maxWidth:'480px', margin:'0 auto 32px', lineHeight:1.7 }}>
                Créez votre compte organisateur et publiez vos événements en quelques minutes.
              </p>
              <Link to="/register" className="btn btn-primary" style={{ fontSize:'16px', padding:'16px 36px', boxShadow:'0 6px 24px rgba(255,77,46,0.45)' }}>
                Commencer gratuitement →
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
}