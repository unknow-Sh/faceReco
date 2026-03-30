import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import EventDetail from './pages/EventDetail';
import ClientPortal from './pages/ClientPortal';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex-center section"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Toaster position="top-center" toastOptions={{
            style: {
              background: '#0c0c22',
              color: '#f1f5f9',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
            }
          }} />
          <Navbar />
          <main style={{ paddingTop: '66px' }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/register" element={<Auth mode="register" />} />
              <Route path="/share/:token" element={<ClientPortal />} />

              {/* Private Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/event/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
