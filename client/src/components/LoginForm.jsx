import React, { useState } from 'react';
import { LogIn, Lock, User, AlertCircle, KeyRound, RefreshCw, Shield, GraduationCap } from 'lucide-react';
import { login, reseedStorage } from '../utils/storage';

export default function LoginForm({ onLoginSuccess }) {
  const [activePortal, setActivePortal] = useState('student'); // 'student' | 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setResetMsg('');

    const trimmedUser = (username || '').trim().toLowerCase();
    const trimmedPass = (password || '').trim();

    if (!trimmedUser || !trimmedPass) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Admin Authentication Check
      if (trimmedUser === 'admin' && trimmedPass === 'cloud2028') {
        const adminSession = { username: 'admin', role: 'admin' };
        sessionStorage.setItem('bench_rotation_session', JSON.stringify(adminSession));
        localStorage.removeItem('bench_rotation_session');
        onLoginSuccess(adminSession);
        setLoading(false);
        return;
      }

      const result = login(username.trim(), password);

      if (!result.success) {
        setError(result.error || 'Incorrect username or password');
        setLoading(false);
        return;
      }

      // If logging into student portal but user is admin, allow login as admin
      onLoginSuccess(result.user);
      setLoading(false);
    }, 200);
  };

  const handleClearCache = () => {
    localStorage.clear();
    reseedStorage();
    setResetMsg('Application cache and admin credentials have been reset successfully!');
    setError('');
  };

  const isAdmin = activePortal === 'admin';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-6">
      <div className="max-w-md w-full space-y-4">
        
        {/* Dual Portal Interface Switcher */}
        <div className="chalkboard-panel p-1.5 rounded-2xl flex border border-slate-800 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setActivePortal('student');
              setError('');
              setResetMsg('');
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              !isAdmin
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePortal('admin');
              setError('');
              setResetMsg('');
            }}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              isAdmin
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>

        {/* Card Header */}
        <div className="text-center">
          <div className={`inline-flex p-3 rounded-2xl mb-2 border ${
            isAdmin 
              ? 'bg-amber-500/10 border-amber-500/30' 
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}>
            {isAdmin ? (
              <Shield className="w-7 h-7 text-amber-400" />
            ) : (
              <GraduationCap className="w-7 h-7 text-emerald-400" />
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isAdmin ? 'Admin Portal Login' : 'Student Portal Login'}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            {isAdmin
              ? 'Sign in to configure seating rotations, benches & student records'
              : 'Sign in with your student account to view weekly bench rotation'}
          </p>
        </div>

        {/* Login Card */}
        <div className="chalkboard-panel rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isAdmin ? 'bg-amber-500/10' : 'bg-emerald-500/10'
          }`}></div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 bg-red-950/60 border border-red-800/60 text-red-200 rounded-xl text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {resetMsg && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 rounded-xl text-xs sm:text-sm flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{resetMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {isAdmin ? 'Admin Username' : 'Student Username'}
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {isAdmin ? (
                    <Shield className="h-4 w-4 text-amber-500/70" />
                  ) : (
                    <User className="h-4 w-4 text-emerald-500/70" />
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isAdmin ? 'Enter admin username' : 'Enter your student username'}
                  className={`block w-full pl-9 pr-3.5 py-2.5 sm:py-3 bg-slate-900/90 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                    isAdmin 
                      ? 'border-slate-700/80 focus:ring-amber-500/50' 
                      : 'border-slate-700/80 focus:ring-emerald-500/50'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`block w-full pl-9 pr-3.5 py-2.5 sm:py-3 bg-slate-900/90 border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 text-xs sm:text-sm ${
                    isAdmin 
                      ? 'border-slate-700/80 focus:ring-amber-500/50' 
                      : 'border-slate-700/80 focus:ring-emerald-500/50'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-xs sm:text-sm ${
                isAdmin
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 hover:shadow-amber-500/30'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-500/20 hover:shadow-emerald-500/30'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{isAdmin ? 'Sign In as Admin' : 'Sign In as Student'}</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleClearCache}
                className="text-xs text-slate-400 hover:text-amber-400 underline transition-colors inline-flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Application Cache & Admin Credentials</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
