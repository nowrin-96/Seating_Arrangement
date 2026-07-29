import React, { useState } from 'react';
import { LogIn, Lock, User, AlertCircle, Sparkles, KeyRound } from 'lucide-react';
import { login } from '../utils/storage';

export default function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const result = login(username.trim(), password);

      if (!result.success) {
        setError(result.error || 'Incorrect username or password');
        setLoading(false);
        return;
      }

      onLoginSuccess(result.user);
    }, 200);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-4">
            <KeyRound className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Classroom Seating Login</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in with your assigned account to view your weekly bench rotation
          </p>
        </div>

        {/* Login Card */}
        <div className="chalkboard-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center space-x-3 p-3.5 bg-red-950/60 border border-red-800/60 text-red-200 rounded-xl text-sm">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin or f_student1"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Development Quick Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-xs">
            <div className="flex items-center space-x-1.5 text-amber-400 font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sample Login Credentials</span>
            </div>
            <div className="grid grid-cols-1 gap-2 text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-slate-300 font-medium">Admin:</span>{' '}
                <code className="text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded">admin</code> / <code className="text-amber-300 bg-slate-800 px-1.5 py-0.5 rounded">admin123</code>
              </div>
              <div>
                <span className="text-pink-300 font-medium">Girls' Bench Student:</span>{' '}
                <code className="text-pink-300 bg-slate-800 px-1.5 py-0.5 rounded">f_student1</code> / <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">student123</code>
              </div>
              <div>
                <span className="text-blue-300 font-medium">Boys' Bench Student:</span>{' '}
                <code className="text-blue-300 bg-slate-800 px-1.5 py-0.5 rounded">m_student1</code> / <code className="text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">student123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
