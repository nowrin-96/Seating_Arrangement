import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import PrintView from './components/PrintView';
import BackupModal from './components/BackupModal';

import { getCurrentSession, logout, getSeatingChart } from './utils/storage';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [seatingDataForPrint, setSeatingDataForPrint] = useState(null);

  useEffect(() => {
    const session = getCurrentSession();
    setUser(session);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const handleOpenPrint = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    const chart = getSeatingChart(dateStr);
    setSeatingDataForPrint(chart);
    setIsPrintOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm font-semibold text-slate-400">Loading Bench Rotation...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenPrint={handleOpenPrint}
        onOpenBackup={() => setIsBackupOpen(true)}
      />

      <main className="flex-1">
        {!user ? (
          <LoginForm onLoginSuccess={setUser} />
        ) : user.role === 'admin' ? (
          <AdminDashboard onOpenPrint={handleOpenPrint} />
        ) : (
          <StudentDashboard user={user} />
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-900 no-print">
        <p>Bench Rotation • Full-Stack Classroom Seating System</p>
      </footer>

      {/* Modals */}
      {isPrintOpen && (
        <PrintView
          seatingData={seatingDataForPrint}
          onClose={() => setIsPrintOpen(false)}
        />
      )}

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
      />
    </div>
  );
}
