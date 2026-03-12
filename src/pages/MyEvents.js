import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyRegistrations, cancelRegistration } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';

const GRADS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
];

export default function MyEvents() {
  const { user, logout } = useAuth();
  const [regs, setRegs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('all');
  const [menuOpen, setMenu]     = useState(false);

  useEffect(() => {
    getMyRegistrations().then(r => setRegs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCancel = async id => {
    if (!window.confirm('Annuler cette inscription ?')) return;
    try {
      await cancelRegistration(id);
      setRegs(regs.filter(r => r.id !== id));
      showToast('Inscription annulée', 'info');
    } catch(e) { console.error(e); showToast("Erreur lors de l'annulation", 'error'); }
  };

  const now      = new Date();
  const upcoming = regs.filter(r => new Date(r.event.date) >= now);
  const past     = regs.filter(r => new Date(r.event.date) <  now);
  const shown    = tab==='upcoming' ? upcoming : tab==='past' ? past : regs;

  return (
    <div style={{ backgroundColor:'var(--paper)', minHeight:'100vh' }}>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            <div className="logo-icon">E</div>
            <span className="logo-text">Eventify</span>
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">🏠 Accueil</Link>
            <div className="user-pill" onClick={logout}>
              <div className="user-avatar">{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
              <span style={{ fontSize:'13px', fontWeight:600 }}>{user?.first_name}</span>
              <span style={{ fontSize:'10px', color:'var(--muted)' }}>✕</span>
            </div>
          </div>
          <button className="hamburger" onClick={() => setMenu(!menuOpen)}>
            <span/><span/><span/>
          </button>
        </div>
        <div className={`mobile-menu ${menuOpen?'open':''}`}>
          <Link to="/" className="mobile-menu-link" onClick={() => setMenu(false)}>🏠 Accueil</Link>
          <button onClick={() => { logout(); setMenu(false); }} className="mobile-menu-link" style={{ color:'var(--accent)' }}>🚪 Déconnexion</button>
        </div>
      </nav>

      <div style={{ background:'var(--ink)', padding:'clamp(40px,6vw,64px) 24px clamp(48px,8vw,80px)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-150px', right:'-100px', width:'400px', height:'400px', pointerEvents:'none', background:'radial-gradient(circle,rgba(255,77,46,0.12) 0%,transparent 70%)' }}/>
        <div style={{ maxWidth:'1400px', margin:'0 auto', position:'relative' }}>
          <div className="animate-fadeUp" style={{ fontSize:'11px', textTransform:'uppercase', letterSpacing:'2px', color:'rgba(255,255,255,0.38)', marginBottom:'12px', fontWeight:600 }}>MON ESPACE</div>
          <h1 className="animate-fadeUp delay-1" style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(32px,5vw,48px)', fontWeight:800, color:'white', letterSpacing:'-1.5px', marginBottom:'8px' }}>Mes inscriptions</h1>
          <p className="animate-fadeUp delay-2" style={{ color:'rgba(255,255,255,0.45)', fontSize:'16px', fontWeight:300 }}>Tous les événements auxquels vous participez</p>
          <div className="animate-fadeUp delay-3" style={{ display:'flex', gap:'clamp(24px,4vw,48px)', marginTop:'32px', flexWrap:'wrap' }}>
            {[['Total',regs.length],['À venir',upcoming.length],['Passés',past.length]].map(([l,n],i) => (
              <div key={i}>
                <div style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,3vw,32px)', fontWeight:800, color:'white', letterSpacing:'-1px' }}>{n}</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.38)', marginTop:'4px', textTransform:'uppercase', letterSpacing:'1px' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'clamp(24px,4vw,40px) 24px' }}>
        <div className="tabs">
          {[['all',`Tous (${regs.length})`],['upcoming',`À venir (${upcoming.length})`],['past',`Passés (${past.length})`]].map(([id,l]) => (
            <button key={id} onClick={() => setTab(id)} className={`tab-btn ${tab===id?'active':''}`}>{l}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:'120px', borderRadius:'20px' }}/>)}
          </div>
        ) : shown.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🎟️</div>
            <h3>Aucune inscription</h3>
            <p>{tab==='upcoming'?"Vous n'avez aucun événement à venir.":tab==='past'?"Vous n'avez aucun événement passé.":"Vous n'êtes inscrit(e) à aucun événement."}</p>
            <Link to="/" className="btn btn-primary">Découvrir les événements</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {shown.map((reg, i) => {
              const isPast = new Date(reg.event.date) < now;
              const grad   = GRADS[reg.event.id % GRADS.length];
              return (
                <div key={reg.id} className={`animate-fadeUp delay-${Math.min(i+1,4)}`}
                  style={{ background:'white', border:'1px solid var(--border)', borderRadius:'20px', overflow:'hidden', display:'flex', transition:'all 0.25s', opacity:isPast?0.78:1 }}
                  onMouseEnter={e => { if (!isPast) { e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor='transparent'; }}}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor='var(--border)'; }}>
                  <div style={{ width:'clamp(100px,15vw,140px)', flexShrink:0, background:grad, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'44px' }}>
                    {reg.event.image ? <img src={`http://127.0.0.1:8000${reg.event.image}`} alt={reg.event.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <span>🎉</span>}
                    {isPast && <div style={{ position:'absolute', inset:0, background:'rgba(13,13,18,0.55)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'1px' }}>Terminé</div>}
                  </div>
                  <div style={{ flex:1, padding:'clamp(16px,2vw,24px) clamp(16px,2vw,28px)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', flexWrap:'wrap' }}>
                    <div>
                      <div style={{ fontSize:'11px', fontWeight:600, textTransform:'uppercase', letterSpacing:'1px', color:'var(--accent)', marginBottom:'6px' }}>{reg.event.category}</div>
                      <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'clamp(15px,2vw,18px)', letterSpacing:'-0.3px', marginBottom:'8px' }}>{reg.event.title}</h3>
                      <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
                        <span style={{ fontSize:'13px', color:'var(--muted)' }}>📅 {new Date(reg.event.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</span>
                        <span style={{ fontSize:'13px', color:'var(--muted)' }}>📍 {reg.event.location}</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
                      <span className={`badge ${isPast?'badge-gray':'badge-green'}`}>{isPast?'⏰ Terminé':'✓ Inscrit(e)'}</span>
                      <Link to={`/events/${reg.event.id}`} className="btn btn-secondary" style={{ padding:'8px 16px', fontSize:'13px' }}>Voir →</Link>
                      {!isPast && <button onClick={() => handleCancel(reg.id)} className="btn btn-danger" style={{ padding:'8px 16px', fontSize:'13px' }}>Annuler</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}