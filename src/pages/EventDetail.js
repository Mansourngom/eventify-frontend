import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getEventById, registerToEvent } from '../services/api';
import { useAuth } from '../context/AuthContext';

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

  useEffect(() => {
    getEventById(id).then(r => setEvent(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleRegister = async () => {
    if (!user) { navigate('/login'); return; }
    setRegLoading(true); setError(''); setMessage('');
    try {
      await registerToEvent(id);
      setMessage('🎉 Inscription confirmée ! Vous êtes inscrit(e).');
      const r = await getEventById(id); setEvent(r.data);
    } catch (e) {
      setError(e.response?.data?.error || "Erreur lors de l'inscription");
    } finally { setRegLoading(false); }
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ width:'40px', height:'40px', border:'3px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!event) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:'16px' }}>
      <div style={{ fontSize:'56px' }}>😕</div>
      <h2 style={{ fontFamily:'Syne,sans-serif' }}>Événement introuvable</h2>
      <Link to="/" className="btn-primary">← Retour à l'accueil</Link>
    </div>
  );

  const pct       = Math.min(100, Math.round(event.registrations_count / event.capacity * 100));
  const remaining = event.capacity - event.registrations_count;
  const isFull    = remaining <= 0;
  const grad      = GRADS[event.id % GRADS.length];

  return (
    <>
      <style>{`
        .detail-grid { display: grid; grid-template-columns: 1fr 360px; gap: 40px; align-items: start; }
        .info-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 900px) { .detail-grid { grid-template-columns: 1fr; } }
        @media (max-width: 560px) { .info-grid   { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ background:'var(--paper)', minHeight:'100vh' }}>
        {/* NAVBAR */}
        <nav className="navbar">
          <div className="navbar-inner">
            <Link to="/" className="logo">
              <div className="logo-icon">E</div>
              <span className="logo-text">Eventify</span>
            </Link>
            <Link to="/" style={{ color:'var(--muted)', textDecoration:'none', fontSize:'14px', fontWeight:500, display:'flex', alignItems:'center', gap:'6px' }}>
              ← Retour aux événements
            </Link>
          </div>
        </nav>

        {/* HERO */}
        <div style={{ width:'100%', height:'clamp(280px,40vw,440px)', background:grad, position:'relative', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'100px' }}>
          {event.image
            ? <img src={`http://127.0.0.1:8000${event.image}`} alt={event.title} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            : <span>🎉</span>
          }
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 30%, rgba(13,13,18,0.72) 100%)' }}/>
          <div style={{ position:'absolute', top:'20px', left:'20px', display:'flex', gap:'8px' }}>
            <span style={{ padding:'5px 12px', borderRadius:'100px', fontSize:'11px', fontWeight:600, textTransform:'uppercase', background:'rgba(255,255,255,0.92)', color:'var(--ink)', backdropFilter:'blur(8px)' }}>{event.category}</span>
            {event.is_private && <span style={{ padding:'5px 12px', borderRadius:'100px', fontSize:'11px', fontWeight:600, background:'rgba(13,13,18,0.8)', color:'white' }}>🔒 Privé</span>}
          </div>
          <div style={{ position:'absolute', bottom:'28px', left:'clamp(20px,3vw,40px)', right:'clamp(20px,3vw,40px)' }}>
            <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(24px,4vw,48px)', fontWeight:800, color:'white', letterSpacing:'-1px', lineHeight:1.1 }}>{event.title}</h1>
          </div>
        </div>

        {/* CONTENU */}
        <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'clamp(28px,4vw,48px) 24px' }}>
          <div className="detail-grid">

            {/* GAUCHE */}
            <div>
              {/* INFO GRID */}
              <div className="info-grid" style={{ marginBottom:'28px' }}>
                {[
                  { icon:'📅', l:'Date',    v:new Date(event.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) },
                  { icon:'⏰', l:'Heure',   v:new Date(event.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) },
                  { icon:'📍', l:'Lieu',    v:event.location },
                  { icon:'👥', l:'Places',  v:`${event.registrations_count} / ${event.capacity} inscrits` },
                ].map((info,i) => (
                  <div key={i} style={{ background:'white', border:'1px solid var(--border)', borderRadius:'16px', padding:'18px' }}>
                    <div style={{ fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.8px', color:'var(--muted)', marginBottom:'8px', fontWeight:600 }}>{info.icon} {info.l}</div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'14px', textTransform:info.l==='Date'?'capitalize':'none' }}>{info.v}</div>
                  </div>
                ))}
              </div>

              {/* DESCRIPTION */}
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'20px', padding:'clamp(20px,3vw,32px)', marginBottom:'20px' }}>
                <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'19px', marginBottom:'16px', paddingBottom:'16px', borderBottom:'1px solid var(--border)' }}>
                  À propos de cet événement
                </h2>
                <p style={{ color:'var(--muted)', lineHeight:1.85, fontSize:'15px', whiteSpace:'pre-line' }}>{event.description}</p>
              </div>

              {/* ORGANISATEUR */}
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'20px', padding:'24px' }}>
                <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'17px', marginBottom:'18px' }}>Organisateur</h2>
                <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                  <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'18px', fontFamily:'Syne,sans-serif', flexShrink:0 }}>
                    {event.organizer?.first_name?.[0]}{event.organizer?.last_name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'16px' }}>{event.organizer?.first_name} {event.organizer?.last_name}</div>
                    <div style={{ color:'var(--muted)', fontSize:'13px', marginTop:'3px' }}>Organisateur certifié Eventify ✓</div>
                  </div>
                </div>
              </div>
            </div>

            {/* DROITE — CARTE INSCRIPTION */}
            <div style={{ position:'sticky', top:'80px' }}>
              <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'24px', overflow:'hidden', boxShadow:'0 8px 48px rgba(0,0,0,0.08)' }}>
                <div style={{ padding:'26px 26px 20px', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ fontFamily:'Syne,sans-serif', fontSize:'36px', fontWeight:800, letterSpacing:'-1px', color:event.price==0?'var(--green)':'var(--ink)', marginBottom:'4px' }}>
                    {event.price==0?'Gratuit':`${Number(event.price).toLocaleString()} XOF`}
                  </div>
                  <div style={{ color:'var(--muted)', fontSize:'14px' }}>
                    {isFull ? '😔 Événement complet' : `🔥 ${remaining} place${remaining>1?'s':''} restante${remaining>1?'s':''}`}
                  </div>
                </div>

                {/* PROGRESS */}
                <div style={{ padding:'18px 26px', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                    <span style={{ fontSize:'12px', color:'var(--muted)', fontWeight:500 }}>Taux de remplissage</span>
                    <span style={{ fontSize:'12px', fontWeight:700, color:pct>80?'var(--accent)':'var(--green)' }}>{pct}%</span>
                  </div>
                  <div style={{ width:'100%', height:'6px', background:'var(--cream)', borderRadius:'3px', overflow:'hidden' }}>
                    <div style={{ width:`${pct}%`, height:'100%', background:pct>80?'linear-gradient(90deg,var(--accent2),var(--accent))':'var(--green)', borderRadius:'3px', transition:'width 0.6s ease' }}/>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:'7px', fontSize:'12px', color:'var(--muted)' }}>
                    <span>{event.registrations_count} inscrits</span>
                    <span>{event.capacity} places</span>
                  </div>
                </div>

                {/* MESSAGES */}
                <div style={{ padding:'0 26px' }}>
                  {message && <div style={{ background:'rgba(29,185,84,0.08)', border:'1px solid rgba(29,185,84,0.2)', color:'var(--green)', padding:'12px 14px', borderRadius:'10px', fontSize:'14px', marginTop:'18px' }}>{message}</div>}
                  {error   && <div style={{ background:'rgba(255,77,46,0.07)', border:'1px solid rgba(255,77,46,0.2)', color:'var(--accent)', padding:'12px 14px', borderRadius:'10px', fontSize:'14px', marginTop:'18px' }}>{error}</div>}
                </div>

                {/* BOUTON */}
                <div style={{ padding:'20px 26px 26px' }}>
                  <button onClick={handleRegister} disabled={regLoading||isFull}
                    style={{ width:'100%', padding:'16px', background:isFull?'var(--border)':'var(--accent)', color:isFull?'var(--muted)':'white', border:'none', borderRadius:'14px', fontSize:'16px', fontWeight:700, cursor:isFull||regLoading?'not-allowed':'pointer', fontFamily:'Syne,sans-serif', letterSpacing:'-0.3px', boxShadow:isFull?'none':'0 4px 20px rgba(255,77,46,0.35)', transition:'all 0.2s' }}>
                    {regLoading ? 'Inscription...' : isFull ? 'Complet' : user ? "S'inscrire →" : "Se connecter pour s'inscrire →"}
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