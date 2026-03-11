import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Home        from './pages/Home';
import Login       from './pages/Login';
import Register    from './pages/Register';
import EventDetail from './pages/EventDetail';
import MyEvents    from './pages/MyEvents';
import Dashboard   from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--paper)',
    }}>
      <div style={{
        width: '40px', height: '40px', border: '3px solid var(--border)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/login"       element={<Login />} />
          <Route path="/register"    element={<Register />} />
          <Route path="/events/:id"  element={<EventDetail />} />
          <Route path="/my-events"   element={
            <PrivateRoute role="participant"><MyEvents /></PrivateRoute>
          }/>
          <Route path="/dashboard"   element={
            <PrivateRoute role="organizer"><Dashboard /></PrivateRoute>
          }/>
          <Route path="/create-event" element={
            <PrivateRoute role="organizer"><CreateEvent /></PrivateRoute>
          }/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;