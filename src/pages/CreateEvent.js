import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createEvent } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATS = [
  { v:'conference', l:'🎤 Conférence' },
  { v:'concert',    l:'🎵 Concert' },
  { v:'atelier',    l:'🎨 Atelier' },
  { v:'sport',      l:'⚡ Sport' },
  { v:'networking', l:'🤝 Networking' },
  { v:'autre',      l:'📌 Autre' },
];

export default function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'', description:'', location:'', date:'', category:'conference', capacity:'', price:0, is_private:false });
  const [image, setImage]     = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebar] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type==='checkbox' ? checked : value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach(k => data.append(k, form[k]));
      if (image) data.append('image', image);
      await createEvent(data);
      navigate('/dashboard');
    } catch {
      setError("Erreur lors de la création. Vérifiez les informations.");
    } finally { setLoading(false); }
  };

  const Section = ({ icon, title, children }) => (
    <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:'20px', padding:'clamp(20px,3vw,30px)', marginBottom:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'10px', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'17px', marginBottom:'22px', paddingBottom:'16px', borderBottom:'1px solid var(--border)' }}>
        <span style={{ width:'36px', height:'36px', background:'rgba(255,77,46,0.08)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px' }}>{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <>
      <style>{`
        .ce-layout { display: flex; min-height: 100vh; }
        .ce-sidebar { width: 260px; background: var(--sidebar); position: fixed; top: 0; left: 0; height: 100vh; z-index: 200; display: flex; flex-direction: column; transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); overflow-y: auto; }
        .ce-main   { margin-left: 260px; flex: 1; background: var(--paper); }
        .ce-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 199; }
        .ce-overlay.open { display: block; }
        .ce-topbar { display: none; background: rgba(247,245,240,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); height: 56px; position: sticky; top: 0; z-index: 100; align-items: center; padding: 0 20px; justify-content: space-between; }
        .ce-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 768px) {
          .ce-sidebar { transform: translateX(-100%); }
          .ce-sidebar.open { transform: translateX(0); }
          .ce-main   { margin-left: 0; }
          .ce-topbar { display: flex; }
        }
        @media (max-width: 480px) {
          .ce-two-col { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ce-layout">
        {/* OVERLAY */}
        <div className={`ce-overlay ${sidebarOpen?'open':''}`} onClick={() => setSidebar(false)}/>

        {/* SIDEBAR */}
        <aside className={`ce-sidebar ${sidebarOpen?'open':''}`}>
          <div style={{ padding:'22px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div className="logo">
              <div className="logo-icon">E</div>
              <span className="logo-text" style={{ color:'white' }}>Eventify</span>
            </div>
          </div>

          <div style={{ padding:'18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{ width:'42px', height:'42px', borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'15px', fontFamily:'Syne,sans-serif' }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <div style={{ color:'white', fontWeight:600, fontSize:'14px' }}>{user?.first_name} {user?.last_name}</div>
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px', marginTop:'2px' }}>Organisateur ✓</div>
              </div>
            </div>
          </div>

          <div style={{ padding:'16px 14px', flex:1 }}>
            <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'1.5px', color:'rgba(255,255,255,0.28)', marginBottom:'8px', padding:'0 6px', fontWeight:600 }}>Navigation</div>

            {[
              { to:'/dashboard', state:'overview',     icon:'📊', label:"Vue d'ensemble" },
              { to:'/dashboard', state:'events',       icon:'📅', label:'Mes événements' },
              { to:'/dashboard', state:'participants', icon:'👥', label:'Participants' },
            ].map((item,i) => (
              <Link key={i} to={item.to} className="sidebar-link" onClick={() => setSidebar(false)}>
                <div className="link-icon">{item.icon}</div>
                {item.label}
              </Link>
            ))}

            <div style={{ height:'1px', background:'rgba(255,255,255,0.06)', margin:'14px 0' }}/>

            <Link to="/create-event" className="sidebar-link active" onClick={() => setSidebar(false)}>
              <div className="link-icon">➕</div>
              Créer un événement
            </Link>

            <Link to="/" className="sidebar-link" onClick={() => setSidebar(false)}>
              <div className="link-icon">🏠</div>
              Accueil
            </Link>
          </div>
        </aside>

        {/* MAIN */}
        <main className="ce-main">
          {/* TOPBAR MOBILE */}
          <div className="ce-topbar">
            <button onClick={() => setSidebar(true)} style={{ background:'none', border:'none', cursor:'pointer', padding:'6px', display:'flex', flexDirection:'column', gap:'5px' }}>
              {[0,1,2].map(i => <div key={i} style={{ width:'22px', height:'2px', background:'var(--ink)', borderRadius:'2px' }}/>)}
            </button>
            <div className="logo"><div className="logo-icon">E</div><span className="logo-text">Eventify</span></div>
            <div style={{ width:'34px' }}/>
          </div>

          <div style={{ padding:'clamp(24px,4vw,40px)' }}>
            {/* RETOUR */}
            <Link to="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:'7px', color:'var(--muted)', textDecoration:'none', fontSize:'14px', fontWeight:500, marginBottom:'28px', transition:'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color='var(--ink)'}
              onMouseLeave={e => e.currentTarget.style.color='var(--muted)'}>
              ← Retour au dashboard
            </Link>

            {/* TITRE */}
            <div style={{ marginBottom:'32px' }}>
              <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'clamp(24px,3.5vw,32px)', fontWeight:800, letterSpacing:'-1px', marginBottom:'8px' }}>Créer un événement</h1>
              <p style={{ color:'var(--muted)', fontSize:'15px' }}>Remplissez les informations pour publier votre événement sur Eventify.</p>
            </div>

            {error && (
              <div style={{ background:'rgba(255,77,46,0.07)', border:'1px solid rgba(255,77,46,0.2)', color:'var(--accent)', padding:'14px 16px', borderRadius:'12px', fontSize:'14px', marginBottom:'24px' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* INFOS GÉNÉRALES */}
              <Section icon="📝" title="Informations générales">
                <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
                  <div>
                    <label className="form-label">Titre de l'événement *</label>
                    <input className="form-input" type="text" name="title" placeholder="Ex: TechTalk Dakar — L'IA en Afrique"
                      value={form.title} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="form-label">Description *</label>
                    <textarea className="form-input" name="description" placeholder="Décrivez votre événement : programme, intervenants, objectifs..."
                      value={form.description} onChange={handleChange} required rows={4} style={{ resize:'vertical', lineHeight:1.7 }} />
                  </div>
                  <div>
                    <label className="form-label">Catégorie</label>
                    <select className="form-input" name="category" value={form.category} onChange={handleChange}>
                      {CATS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Image de l'événement</label>
                    <div style={{ border:'2px dashed var(--border)', borderRadius:'14px', padding:'28px', textAlign:'center', cursor:'pointer', transition:'all 0.2s', position:'relative', overflow:'hidden', background:preview?'transparent':'var(--paper)' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}
                      onClick={() => document.getElementById('img-input').click()}>
                      {preview
                        ? <img src={preview} alt="preview" style={{ width:'100%', maxHeight:'200px', objectFit:'cover', borderRadius:'8px' }}/>
                        : <>
                            <div style={{ fontSize:'40px', marginBottom:'10px' }}>🖼️</div>
                            <div style={{ fontWeight:600, marginBottom:'4px' }}>Cliquez pour ajouter une image</div>
                            <div style={{ fontSize:'12px', color:'var(--muted)' }}>PNG, JPG, WEBP — max 5MB</div>
                          </>
                      }
                      <input id="img-input" type="file" accept="image/*" onChange={handleImage} style={{ position:'absolute', opacity:0, inset:0, cursor:'pointer' }} />
                    </div>
                  </div>
                </div>
              </Section>

              {/* LIEU ET DATE */}
              <Section icon="📍" title="Lieu & Date">
                <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
                  <div>
                    <label className="form-label">Date et heure *</label>
                    <input className="form-input" type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
                  </div>
                  <div>
                    <label className="form-label">Lieu *</label>
                    <input className="form-input" type="text" name="location" placeholder="Ex: Radisson Blu Hotel, Dakar"
                      value={form.location} onChange={handleChange} required />
                  </div>
                </div>
              </Section>

              {/* BILLETTERIE */}
              <Section icon="🎟️" title="Billetterie & Accès">
                <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
                  <div className="ce-two-col">
                    <div>
                      <label className="form-label">Prix (XOF)</label>
                      <input className="form-input" type="number" name="price" placeholder="0 = Gratuit"
                        value={form.price} onChange={handleChange} min="0" />
                    </div>
                    <div>
                      <label className="form-label">Nombre de places *</label>
                      <input className="form-input" type="number" name="capacity" placeholder="Ex: 100"
                        value={form.capacity} onChange={handleChange} required min="1" />
                    </div>
                  </div>

                  {/* TOGGLE */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', background:'var(--paper)', borderRadius:'14px', border:'1.5px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'14px', marginBottom:'3px' }}>Événement privé</div>
                      <div style={{ fontSize:'12px', color:'var(--muted)' }}>Visible uniquement via lien direct</div>
                    </div>
                    <label style={{ position:'relative', display:'inline-block', width:'46px', height:'26px', cursor:'pointer' }}>
                      <input type="checkbox" name="is_private" checked={form.is_private} onChange={handleChange} style={{ opacity:0, width:0, height:0 }} />
                      <span style={{ position:'absolute', inset:0, background:form.is_private?'var(--accent)':'var(--border)', borderRadius:'100px', transition:'0.25s' }}>
                        <span style={{ position:'absolute', left:form.is_private?'22px':'3px', top:'3px', width:'20px', height:'20px', background:'white', borderRadius:'50%', transition:'0.25s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)' }}/>
                      </span>
                    </label>
                  </div>
                </div>
              </Section>

              {/* BOUTONS */}
              <div style={{ display:'flex', gap:'12px', justifyContent:'flex-end', flexWrap:'wrap' }}>
                <Link to="/dashboard" className="btn-secondary">Annuler</Link>
                <button className="btn-primary" type="submit" disabled={loading} style={{ opacity:loading?0.65:1 }}>
                  {loading
                    ? <><span style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.7s linear infinite' }}/> Publication...</>
                    : '✓ Publier l\'événement'
                  }
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}