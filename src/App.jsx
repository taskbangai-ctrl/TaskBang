import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup'; // নতুন ইম্পোর্ট
import ClientDashboard from './pages/ClientDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const userRole = user?.user_metadata?.role;
  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={userRole === 'client' ? '/client' : userRole === 'worker' ? '/worker' : '/taskbang-master-admin'} replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* সিক্রেট এডমিন পোর্টাল */}
            <Route path="/taskbang-master-admin" element={<AdminLogin />} />
            <Route path="/taskbang-master-signup" element={<AdminSignup />} />

            <Route
              path="/client"
              element={
                <ProtectedRoute allowedRole="client">
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/worker"
              element={
                <ProtectedRoute allowedRole="worker">
                  <WorkerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}