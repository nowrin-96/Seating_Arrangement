import React, { useState, useEffect } from 'react';
import { Calendar, Save, RotateCcw, Check, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { getConfig, saveConfig, reseedStorage } from '../utils/storage';

export default function ConfigManager({ onRefreshSeatingChart }) {
  const [rotationStartDate, setRotationStartDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchConfig = () => {
    const config = getConfig();
    setRotationStartDate(config.rotation_start_date || '');
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const current = getConfig();
    saveConfig({ ...current, rotation_start_date: rotationStartDate });

    setMessage('Rotation start date updated successfully!');
    if (onRefreshSeatingChart) onRefreshSeatingChart();
  };

  const handleReseed = () => {
    if (!window.confirm('WARNING: Reseeding will reset all custom benches and students back to default template. Proceed?')) {
      return;
    }

    reseedStorage();
    setMessage('Database reseeded with 21 benches and 55 default students!');
    fetchConfig();
    if (onRefreshSeatingChart) onRefreshSeatingChart();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Rotation Start Date Card */}
      <div className="chalkboard-panel p-6 rounded-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <Calendar className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Rotation Start Date (Week Zero)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              The anchor Monday date where physical bench seats exactly match each student's starting rotation group.
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-200 rounded-xl text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Week 0 Monday Date
            </label>
            <input
              type="date"
              required
              value={rotationStartDate}
              onChange={e => setRotationStartDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 w-full sm:w-64 font-mono"
            />
          </div>

          <div className="flex items-center space-x-3 p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-300">
            <Info className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              Changing this date shifts all weekly rotation offsets backward or forward for both girls' and boys' bench rows.
            </div>
          </div>

          <button
            type="submit"
            className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Start Date</span>
          </button>
        </form>
      </div>

      {/* Reseed / Reset Card */}
      <div className="chalkboard-panel p-6 rounded-2xl border-red-950/50">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-red-950/40 border border-red-800/40 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Reseed Default Data</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Reset database to initial state (1 admin, 21 benches, 55 default students).
            </p>
          </div>
        </div>

        <button
          onClick={handleReseed}
          className="py-2.5 px-4 bg-red-950/50 hover:bg-red-900/70 border border-red-800/60 text-red-200 font-semibold rounded-xl text-xs flex items-center space-x-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4 text-red-400" />
          <span>Reseed Database to Defaults</span>
        </button>
      </div>
    </div>
  );
}
