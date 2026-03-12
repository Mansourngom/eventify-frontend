import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, deleteEvent } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';

export default function Dashboard() {
  const { user, logout }              = useAuth();
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try { const r = await getDashboardStats(); setStats(r.data); }
    catch(e) { console.error(e); }
    finally  { setLoading(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Supprimer cet événement ?')) return;
    try { await deleteEvent(id); showToast('Événement supprimé', 'info'); fetchStats(); }
    catch(e) { showToast('Erreur lors de la suppression', 'error'); }
  };

  const NAV = [
    { id:'overview',     icon:'📊', label:"Vue d'ensemble" },
    { id:'events',       icon:'📅', label:'Mes événements' },
    { id:'participants', icon:'👥', label:'Participants' },
  ];

  const SidebarContent = () => (
    <>
      <div className="sidebar-header">
        <Link to="/" className="navbar-logo">
          <div className="logo-icon" style={{ width:'30px', height:'30px', fontSize:'15px' }}>E</div>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'18px', color:'white', letterSpacing:'-0.5px' }}>Eventify</span>
        </Link>
      </div>
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{user?.first_name?.[0]}{user?.last_name?.[0]}</div>
        <div style={{ overflow:'hidden' }}>
          <div style={{ color:'white', fontWeight:600, fontSize:'14px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.first_name} {user?.last_name}</div>
          <div style={{ color:'rgba(255,255,255,0.38)', fontSize:'12px', marginTop:'1px' }}>Organisateur</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu principal</div>
        {NAV.map(item => (
          <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
            className={`sidebar-link ${tab===item.id?'active':''}`}>
            <span className="icon">{item.icon}</span>{item.label}
          </button>
        ))}
        <div className="sidebar-divider"/>
        <div className="sidebar-section-label">Navigation</div>
        <Link to="/" className="sidebar-link" onClick={() => setSidebarOpen(false)}>
          <span className="icon">🏠</span>Accueil
        </Link>
        <button onClick={() => { logout(); setSidebarOpen(false); }} className="sidebar-link">
          <span className="icon">🚪</span>Déconnexion
        </button>
        <div style={{ marginTop:'12px' }}>
          <Link to="/create-event" className="sidebar-create-btn" onClick={() => setSidebarOpen(false)}>
            ➕ Créer un événement
          </Link>
        </div>
      </nav>
    </>
  );

  if (loading) return (
    <div className="sidebar-layout">
      <aside className="sidebar"><SidebarContent/></aside>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'12px' }}>
        <div style={{ width:'32px', height:'32px', border:'3px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
        <span style={{ color:'var(--muted)', fontSize:'14px' }}>Chargement...</span>
      </div>
    </div>
  );

  const avgFill = stats?.events?.length > 0
    ? Math.round(stats.events.reduce((a,e) => a + (e.registrations_count/e.capacity*100), 0) / stats.events.length) : 0;

  return (
    <div className="sidebar-layout">
      <aside className={`sidebar ${sidebarOpen?'open':''}`}><SidebarContent/></aside>

      <div className={`sidebar-overlay ${sidebarOpen?'open':''}`} onClick={() => setSidebarOpen(false)}/>
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen?'✕':'☰'}</button>

      <main className="page-content">

        {/* VUE D'ENSEMBLE */}
        {tab === 'overview' && (
          <div className="animate-fadeUp">
            <div style={{ marginBottom:'32px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'16px' }}>
              <div>
                <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,3vw,30px)', fontWeight:800, letterSpacing:'-0.8px', marginBottom:'6px' }}>
                  Bonjour, {user?.first_name} 👋
                </h1>
                <p style={{ color:'var(--muted)', fontSize:'14px' }}>Voici un aperçu de vos événements</p>
              </div>
              <Link to="/create-event" className="btn btn-primary">➕ Créer un événement</Link>
            </div>

            <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'16px', marginBottom:'32px' }}>
              {[
                { icon:'📅', l:'Événements',        v: stats?.total_events||0 },
                { icon:'👥', l:'Total inscrits',    v: stats?.total_inscrits||0 },
                { icon:'✅', l:'Événements actifs', v: stats?.events?.filter(e=>e.registrations_count>0).length||0 },
                { icon:'🎯', l:'Taux moyen',        v: `${avgFill}%` },
              ].map((s,i) => (
                <div key={i} className={`stat-card animate-fadeUp delay-${i+1}`}>
                  <div style={{ fontSize:'24px', marginBottom:'14px' }}>{s.icon}</div>
                  <div style={{ fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.8px', color:'var(--muted)', marginBottom:'8px', fontWeight:600 }}>{s.l}</div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(24px,3vw,32px)', fontWeight:800, letterSpacing:'-1px' }}>{s.v}</div>
                </div>
              ))}
            </div>

            <EventsTable events={stats?.events} onDelete={handleDelete}/>
          </div>
        )}

        {/* MES ÉVÉNEMENTS */}
        {tab === 'events' && (
          <div className="animate-fadeUp">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px', flexWrap:'wrap', gap:'16px' }}>
              <div>
                <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,3vw,28px)', fontWeight:800, letterSpacing:'-0.8px', marginBottom:'6px' }}>Mes événements</h1>
                <p style={{ color:'var(--muted)', fontSize:'14px' }}>Gérez tous vos événements</p>
              </div>
              <Link to="/create-event" className="btn btn-primary">➕ Créer un événement</Link>
            </div>
            <EventsTable events={stats?.events} onDelete={handleDelete}/>
          </div>
        )}

        {/* PARTICIPANTS */}
        {tab === 'participants' && (
          <div className="animate-fadeUp">
            <div style={{ marginBottom:'28px' }}>
              <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,3vw,28px)', fontWeight:800, letterSpacing:'-0.8px', marginBottom:'6px' }}>Participants</h1>
              <p style={{ color:'var(--muted)', fontSize:'14px' }}>Récapitulatif des inscriptions par événement</p>
            </div>
            <div className="table-wrapper">
              <div className="table-header">
                <h3>Inscriptions par événement</h3>
                <span className="badge badge-green">{stats?.total_inscrits||0} total</span>
              </div>
              {!stats?.events?.length ? (
                <div className="empty-state"><div className="icon">👥</div><h3>Aucun participant</h3><p>Créez des événements pour avoir des participants</p></div>
              ) : (
                <div style={{ overflowX:'auto' }}>
                  <table>
                    <thead><tr><th>Événement</th><th>Date</th><th>Inscrits</th><th>Capacité</th><th>Statut</th></tr></thead>
                    <tbody>
                      {stats.events.map(ev => (
                        <tr key={ev.id}>
                          <td><div style={{ fontWeight:600 }}>{ev.title}</div><div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'2px' }}>{ev.category}</div></td>
                          <td style={{ color:'var(--muted)' }}>{new Date(ev.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}</td>
                          <td style={{ fontWeight:600 }}>{ev.registrations_count}</td>
                          <td style={{ color:'var(--muted)' }}>{ev.capacity}</td>
                          <td><span className={`badge ${ev.registrations_count>=ev.capacity?'badge-red':ev.registrations_count>0?'badge-green':'badge-gray'}`}>{ev.registrations_count>=ev.capacity?'Complet':ev.registrations_count>0?'Actif':'Nouveau'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function EventsTable({ events, onDelete }) {
  if (!events?.length) return (
    <div className="table-wrapper">
      <div className="empty-state" style={{ padding:'60px 24px' }}>
        <div className="icon">📭</div>
        <h3>Aucun événement créé</h3>
        <p>Commencez par créer votre premier événement</p>
        <Link to="/create-event" className="btn btn-primary" style={{ marginTop:'8px' }}>➕ Créer un événement</Link>
      </div>
    </div>
  );
  return (
    <div className="table-wrapper">
      <div className="table-header">
        <h3>Performance des événements</h3>
        <span className="badge badge-gray">{events.length} événement{events.length>1?'s':''}</span>
      </div>
      <div style={{ overflowX:'auto' }}>
        <table>
          <thead><tr><th>Événement</th><th>Date</th><th>Remplissage</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            {events.map(ev => {
              const pct = Math.round(ev.registrations_count/ev.capacity*100);
              return (
                <tr key={ev.id}>
                  <td><div style={{ fontWeight:600 }}>{ev.title}</div><div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'2px' }}>{ev.category}</div></td>
                  <td style={{ color:'var(--muted)', whiteSpace:'nowrap' }}>{new Date(ev.date).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'})}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                      <div className="progress-bar" style={{ width:'60px' }}>
                        <div className="progress-fill" style={{ width:`${pct}%`, background:pct>80?'var(--accent)':'var(--green)' }}/>
                      </div>
                      <span style={{ fontSize:'13px', fontWeight:500, whiteSpace:'nowrap' }}>{ev.registrations_count}/{ev.capacity}</span>
                    </div>
                  </td>
                  <td><span className={`badge ${ev.registrations_count>=ev.capacity?'badge-red':ev.registrations_count>0?'badge-green':'badge-gray'}`}>{ev.registrations_count>=ev.capacity?'Complet':ev.registrations_count>0?'Actif':'Nouveau'}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:'8px' }}>
                      <Link to={`/events/${ev.id}`} className="btn btn-secondary" style={{ padding:'6px 12px', fontSize:'12px' }}>Voir</Link>
                      <button onClick={() => onDelete(ev.id)} className="btn btn-danger" style={{ padding:'6px 12px', fontSize:'12px' }}>Suppr.</button>
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