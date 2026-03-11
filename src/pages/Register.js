import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]       = useState({ first_name:'', last_name:'', email:'', password:'', role:'participant' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'organizer' ? '/dashboard' : '/');
    } catch (err) {
      const data = err.response?.data;
      if (data?.email) setError('Cet email est déjà utilisé.');
      else setError("Erreur lors de l'inscription. Vérifiez vos informations.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        .auth-wrap { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; }
        .auth-panel-left { background:var(--sidebar); padding:56px; display:flex; flex-direction:column; justify-content:center; position:relative; overflow:hidden; }
        .auth-panel-right { background:var(--paper); padding:56px; display:flex; flex-direction:column; justify-content:center; overflow-y:auto; }
        .auth-role-card { border-radius:14px; padding:18px 14px; cursor:pointer; text-align:center; transition:all 0.2s; border:2px solid var(--border); background:white; }
        .auth-role-card.selected { border-color:var(--accent); background:rgba(255,77,46,0.04); box-shadow:0 0 0 3px rgba(255,77,46,0.1); }
        .name-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media (max-width:768px) {
          .auth-wrap { grid-template-columns:1fr; }
          .auth-panel-left { display:none; }
          .auth-panel-right { padding:40px 24px; }
          .name-row { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="auth-wrap">
        {/* ── LEFT ── */}
        <div className="auth-panel-left">
          <div style={{ position:'absolute', top:'-180px', right:'-180px', width:'420px', height:'420px', background:'radial-gradient(circle,rgba(255,77,46,0.18) 0%,transparent 70%)', pointerEvents:'none' }}/>

          <div className="logo" style={{ marginBottom:'52px' }}>
            <div className="logo-icon">E</div>
            <span className="logo-text" style={{ color:'white' }}>Eventify</span>
          </div>

          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(30px,3.5vw,44px)', fontWeight:800, color:'white', letterSpacing:'-1.5px', lineHeight:1.05, marginBottom:'18px' }}>
            Rejoignez la<br/>communauté <span style={{ color:'var(--accent)' }}>Eventify</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'16px', lineHeight:1.7, marginBottom:'44px', fontWeight:300 }}>
            Des milliers d'événements vous attendent. Créez votre compte gratuitement.
          </p>

          {[
            { icon:'✨', t:'Inscription gratuite, sans frais cachés' },
            { icon:'🔒', t:'Données protégées et sécurisées' },
            { icon:'🌍', t:'Événements partout au Sénégal' },
          ].map((f,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'16px' }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'rgba(255,77,46,0.12)', border:'1px solid rgba(255,77,46,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px', flexShrink:0 }}>{f.icon}</div>
              <span style={{ color:'rgba(255,255,255,0.65)', fontSize:'14px' }}>{f.t}</span>
            </div>
          ))}
        </div>

        {/* ── RIGHT ── */}
        <div className="auth-panel-right">
          <div style={{ maxWidth:'440px', width:'100%', margin:'0 auto' }}>

            <div className="logo show-mobile" style={{ display:'none', marginBottom:'32px' }}>
              <div className="logo-icon">E</div>
              <span className="logo-text">Eventify</span>
            </div>

            <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'26px', fontWeight:800, letterSpacing:'-0.8px', marginBottom:'6px' }}>Créer un compte</h2>
            <p style={{ color:'var(--muted)', fontSize:'14px', marginBottom:'28px' }}>Rejoignez Eventify en quelques secondes</p>

            {/* ROLE */}
            <div style={{ marginBottom:'24px' }}>
              <div className="form-label">Je suis un(e)</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                {[
                  { v:'participant', icon:'👤', l:'Participant',   s:'Je cherche des événements' },
                  { v:'organizer',   icon:'🎯', l:'Organisateur', s:'Je crée des événements' },
                ].map(r => (
                  <div key={r.v} className={`auth-role-card ${form.role===r.v?'selected':''}`}
                    onClick={() => setForm({...form, role:r.v})}>
                    <div style={{ fontSize:'26px', marginBottom:'6px' }}>{r.icon}</div>
                    <div style={{ fontWeight:700, fontSize:'14px' }}>{r.l}</div>
                    <div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'2px' }}>{r.s}</div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div style={{ background:'rgba(255,77,46,0.07)', border:'1px solid rgba(255,77,46,0.2)', color:'var(--accent)', padding:'12px 14px', borderRadius:'10px', fontSize:'14px', marginBottom:'20px' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div className="name-row">
                <div>
                  <label className="form-label">Prénom</label>
                  <input className="form-input" type="text" placeholder="Alice"
                    value={form.first_name} onChange={e => setForm({...form,first_name:e.target.value})} required />
                </div>
                <div>
                  <label className="form-label">Nom</label>
                  <input className="form-input" type="text" placeholder="Diallo"
                    value={form.last_name} onChange={e => setForm({...form,last_name:e.target.value})} required />
                </div>
              </div>

              <div>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="vous@exemple.com"
                  value={form.email} onChange={e => setForm({...form,email:e.target.value})} required />
              </div>

              <div>
                <label className="form-label">Mot de passe</label>
                <div style={{ position:'relative' }}>
                  <input className="form-input" type={showPwd?'text':'password'} placeholder="Minimum 8 caractères"
                    value={form.password} onChange={e => setForm({...form,password:e.target.value})} required
                    style={{ paddingRight:'44px' }} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--muted)', fontSize:'16px' }}>
                    {showPwd?'🙈':'👁️'}
                  </button>
                </div>
              </div>

              <button className="btn-primary" type="submit" disabled={loading}
                style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'15px', marginTop:'4px', opacity:loading?0.65:1 }}>
                {loading ? 'Création...' : 'Créer mon compte →'}
              </button>
            </form>

            <p style={{ textAlign:'center', marginTop:'24px', fontSize:'14px', color:'var(--muted)' }}>
              Déjà un compte ?{' '}
              <Link to="/login" style={{ color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}