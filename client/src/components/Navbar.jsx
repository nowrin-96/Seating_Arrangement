import React from 'react';
import { Armchair, LogOut, Printer, Download, Upload, Shield, User } from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenPrint, onOpenBackup }) {
  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-amber-600 to-amber-500 rounded-xl shadow-lg shadow-amber-950/50">
            <Armchair className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold bg-gradient-to-r from-amber-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Bench Rotation
            </h1>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">Classroom Weekly Seating System</p>
          </div>
        </div>

        {/* User Status & Actions */}
        {user ? (
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Role Badge */}
            <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              {user.role === 'admin' ? (
                <>
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Admin</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">{user.full_name || user.username}</span>
                </>
              )}
            </div>

            {/* Admin Specific Action Buttons */}
            {user.role === 'admin' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenBackup}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
                  title="Backup / Restore JSON"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Backup/Restore</span>
                </button>

                <button
                  onClick={onOpenPrint}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-emerald-700/60 hover:bg-emerald-600/80 text-emerald-100 border border-emerald-600/50 rounded-lg transition-colors"
                  title="Print Seating Chart"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Print Chart</span>
                </button>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
