import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getDashboardStats, deleteEvent } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { id:'overview',     icon:'📊', label:"Vue d'ensemble" },
  { id:'events',       icon:'📅', label:'Mes événements' },
  { id:'participants', icon:'👥', label:'Participants' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('overview');
  const [sidebarOpen, setSidebar] = useState(false);

  useEffect(() => {
    getDashboardStats().then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet événement définitivement ?')) return;
    try { await deleteEvent(id); getDashboardStats().then(r => setStats(r.data)); }
    catch(e) { console.error(e); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ width:'40px', height:'40px', border:'3px solid rgba(255,255,255,0.1)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const totalEvents  = stats?.total_events  || 0;
  const totalInscrits = stats?.total_inscrits || 0;
  const events       = stats?.events || [];
  const activeEvents = events.filter(e => e.registrations_count > 0).length;
  const avgFill      = events.length > 0
    ? Math.round(events.reduce((a,e) => a + e.registrations_count/e.capacity*100, 0) / events.length)
    : 0;

  return (
    <>
      <style>{`
        .dash-layout { display: flex; min-height: 100vh; }
        .dash-sidebar {
          width: 260px; background: var(--sidebar);
          display: flex; flex-direction: column;
          position: fixed; top: 0; left: 0; height: 100vh;
          z-index: 200; transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          overflow-y: auto;
        }
        .dash-main { margin-left: 260px; flex: 1; background: var(--paper); min-height: 100vh; }
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 199; backdrop-filter: blur(2px); }
        .dash-topbar { display: none; background: rgba(247,245,240,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); height: 56px; position: sticky; top: 0; z-index: 100; align-items: center; padding: 0 20px; justify-content: space-between; }
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }
        .table-wrap { overflow-x: auto; }
        @media (max-width: 768px) {
          .dash-sidebar { transform: translateX(-100%); }
          .dash-sidebar.open { transform: translateX(0); }
          .sidebar-overlay.open { display: block; }
          .dash-main { margin-left: 0; }
          .dash-topbar { display: flex; }
          .stats-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dash-layout">
        {/* ── OVERLAY ── */}
        <div className={`sidebar-overlay ${sidebarOpen?'open':''}`} onClick={() => setSidebar(false)}/>

        {/* ── SIDEBAR ── */}
        <aside className={`dash-sidebar ${sidebarOpen?'open':''}`}>
          {/* LOGO */}
          <div style={{ padding:'22px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div className="logo">
              <div className="logo-icon">E</div>
              <span className="logo-text" style={{ color:'white' }}>Eventify</span>
            </div>
            <button onClick={() => setSidebar(false)} style={{ display:'none', background:'none', border:'none', color:'rgba(255,255,255,0.5)', cursor:'pointer', fontSize:'20px', lineHeight:1 }} className="close-sidebar">✕</button>
          </div>

          {/* USER */}
          <div style={{ padding:'18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'42px', height:'42px', borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'15px', fontFamily:'Syne,sans-serif', flexShrink:0 }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <div style={{ color:'white', fontWeight:600, fontSize:'14px', lineHeight:1.3 }}>{user?.first_name} {user?.last_name}</div>
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px', marginTop:'2px' }}>Organisateur ✓</div>
              </div>
            </div>
          </div>

          {/* NAV */}
          <div style={{ padding:'16px 14px', flex:1 }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'1.5px', color:'rgba(255,255,255,0.28)', marginBottom:'8px', padding:'0 6px', fontWeight:600 }}>Navigation</div>

            {NAV.map(item => (
              <button key={item.id} onClick={() => { setTab(item.id); setSidebar(false); }}
                className={`sidebar-link ${tab===item.id?'active':''}`}>
                <div className="link-icon">{item.icon}</div>
                {item.label}
              </button>
            ))}

            <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', margin:'14px 0' }}/>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'1.5px', color:'rgba(255,255,255,0.28)', marginBottom:'8px', padding:'0 6px', fontWeight:600 }}>Actions</div>

            <Link to="/create-event" className="sidebar-link" onClick={() => setSidebar(false)}>
              <div className="link-icon">➕</div>
              Créer un événement
            </Link>

            <Link to="/" className="sidebar-link" onClick={() => setSidebar(false)}>
              <div className="link-icon">🏠</div>
              Accueil
            </Link>

            <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', margin:'14px 0' }}/>

            <button onClick={logout} className="sidebar-link" style={{ color:'rgba(255,100,80,0.8)' }}>
              <div className="link-icon" style={{ background:'rgba(255,77,46,0.1)' }}>🚪</div>
              Déconnexion
            </button>
          </div>

          {/* BOTTOM */}
          <div style={{ padding:'16px 14px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ background:'rgba(255,77,46,0.1)', border:'1px solid rgba(255,77,46,0.2)', borderRadius:'12px', padding:'14px' }}>
              <div style={{ color:'white', fontSize:'13px', fontWeight:600, marginBottom:'4px' }}>🚀 Nouveau</div>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px', lineHeight:1.5 }}>Créez un événement et touchez plus de participants</div>
              <Link to="/create-event" style={{ display:'block', marginTop:'10px', background:'var(--accent)', color:'white', padding:'8px 14px', borderRadius:'8px', textDecoration:'none', fontSize:'12px', fontWeight:600, textAlign:'center' }}>
                Créer maintenant
              </Link>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="dash-main">
          {/* TOPBAR MOBILE */}
          <div className="dash-topbar">
            <button onClick={() => setSidebar(true)} style={{ background:'none', border:'none', cursor:'pointer', padding:'6px', display:'flex', flexDirection:'column', gap:'5px' }}>
              {[0,1,2].map(i => <div key={i} style={{ width:'22px', height:'2px', background:'var(--ink)', borderRadius:'2px' }}/>)}
            </button>
            <div className="logo">
              <div className="logo-icon">E</div>
              <span className="logo-text">Eventify</span>
            </div>
            <div style={{ width:'34px' }}/>
          </div>

          <div style={{ padding:'clamp(24px,4vw,40px)' }}>

            {/* ── VUE D'ENSEMBLE ── */}
            {tab === 'overview' && (
              <div className="animate-fadeIn">
                <div style={{ marginBottom:'28px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'16px' }}>
                  <div>
                    <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,3vw,28px)', fontWeight:800, letterSpacing:'-0.8px', marginBottom:'6px' }}>
                      Bonjour, {user?.first_name} 👋
                    </h1>
                    <p style={{ color:'var(--muted)', fontSize:'14px' }}>Voici un aperçu de vos événements et performances</p>
                  </div>
                  <Link to="/create-event" className="btn-primary">➕ Créer un événement</Link>
                </div>

                {/* STATS */}
                <div className="stats-grid" style={{ marginBottom:'32px' }}>
                  {[
                    { icon:'📅', label:'Événements',     value:totalEvents,  sub:'Total créés',        color:'#667eea' },
                    { icon:'👥', label:'Inscrits',        value:totalInscrits, sub:'Total inscriptions', color:'var(--green)' },
                    { icon:'✅', label:'Actifs',          value:activeEvents, sub:'Avec inscrits',       color:'var(--accent2)' },
                    { icon:'🎯', label:'Taux de remplissage', value:`${avgFill}%`, sub:'Moyenne',        color:'var(--accent)' },
                  ].map((s,i) => (
                    <div key={i} className="card animate-fadeUp" style={{ padding:'22px', animationDelay:`${i*0.08}s`, opacity:0 }}>
                      <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', marginBottom:'14px' }}>{s.icon}</div>
                      <div style={{ fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.8px', color:'var(--muted)', fontWeight:600, marginBottom:'8px' }}>{s.label}</div>
                      <div style={{ fontFamily:'Syne,sans-serif', fontSize:'30px', fontWeight:800, letterSpacing:'-1px', color:s.color }}>{s.value}</div>
                      <div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'4px' }}>{s.sub}</div>
                    </div>
                  ))}
                </div>

                <EventsTable events={events} onDelete={handleDelete} />
              </div>
            )}

            {/* ── MES ÉVÉNEMENTS ── */}
            {tab === 'events' && (
              <div className="animate-fadeIn">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', flexWrap:'wrap', gap:'16px' }}>
                  <div>
                    <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,3vw,28px)', fontWeight:800, letterSpacing:'-0.8px', marginBottom:'6px' }}>Mes événements</h1>
                    <p style={{ color:'var(--muted)', fontSize:'14px' }}>Gérez tous vos événements depuis ici</p>
                  </div>
                  <Link to="/create-event" className="btn-primary">➕ Créer un événement</Link>
                </div>
                <EventsTable events={events} onDelete={handleDelete} />
              </div>
            )}

            {/* ── PARTICIPANTS ── */}
            {tab === 'participants' && (
              <div className="animate-fadeIn">
                <div style={{ marginBottom:'28px' }}>
                  <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,3vw,28px)', fontWeight:800, letterSpacing:'-0.8px', marginBottom:'6px' }}>Participants</h1>
                  <p style={{ color:'var(--muted)', fontSize:'14px' }}>Taux de remplissage de vos événements</p>
                </div>

                <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'20px', overflow:'hidden' }}>
                  <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'17px' }}>Aperçu des inscriptions</div>
                  </div>
                  {events.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'60px', color:'var(--muted)' }}>
                      <div style={{ fontSize:'48px', marginBottom:'12px' }}>👥</div>
                      <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700 }}>Aucun événement</div>
                    </div>
                  ) : (
                    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:'16px' }}>
                      {events.map(ev => {
                        const pct = Math.min(100, Math.round(ev.registrations_count/ev.capacity*100));
                        return (
                          <div key={ev.id} style={{ display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
                            <div style={{ flex:'1', minWidth:'150px' }}>
                              <div style={{ fontWeight:600, fontSize:'14px', marginBottom:'4px' }}>{ev.title}</div>
                              <div style={{ fontSize:'12px', color:'var(--muted)' }}>{ev.registrations_count} / {ev.capacity} inscrits</div>
                            </div>
                            <div style={{ flex:'2', minWidth:'120px' }}>
                              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                                <span style={{ fontSize:'12px', color:'var(--muted)' }}>{pct}%</span>
                              </div>
                              <div style={{ height:'8px', background:'var(--cream)', borderRadius:'4px', overflow:'hidden' }}>
                                <div style={{ width:`${pct}%`, height:'100%', background:pct>80?'var(--accent)':pct>50?'var(--accent2)':'var(--green)', borderRadius:'4px', transition:'width 0.6s ease' }}/>
                              </div>
                            </div>
                            <span className={`badge ${pct>=100?'badge-red':pct>0?'badge-green':'badge-gray'}`}>
                              {pct>=100?'Complet':pct>0?'Actif':'Nouveau'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .close-sidebar { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function EventsTable({ events, onDelete }) {
  if (!events || events.length === 0) return (
    <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'20px', textAlign:'center', padding:'64px 24px' }}>
      <div style={{ fontSize:'48px', marginBottom:'16px' }}>📭</div>
      <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:'20px', fontWeight:700, marginBottom:'8px' }}>Aucun événement créé</h3>
      <p style={{ color:'var(--muted)', marginBottom:'24px' }}>Commencez par créer votre premier événement</p>
      <Link to="/create-event" className="btn-primary">➕ Créer un événement</Link>
    </div>
  );

  return (
    <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'20px', overflow:'hidden' }}>
      <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'17px' }}>Performance des événements</div>
        <span style={{ background:'var(--cream)', padding:'4px 12px', borderRadius:'100px', fontSize:'13px', fontWeight:600 }}>{events.length} événement{events.length!==1?'s':''}</span>
      </div>
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:'600px' }}>
          <thead>
            <tr style={{ background:'var(--paper)' }}>
              {['Événement','Date','Inscrits','Statut','Actions'].map(h => (
                <th key={h} style={{ textAlign:'left', padding:'12px 20px', fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.8px', color:'var(--muted)', fontWeight:600, borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map(ev => {
              const pct = Math.min(100, Math.round(ev.registrations_count/ev.capacity*100));
              return (
                <tr key={ev.id} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--paper)'}
                  onMouseLeave={e => e.currentTarget.style.background='white'}>
                  <td style={{ padding:'16px 20px' }}>
                    <div style={{ fontWeight:600, fontSize:'14px' }}>{ev.title}</div>
                    <div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'2px', textTransform:'capitalize' }}>{ev.category}</div>
                  </td>
                  <td style={{ padding:'16px 20px', fontSize:'14px', color:'var(--muted)', whiteSpace:'nowrap' }}>
                    {new Date(ev.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}
                  </td>
                  <td style={{ padding:'16px 20px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <span style={{ fontSize:'14px', fontWeight:500 }}>{ev.registrations_count}/{ev.capacity}</span>
                      <div style={{ width:'56px', height:'4px', background:'var(--border)', borderRadius:'2px', overflow:'hidden' }}>
                        <div style={{ width:`${pct}%`, height:'100%', background:'var(--accent)', borderRadius:'2px' }}/>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'16px 20px' }}>
                    <span className={`badge ${pct>=100?'badge-red':ev.registrations_count>0?'badge-green':'badge-gray'}`}>
                      {pct>=100?'Complet':ev.registrations_count>0?'Actif':'Nouveau'}
                    </span>
                  </td>
                  <td style={{ padding:'16px 20px' }}>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                      <Link to={`/events/${ev.id}`} style={{ padding:'6px 14px', border:'1.5px solid var(--border)', borderRadius:'8px', fontSize:'12px', fontWeight:600, color:'var(--ink)', textDecoration:'none', whiteSpace:'nowrap', transition:'all 0.15s' }}>Voir</Link>
                      <button onClick={() => onDelete(ev.id)}
                        style={{ padding:'6px 14px', border:'1.5px solid rgba(255,77,46,0.2)', borderRadius:'8px', fontSize:'12px', fontWeight:600, color:'var(--accent)', background:'rgba(255,77,46,0.05)', cursor:'pointer', fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap', transition:'all 0.15s' }}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}