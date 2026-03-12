import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEventById, registerToEvent } from '../services/api';
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

export default function EventDetail() {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [message, setMessage]       = useState('');
  const [error, setError]           = useState('');

  useEffect(() => { fetchEvent(); }, [id]);

  const fetchEvent = async () => {
    try { const r = await getEventById(id); setEvent(r.data); }
    catch(e) { console.error(e); }
    finally  { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!user) { navigate('/login'); return; }
    setRegLoading(true); setError(''); setMessage('');
    try {
      await registerToEvent(id);
      setMessage('🎉 Inscription confirmée !');
      showToast('Inscription confirmée ! À bientôt 🎟️', 'success');
      fetchEvent();
    } catch(err) {
      const msg = err.response?.data?.error || "Erreur lors de l'inscription";
      setError(msg);
      showToast(msg, 'error');
    } finally { setRegLoading(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', flexDirection:'column', gap:'12px' }}>
      <div style={{ width:'32px', height:'32px', border:'3px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
      <span style={{ color:'var(--muted)', fontSize:'14px' }}>Chargement...</span>
    </div>
  );

  if (!event) return (
    <div className="empty-state" style={{ marginTop:'100px' }}>
      <div className="icon">🔍</div>
      <h3>Événement introuvable</h3>
      <p>Cet événement n'existe pas ou a été supprimé.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop:'16px' }}>Retour à l'accueil</Link>
    </div>
  );

  const pct       = Math.round((event.registrations_count / event.capacity) * 100);
  const remaining = event.capacity - event.registrations_count;
  const isFull    = remaining <= 0;
  const grad      = GRADS[event.id % GRADS.length];

  return (
    <>
      <style>{`
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 40px;
          align-items: start;
        }
        .info-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; margin-bottom: 28px; }
        @media (max-width: 960px) { .detail-grid { grid-template-columns: 1fr; } }
        @media (max-width: 540px) { .info-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ backgroundColor:'var(--paper)', minHeight:'100vh' }}>
        <nav className="navbar">
          <div className="navbar-inner">
            <Link to="/" className="navbar-logo">
              <div className="logo-icon">E</div>
              <span className="logo-text">Eventify</span>
            </Link>
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'14px', color:'var(--muted)', textDecoration:'none', fontWeight:500, padding:'8px 14px', borderRadius:'10px', border:'1.5px solid var(--border)', background:'white', transition:'all 0.2s' }}>
              ← Retour aux événements
            </Link>
          </div>
        </nav>

        <div style={{ width:'100%', height:'clamp(280px,40vw,440px)', background:grad, position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'100px' }}>
          {event.image ? <img src={`http://127.0.0.1:8000${event.image}`} alt={event.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <span>🎉</span>}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,transparent 35%,rgba(13,13,18,0.75) 100%)' }}/>
          <span className="badge" style={{ position:'absolute', top:'24px', left:'24px', background:'rgba(255,255,255,0.92)', WebkitBackdropFilter:'blur(8px)', backdropFilter:'blur(8px)', color:'var(--ink)', fontSize:'12px' }}>{event.category}</span>
          {event.is_private && <span className="badge badge-gray" style={{ position:'absolute', top:'24px', right:'24px', WebkitBackdropFilter:'blur(8px)', backdropFilter:'blur(8px)' }}>🔒 Privé</span>}
          <h1 className="animate-fadeUp" style={{ position:'absolute', bottom:'28px', left:'28px', right:'28px', fontFamily:'Syne,sans-serif', fontSize:'clamp(22px,4vw,48px)', fontWeight:800, color:'white', letterSpacing:'-1px', lineHeight:1.1 }}>{event.title}</h1>
        </div>

        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'clamp(24px,4vw,48px) 24px' }}>
          <div className="detail-grid">
            <div className="animate-fadeUp">
              <div className="info-grid">
                {[
                  { icon:'📅', l:'Date',   v: new Date(event.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) },
                  { icon:'⏰', l:'Heure',  v: new Date(event.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) },
                  { icon:'📍', l:'Lieu',   v: event.location },
                  { icon:'👥', l:'Places', v: `${event.registrations_count} / ${event.capacity} inscrits` },
                ].map((info,i) => (
                  <div key={i} className="stat-card">
                    <div style={{ fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.8px', color:'var(--muted)', marginBottom:'8px', fontWeight:600 }}>{info.icon} {info.l}</div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'15px', textTransform:info.l==='Date'?'capitalize':'none' }}>{info.v}</div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding:'28px', marginBottom:'20px' }}>
                <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'20px', marginBottom:'16px', paddingBottom:'16px', borderBottom:'1px solid var(--border)' }}>À propos de cet événement</h2>
                <p style={{ color:'var(--muted)', lineHeight:1.8, fontSize:'15px', whiteSpace:'pre-line' }}>{event.description}</p>
              </div>

              <div className="card" style={{ padding:'24px' }}>
                <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'17px', marginBottom:'16px' }}>Organisateur</h2>
                <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                  <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'18px', fontFamily:'Syne,sans-serif', flexShrink:0 }}>
                    {event.organizer?.first_name?.[0]}{event.organizer?.last_name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'16px' }}>{event.organizer?.first_name} {event.organizer?.last_name}</div>
                    <div style={{ color:'var(--muted)', fontSize:'13px', marginTop:'3px' }}>✓ Organisateur certifié Eventify</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fadeUp delay-2" style={{ position:'sticky', top:'80px' }}>
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'24px', overflow:'hidden', boxShadow:'0 8px 40px rgba(0,0,0,0.08)' }}>
                <div style={{ padding:'28px', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:'38px', fontWeight:800, letterSpacing:'-1.5px', color:event.price==0?'var(--green)':'var(--ink)', marginBottom:'4px' }}>
                    {event.price==0 ? 'Gratuit' : `${Number(event.price).toLocaleString()} XOF`}
                  </div>
                  <div style={{ color:'var(--muted)', fontSize:'14px' }}>
                    {isFull ? '😔 Complet' : `🔥 ${remaining} place${remaining>1?'s':''} restante${remaining>1?'s':''}`}
                  </div>
                </div>
                <div style={{ padding:'20px 28px', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                    <span style={{ fontSize:'12px', color:'var(--muted)', fontWeight:500 }}>Taux de remplissage</span>
                    <span style={{ fontSize:'12px', fontWeight:700, color:pct>80?'var(--accent)':'var(--green)' }}>{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${pct}%`, background:pct>80?'linear-gradient(90deg,var(--accent2),var(--accent))':'var(--green)' }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:'8px', fontSize:'12px', color:'var(--muted)' }}>
                    <span>{event.registrations_count} inscrits</span>
                    <span>{event.capacity} total</span>
                  </div>
                </div>
                <div style={{ padding:'20px 28px 28px' }}>
                  {message && <div className="form-success" style={{ marginBottom:'16px' }}>{message}</div>}
                  {error   && <div className="form-error"   style={{ marginBottom:'16px' }}>⚠️ {error}</div>}
                  <button onClick={handleRegister} disabled={regLoading||isFull} className="btn btn-primary"
                    style={{ width:'100%', padding:'16px', fontSize:'16px', fontFamily:'Syne,sans-serif', letterSpacing:'-0.3px', opacity:isFull?0.5:1, cursor:isFull?'not-allowed':'pointer' }}>
                    {regLoading ? <><span className="spinner"/>Inscription...</>
                      : isFull ? '😔 Complet'
                      : user ? "S'inscrire →"
                      : "Se connecter pour s'inscrire →"}
                  </button>
                  {!user && (
                    <p style={{ textAlign:'center', marginTop:'12px', fontSize:'12px', color:'var(--muted)' }}>
                      <Link to="/login" style={{ color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>Se connecter</Link>
                      {' '}ou{' '}
                      <Link to="/register" style={{ color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>créer un compte</Link>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}