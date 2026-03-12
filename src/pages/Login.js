import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email:'', password:'' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      showToast(`Bienvenue ${user.first_name} ! 👋`, 'success');
      navigate(user.role === 'organizer' ? '/dashboard' : '/');
    } catch {
      setError('Email ou mot de passe incorrect.');
      showToast('Identifiants incorrects ❌', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-grid">

      {/* GAUCHE */}
      <div className="auth-left">
        <div style={{ position:'absolute', top:'-150px', right:'-150px', width:'450px', height:'450px', pointerEvents:'none', background:'radial-gradient(circle,rgba(255,77,46,0.18) 0%,transparent 70%)' }}/>
        <div style={{ position:'absolute', bottom:'-100px', left:'-100px', width:'300px', height:'300px', pointerEvents:'none', background:'radial-gradient(circle,rgba(255,184,0,0.1) 0%,transparent 70%)' }}/>

        <Link to="/" className="navbar-logo" style={{ marginBottom:'48px', position:'relative' }}>
          <div className="logo-icon">E</div>
          <span className="logo-text" style={{ color:'white' }}>Eventify</span>
        </Link>

        <div className="animate-fadeUp" style={{ position:'relative' }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(32px,4vw,44px)', fontWeight:800, color:'white', letterSpacing:'-1.5px', lineHeight:1.1, marginBottom:'16px' }}>
            Bon retour sur<br/><span style={{ color:'var(--accent)' }}>Eventify</span> 👋
          </h2>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'16px', lineHeight:1.7, marginBottom:'40px', fontWeight:300 }}>
            Connectez-vous pour accéder à vos événements et gérer vos inscriptions.
          </p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'14px', position:'relative' }}>
          {[
            { icon:'📅', text:'Gérez tous vos événements en un seul endroit' },
            { icon:'🎟️', text:'Retrouvez toutes vos inscriptions facilement' },
            { icon:'📊', text:'Dashboard avec statistiques en temps réel' },
          ].map((f,i) => (
            <div key={i} className={`animate-fadeUp delay-${i+1}`} style={{ display:'flex', alignItems:'center', gap:'14px' }}>
              <div style={{ width:'40px', height:'40px', flexShrink:0, background:'rgba(255,77,46,0.12)', border:'1px solid rgba(255,77,46,0.2)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>{f.icon}</div>
              <span style={{ color:'rgba(255,255,255,0.65)', fontSize:'14px' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DROITE */}
      <div className="auth-right">
        <Link to="/" className="navbar-logo" style={{ marginBottom:'32px' }}>
          <div className="logo-icon">E</div>
          <span className="logo-text">Eventify</span>
        </Link>

        <div className="animate-fadeUp">
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'28px', fontWeight:800, letterSpacing:'-0.8px', marginBottom:'6px' }}>Se connecter</h2>
          <p style={{ color:'var(--muted)', fontSize:'14px', marginBottom:'32px' }}>Entrez vos identifiants pour accéder à votre compte</p>
        </div>

        {error && <div className="form-error animate-fadeIn" style={{ marginBottom:'20px' }}>⚠️ {error}</div>}

        <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }} className="animate-fadeUp delay-1">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" name="email" placeholder="vous@exemple.com" value={form.email} onChange={onChange} required className="form-input"/>
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={onChange} required className="form-input"/>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop:'8px', padding:'14px', fontSize:'15px' }}>
            {loading ? <><span className="spinner"/>Connexion...</> : 'Se connecter →'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:'24px', fontSize:'14px', color:'var(--muted)' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}