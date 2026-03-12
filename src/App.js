import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Toast      from './components/Toast';
import Home       from './pages/Home';
import Login      from './pages/Login';
import Register   from './pages/Register';
import EventDetail from './pages/EventDetail';
import MyEvents   from './pages/MyEvents';
import Dashboard  from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:'12px' }}>
      <div style={{ width:'28px', height:'28px', border:'3px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
      <span style={{ color:'var(--muted)', fontSize:'14px' }}>Chargement...</span>
    </div>
  );
  if (!user) return <Navigate to="/login"/>;
  if (role && user.role !== role) return <Navigate to="/"/>;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toast/>
        <Routes>
          <Route path="/"             element={<Home/>}/>
          <Route path="/login"        element={<Login/>}/>
          <Route path="/register"     element={<Register/>}/>
          <Route path="/events/:id"   element={<EventDetail/>}/>
          <Route path="/my-events"    element={<PrivateRoute role="participant"><MyEvents/></PrivateRoute>}/>
          <Route path="/dashboard"    element={<PrivateRoute role="organizer"><Dashboard/></PrivateRoute>}/>
          <Route path="/create-event" element={<PrivateRoute role="organizer"><CreateEvent/></PrivateRoute>}/>
          <Route path="*"             element={<Navigate to="/"/>}/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}