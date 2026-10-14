import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Lazy loading components for max performance
const WorkerDashboard = lazy(() => import('./pages/WorkerDashboard'));
const BrowseTasks = lazy(() => import('./pages/BrowseTasks'));
const TaskDetails = lazy(() => import('./pages/TaskDetails'));
const WorkerWallet = lazy(() => import('./pages/WorkerWallet'));
const WorkerProfile = lazy(() => import('./pages/WorkerProfile'));
const TopReferrals = lazy(() => import('./pages/TopReferrals'));
const TopEarners = lazy(() => import('./pages/TopEarners'));
const TopTaskCompleters = lazy(() => import('./pages/TopTaskCompleters'));

const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const CreateTask = lazy(() => import('./pages/CreateTask'));
const ClientSubmissions = lazy(() => import('./pages/ClientSubmissions'));
const ClientWallet = lazy(() => import('./pages/ClientWallet'));

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Notifications = lazy(() => import('./pages/Notifications'));

// Simple loading indicator
const PageLoader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#0b1120',
    color: '#06b6d4',
    fontSize: '16px',
    fontWeight: '700'
  }}>
    TaskBang লোড হচ্ছে...
  </div>
);

export default function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Worker Routes */}
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />
          <Route path="/worker/browse-tasks" element={<BrowseTasks />} />
          <Route path="/worker/task/:taskId" element={<TaskDetails />} />
          <Route path="/worker/wallet" element={<WorkerWallet />} />
          <Route path="/worker/profile" element={<WorkerProfile />} />
          <Route path="/worker/top-referrals" element={<TopReferrals />} />
          <Route path="/worker/top-earners" element={<TopEarners />} />
          <Route path="/worker/top-tasks" element={<TopTaskCompleters />} />

          {/* Client Routes */}
          <Route path="/client-dashboard" element={<ClientDashboard />} />
          <Route path="/client/create-task" element={<CreateTask />} />
          <Route path="/client/submissions" element={<ClientSubmissions />} />
          <Route path="/client/wallet" element={<ClientWallet />} />

          {/* Admin & Shared Routes */}
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/worker/notifications" element={<Notifications />} />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/worker-dashboard" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}