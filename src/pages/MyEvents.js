import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyRegistrations, cancelRegistration } from '../services/api';
import { useAuth } from '../context/AuthContext';

const GRADS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
];

export default function MyEvents() {
  const { user, logout }  = useAuth();
  const [regs, setRegs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]     = useState('all');

  useEffect(() => {
    getMyRegistrations().then(r => setRegs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler cette inscription ?')) return;
    try { await cancelRegistration(id); setRegs(regs.filter(r => r.id !== id)); }
    catch(e) { console.error(e); }
  };

  const now      = new Date();
  const upcoming = regs.filter(r => new Date(r.event.date) >= now);
  const past     = regs.filter(r => new Date(r.event.date) <  now);
  const shown    = tab==='upcoming' ? upcoming : tab==='past' ? past : regs;

  return (
    <>
      <style>{`
        .myev-card {
          background: white; border: 1px solid var(--border);
          border-radius: 20px; overflow: hidden;
          display: flex; transition: all 0.25s;
        }
        .myev-card:hover {
          box-shadow: 0 10px 36px rgba(0,0,0,0.08);
          transform: translateY(-2px); border-color: transparent;
        }
        .myev-img { width: 130px; flex-shrink: 0; }
        .myev-body { flex: 1; padding: 22px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .myev-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        @media (max-width: 640px) {
          .myev-card { flex-direction: column; }
          .myev-img  { width: 100%; height: 140px; }
          .myev-body { padding: 16px; }
        }
      `}</style>

      <div style={{ background:'var(--paper)', minHeight:'100vh' }}>
        {/* NAVBAR */}
        <nav className="navbar">
          <div className="navbar-inner">
            <Link to="/" className="logo">
              <div className="logo-icon">E</div>
              <span className="logo-text">Eventify</span>
            </Link>
            <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
              <Link to="/" style={{ color:'var(--muted)', textDecoration:'none', fontSize:'14px', fontWeight:500 }}>Événements</Link>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 14px 6px 6px', background:'white', border:'1.5px solid var(--border)', borderRadius:'100px', cursor:'pointer' }} onClick={logout}>
                <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'11px' }}>
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <span style={{ fontSize:'13px', fontWeight:600 }}>{user?.first_name}</span>
              </div>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <div style={{ background:'var(--ink)', padding:'clamp(40px,6vw,64px) 24px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-150px', right:'-100px', width:'400px', height:'400px', background:'radial-gradient(circle,rgba(255,77,46,0.12) 0%,transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ maxWidth:'1400px', margin:'0 auto', position:'relative' }}>
            <div style={{ fontSize:'11px', textTransform:'uppercase', letterSpacing:'2px', color:'rgba(255,255,255,0.4)', marginBottom:'10px', fontWeight:600 }}>MON ESPACE</div>
            <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(28px,5vw,44px)', fontWeight:800, color:'white', letterSpacing:'-1.5px', marginBottom:'8px' }}>Mes inscriptions</h1>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'16px', fontWeight:300, marginBottom:'32px' }}>Tous les événements auxquels vous participez</p>

            <div style={{ display:'flex', gap:'32px', flexWrap:'wrap' }}>
              {[[regs.length,'Total'],[upcoming.length,'À venir'],[past.length,'Passés']].map(([n,l],i) => (
                <div key={i}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,3vw,30px)', fontWeight:800, color:'white', letterSpacing:'-0.5px' }}>{n}</div>
                  <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.38)', marginTop:'3px', textTransform:'uppercase', letterSpacing:'1px' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABS + CONTENU */}
        <div style={{ maxWidth:'1400px', margin:'0 auto', padding:'clamp(24px,4vw,40px) 24px' }}>
          {/* TABS */}
          <div style={{ display:'flex', gap:'4px', marginBottom:'28px', borderBottom:'1px solid var(--border)', paddingBottom:'0' }}>
            {[['all',`Tous (${regs.length})`],['upcoming',`À venir (${upcoming.length})`],['past',`Passés (${past.length})`]].map(([id,label]) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ padding:'10px 20px', background:'none', border:'none', borderBottom:`2.5px solid ${tab===id?'var(--accent)':'transparent'}`, color:tab===id?'var(--accent)':'var(--muted)', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:'DM Sans,sans-serif', marginBottom:'-1px', transition:'all 0.2s' }}>
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height:'120px', borderRadius:'20px' }}/>)}
            </div>
          ) : shown.length === 0 ? (
            <div style={{ textAlign:'center', padding:'72px 24px', background:'white', borderRadius:'20px', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:'56px', marginBottom:'16px' }}>🎟️</div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'20px', fontWeight:700, marginBottom:'8px' }}>Aucune inscription</h3>
              <p style={{ color:'var(--muted)', marginBottom:'24px' }}>Vous n'êtes inscrit(e) à aucun événement</p>
              <Link to="/" className="btn-primary">Découvrir les événements</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {shown.map((reg, idx) => {
                const isPast = new Date(reg.event.date) < now;
                const grad   = GRADS[reg.event.id % GRADS.length];
                return (
                  <div key={reg.id} className="myev-card animate-fadeUp" style={{ animationDelay:`${idx*0.07}s`, opacity:0, opacity:isPast?0.75:1 }}>
                    <div className="myev-img" style={{ background:grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'40px', position:'relative' }}>
                      {reg.event.image
                        ? <img src={`http://127.0.0.1:8000${reg.event.image}`} alt={reg.event.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                        : <span>🎉</span>
                      }
                      {isPast && <div style={{ position:'absolute', inset:0, background:'rgba(13,13,18,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'1.5px' }}>Terminé</div>}
                    </div>
                    <div className="myev-body">
                      <div>
                        <div style={{ fontSize:'11px', fontWeight:600, textTransform:'uppercase', letterSpacing:'1px', color:'var(--accent)', marginBottom:'5px' }}>{reg.event.category}</div>
                        <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'17px', letterSpacing:'-0.3px', marginBottom:'10px' }}>{reg.event.title}</h3>
                        <div style={{ display:'flex', gap:'18px', flexWrap:'wrap' }}>
                          <span style={{ fontSize:'13px', color:'var(--muted)' }}>📅 {new Date(reg.event.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</span>
                          <span style={{ fontSize:'13px', color:'var(--muted)' }}>📍 {reg.event.location}</span>
                        </div>
                      </div>
                      <div className="myev-actions">
                        <span className={`badge ${isPast?'badge-gray':'badge-green'}`}>
                          {isPast?'⏰ Terminé':'✓ Inscrit(e)'}
                        </span>
                        <Link to={`/events/${reg.event.id}`} className="btn-secondary" style={{ padding:'8px 16px', fontSize:'13px' }}>Voir →</Link>
                        {!isPast && (
                          <button onClick={() => handleCancel(reg.id)}
                            style={{ padding:'8px 16px', borderRadius:'10px', border:'1.5px solid rgba(255,77,46,0.2)', fontSize:'13px', fontWeight:600, color:'var(--accent)', background:'rgba(255,77,46,0.06)', cursor:'pointer', fontFamily:'DM Sans,sans-serif', transition:'all 0.2s' }}>
                            Annuler
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}