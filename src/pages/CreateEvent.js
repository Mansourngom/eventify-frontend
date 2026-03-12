import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createEvent } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';

const CATS = [
  { v:'conference', l:'🎤 Conférence' },
  { v:'concert',    l:'🎵 Concert' },
  { v:'atelier',    l:'🎨 Atelier' },
  { v:'sport',      l:'⚡ Sport' },
  { v:'networking', l:'🤝 Networking' },
  { v:'autre',      l:'📌 Autre' },
];

export default function CreateEvent() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', location:'', date:'', category:'conference', capacity:'', price:0, is_private:false });
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type==='checkbox' ? checked : value });
  };
  const onImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file); setPreview(URL.createObjectURL(file));
  };
  const onSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach(k => data.append(k, form[k]));
      if (image) data.append('image', image);
      await createEvent(data);
      showToast('🎉 Événement publié avec succès !', 'success');
      navigate('/dashboard');
    } catch(err) {
      setError(err.response?.data?.detail || "Erreur lors de la création.");
      showToast("Erreur lors de la création ❌", 'error');
    } finally { setLoading(false); }
  };

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
        <Link to="/dashboard" className="sidebar-link" onClick={() => setSidebarOpen(false)}><span className="icon">📊</span>Vue d'ensemble</Link>
        <Link to="/dashboard" className="sidebar-link" onClick={() => setSidebarOpen(false)}><span className="icon">📅</span>Mes événements</Link>
        <Link to="/dashboard" className="sidebar-link" onClick={() => setSidebarOpen(false)}><span className="icon">👥</span>Participants</Link>
        <div className="sidebar-divider"/>
        <div className="sidebar-section-label">Actions</div>
        <Link to="/create-event" className="sidebar-link active" onClick={() => setSidebarOpen(false)}><span className="icon">➕</span>Créer un événement</Link>
        <Link to="/" className="sidebar-link" onClick={() => setSidebarOpen(false)}><span className="icon">🏠</span>Accueil</Link>
      </nav>
    </>
  );

  const Section = ({ icon, title, children }) => (
    <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'20px', padding:'clamp(20px,3vw,32px)', marginBottom:'24px' }}>
      <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'17px', marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'10px' }}>
        <span>{icon}</span>{title}
      </h2>
      {children}
    </div>
  );

  return (
    <div className="sidebar-layout">
      <aside className={`sidebar ${sidebarOpen?'open':''}`}><SidebarContent/></aside>
      <div className={`sidebar-overlay ${sidebarOpen?'open':''}`} onClick={() => setSidebarOpen(false)}/>
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen?'✕':'☰'}</button>

      <main className="page-content">
        <Link to="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'14px', color:'var(--muted)', textDecoration:'none', marginBottom:'28px', padding:'8px 14px', borderRadius:'10px', border:'1.5px solid var(--border)', background:'white', transition:'all 0.2s' }}>
          ← Retour au dashboard
        </Link>

        <div style={{ marginBottom:'32px' }} className="animate-fadeUp">
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(24px,3vw,32px)', fontWeight:800, letterSpacing:'-1px', marginBottom:'8px' }}>Créer un événement</h1>
          <p style={{ color:'var(--muted)' }}>Remplissez les informations pour publier votre événement sur Eventify.</p>
        </div>

        {error && <div className="form-error animate-fadeIn" style={{ marginBottom:'24px' }}>⚠️ {error}</div>}

        <form onSubmit={onSubmit} className="animate-fadeUp delay-1">
          <Section icon="📝" title="Informations générales">
            <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
              <div className="form-group">
                <label className="form-label">Titre *</label>
                <input type="text" name="title" className="form-input" placeholder="Ex: TechTalk Dakar — L'IA en Afrique" value={form.title} onChange={onChange} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea name="description" className="form-input form-textarea" placeholder="Décrivez votre événement..." value={form.description} onChange={onChange} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select name="category" className="form-input" value={form.category} onChange={onChange}>
                  {CATS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Image de l'événement</label>
                <div style={{ border:'2px dashed var(--border)', borderRadius:'16px', padding:'24px', textAlign:'center', cursor:'pointer', background:preview?'transparent':'var(--paper)', position:'relative', overflow:'hidden', transition:'border-color 0.2s' }}
                  onClick={() => document.getElementById('img-input').click()}
                  onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                  {preview
                    ? <img src={preview} alt="preview" style={{ width:'100%', maxHeight:'200px', objectFit:'cover', borderRadius:'10px' }}/>
                    : <><div style={{ fontSize:'40px', marginBottom:'12px' }}>🖼️</div><div style={{ fontSize:'14px', fontWeight:500, marginBottom:'4px' }}>Cliquez pour ajouter une image</div><div style={{ fontSize:'12px', color:'var(--muted)' }}>PNG, JPG jusqu'à 10MB</div></>
                  }
                  <input id="img-input" type="file" accept="image/*" onChange={onImageChange} style={{ display:'none' }}/>
                </div>
                {preview && <button type="button" onClick={() => { setImage(null); setPreview(null); }} className="btn btn-ghost" style={{ marginTop:'8px', fontSize:'13px' }}>🗑️ Supprimer</button>}
              </div>
            </div>
          </Section>

          <Section icon="📍" title="Lieu & Date">
            <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
              <div className="form-group">
                <label className="form-label">Date et heure *</label>
                <input type="datetime-local" name="date" className="form-input" value={form.date} onChange={onChange} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Lieu *</label>
                <input type="text" name="location" className="form-input" placeholder="Ex: Radisson Blu Hotel, Dakar" value={form.location} onChange={onChange} required/>
              </div>
            </div>
          </Section>

          <Section icon="🎟️" title="Billetterie & Accès">
            <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                <div className="form-group">
                  <label className="form-label">Prix (XOF)</label>
                  <input type="number" name="price" className="form-input" placeholder="0 = Gratuit" value={form.price} onChange={onChange} min="0"/>
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre de places *</label>
                  <input type="number" name="capacity" className="form-input" placeholder="Ex: 100" value={form.capacity} onChange={onChange} required min="1"/>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:'var(--paper)', borderRadius:'14px', border:'1.5px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:'14px' }}>Événement privé</div>
                  <div style={{ fontSize:'12px', color:'var(--muted)', marginTop:'3px' }}>Visible uniquement via lien direct</div>
                </div>
                <label style={{ position:'relative', display:'inline-block', width:'46px', height:'26px', cursor:'pointer' }}>
                  <input type="checkbox" name="is_private" checked={form.is_private} onChange={onChange} style={{ opacity:0, width:0, height:0 }}/>
                  <span style={{ position:'absolute', inset:0, background:form.is_private?'var(--accent)':'var(--border)', borderRadius:'100px', transition:'0.25s' }}>
                    <span style={{ position:'absolute', left:form.is_private?'23px':'3px', top:'3px', width:'20px', height:'20px', background:'white', borderRadius:'50%', transition:'0.25s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
                  </span>
                </label>
              </div>
            </div>
          </Section>

          <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', flexWrap:'wrap' }}>
            <Link to="/dashboard" className="btn btn-secondary">Annuler</Link>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth:'160px' }}>
              {loading ? <><span className="spinner"/>Publication...</> : "✓ Publier l'événement"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}