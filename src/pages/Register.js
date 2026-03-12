import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';

const FEATURE_INFO = [
  {
    icon:'✨', title:'Inscription gratuite',
    faqs:[
      { q:'Est-ce vraiment gratuit ?',      a:"Oui ! Créer un compte Eventify est 100% gratuit. Aucune carte bancaire requise." },
      { q:'Y a-t-il des frais cachés ?',    a:"Non. Les seuls frais sont ceux des billets payants définis par les organisateurs." },
      { q:'Puis-je supprimer mon compte ?', a:"Oui, vous pouvez supprimer votre compte à tout moment depuis vos paramètres." },
    ]
  },
  {
    icon:'🔒', title:'Données sécurisées',
    faqs:[
      { q:'Comment sont protégées mes données ?', a:"Chiffrées avec JWT, mots de passe hashés avec bcrypt. Standard bancaire." },
      { q:'Partagez-vous mes données ?',           a:"Jamais. Vos données ne sont jamais vendues ni partagées sans consentement." },
      { q:'Puis-je exporter mes données ?',        a:"Oui, conformément au RGPD vous pouvez télécharger toutes vos données." },
    ]
  },
  {
    icon:'🌍', title:'Événements en Afrique',
    faqs:[
      { q:'Dans quelles villes ?',           a:"Dakar, Thiès, Saint-Louis, Ziguinchor, Kaolack et toutes les grandes villes du Sénégal." },
      { q:'Autres pays africains ?',          a:"Expansion en cours : Côte d'Ivoire, Mali, Cameroun, Maroc. Restez connectés !" },
      { q:'Événements virtuels possibles ?',  a:"Absolument ! Créez des événements en ligne accessibles depuis toute l'Afrique." },
    ]
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        padding:'18px 24px',
        borderBottom:'1px solid var(--border)',
        cursor:'pointer',
        transition:'background 0.15s',
        background: open ? 'var(--paper)' : 'white',
      }}
    >
      <div style={{ fontWeight:600, fontSize:'14px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px' }}>
        {q}
        <span style={{ transition:'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', color:'var(--muted)', flexShrink:0 }}>▾</span>
      </div>
      {open && (
        <div style={{ color:'var(--muted)', fontSize:'14px', lineHeight:1.65, marginTop:'10px' }}>{a}</div>
      )}
    </div>
  );
}

function FeatureModal({ idx, onClose }) {
  const data = FEATURE_INFO[idx];
  if (!data) return null;
  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(13,13,18,0.65)', WebkitBackdropFilter:'blur(8px)', backdropFilter:'blur(8px)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', animation:'fadeIn 0.2s ease' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background:'white', borderRadius:'24px', maxWidth:'520px', width:'100%', overflow:'hidden', animation:'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)', boxShadow:'0 24px 80px rgba(0,0,0,0.25)' }}
      >
        {/* HEADER */}
        <div style={{ background:'var(--ink)', padding:'28px 24px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'200px', height:'200px', background:'radial-gradient(circle,rgba(255,77,46,0.2) 0%,transparent 70%)', pointerEvents:'none' }}/>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative' }}>
            <div>
              <div style={{ fontSize:'40px', marginBottom:'12px' }}>{data.icon}</div>
              <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'22px', fontWeight:800, color:'white', letterSpacing:'-0.5px' }}>{data.title}</h2>
            </div>
            <button
              onClick={onClose}
              style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'white', width:'36px', height:'36px', borderRadius:'10px', cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
            >✕</button>
          </div>
        </div>

        {/* FAQ */}
        <div>{data.faqs.map((f,i) => <FaqItem key={i} q={f.q} a={f.a}/>)}</div>

        {/* FOOTER */}
        <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end' }}>
          <button onClick={onClose} className="btn btn-primary" style={{ padding:'10px 24px' }}>Compris ✓</button>
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    first_name : '',
    last_name  : '',
    email      : '',
    password   : '',
    role       : 'participant',
  });
  const [loading, setLoading]   = useState(false);
  const [modalIdx, setModalIdx] = useState(null);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      showToast(`Bienvenue ${user.first_name} ! Compte créé avec succès 🎉`, 'success');
      navigate(user.role === 'organizer' ? '/dashboard' : '/');
    }  finally {
      setLoading(false);
    }
  };

  const FEATURES = [
    { icon:'✨', l:'Inscription gratuite', s:'Sans frais cachés' },
    { icon:'🔒', l:'Données sécurisées',   s:'Protection RGPD' },
    { icon:'🌍', l:"Toute l'Afrique",      s:'Sénégal & au-delà' },
  ];

  return (
    <>
      {modalIdx !== null && <FeatureModal idx={modalIdx} onClose={() => setModalIdx(null)}/>}

      <div className="auth-grid">

        {/* ── GAUCHE ── */}
        <div className="auth-left">
          <div style={{ position:'absolute', top:'-150px', right:'-150px', width:'450px', height:'450px', pointerEvents:'none', background:'radial-gradient(circle,rgba(255,77,46,0.18) 0%,transparent 70%)' }}/>
          <div style={{ position:'absolute', bottom:'-100px', left:'-100px', width:'300px', height:'300px', pointerEvents:'none', background:'radial-gradient(circle,rgba(255,184,0,0.1) 0%,transparent 70%)' }}/>

          <Link to="/" className="navbar-logo" style={{ marginBottom:'48px', position:'relative' }}>
            <div className="logo-icon">E</div>
            <span className="logo-text" style={{ color:'white' }}>Eventify</span>
          </Link>

          <div className="animate-fadeUp" style={{ position:'relative' }}>
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(30px,4vw,42px)', fontWeight:800, color:'white', letterSpacing:'-1.5px', lineHeight:1.1, marginBottom:'16px' }}>
              Rejoignez la communauté<br/>
              <span style={{ color:'var(--accent)' }}>Eventify</span>
            </h2>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'16px', lineHeight:1.7, marginBottom:'32px', fontWeight:300 }}>
              Des milliers d'événements vous attendent. Créez votre compte gratuitement.
            </p>
          </div>

          <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'1.5px', fontWeight:600, marginBottom:'12px', position:'relative' }}>
            Cliquez pour en savoir plus ↓
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px', position:'relative' }}>
            {FEATURES.map((f,i) => (
              <div
                key={i}
                className={`animate-fadeUp delay-${i+1}`}
                onClick={() => setModalIdx(i)}
                style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'14px', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,77,46,0.1)'; e.currentTarget.style.borderColor='rgba(255,77,46,0.25)'; e.currentTarget.style.transform='translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='translateX(0)'; }}
              >
                <div style={{ width:'42px', height:'42px', flexShrink:0, background:'rgba(255,77,46,0.12)', border:'1px solid rgba(255,77,46,0.2)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>
                  {f.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ color:'white', fontWeight:600, fontSize:'14px' }}>{f.l}</div>
                  <div style={{ color:'rgba(255,255,255,0.35)', fontSize:'12px', marginTop:'2px' }}>{f.s} — cliquer pour détails</div>
                </div>
                <span style={{ color:'rgba(255,255,255,0.25)' }}>→</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── DROITE ── */}
        <div className="auth-right">
          <Link to="/" className="navbar-logo" style={{ marginBottom:'32px' }}>
            <div className="logo-icon">E</div>
            <span className="logo-text">Eventify</span>
          </Link>

          <div className="animate-fadeUp">
            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'28px', fontWeight:800, letterSpacing:'-0.8px', marginBottom:'6px' }}>
              Créer un compte
            </h2>
            <p style={{ color:'var(--muted)', fontSize:'14px', marginBottom:'28px' }}>
              Rejoignez Eventify en quelques secondes
            </p>
          </div>

          {/* RÔLE */}
          <div style={{ marginBottom:'24px' }} className="animate-fadeUp delay-1">
            <div className="form-label" style={{ marginBottom:'12px' }}>Je suis un(e)</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              {[
                { v:'participant', icon:'👤', l:'Participant',   s:'Je cherche des événements' },
                { v:'organizer',   icon:'🎯', l:'Organisateur', s:'Je crée des événements' },
              ].map(r => (
                <div
                  key={r.v}
                  onClick={() => setForm({ ...form, role: r.v })}
                  style={{
                    border:`2px solid ${form.role===r.v?'var(--accent)':'var(--border)'}`,
                    borderRadius:'14px', padding:'16px',
                    cursor:'pointer', textAlign:'center',
                    background: form.role===r.v ? 'rgba(255,77,46,0.05)' : 'white',
                    transition:'all 0.2s',
                    transform: form.role===r.v ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  <div style={{ fontSize:'28px', marginBottom:'8px' }}>{r.icon}</div>
                  <div style={{ fontWeight:600, fontSize:'14px' }}>{r.l}</div>
                  <div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'2px' }}>{r.s}</div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }} className="animate-fadeUp delay-2">

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              <div className="form-group">
                <label className="form-label">Prénom</label>
                <input
                  type="text" name="first_name"
                  placeholder="Alice"
                  value={form.first_name}
                  onChange={onChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nom</label>
                <input
                  type="text" name="last_name"
                  placeholder="Diallo"
                  value={form.last_name}
                  onChange={onChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email" name="email"
                placeholder="vous@exemple.com"
                value={form.email}
                onChange={onChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password" name="password"
                placeholder="Minimum 6 caractères"
                value={form.password}
                onChange={onChange}
                required
                minLength={6}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop:'8px', padding:'14px', fontSize:'15px' }}
            >
              {loading
                ? <><span className="spinner"/>Création en cours...</>
                : 'Créer mon compte →'
              }
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:'24px', fontSize:'14px', color:'var(--muted)' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}