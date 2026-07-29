import React, { useState } from 'react';
import { Download, Upload, X, Check, AlertCircle, FileText } from 'lucide-react';
import { getConfig, getBenches, getStudents, getAdmin, saveConfig, saveBenches, saveStudents } from '../utils/storage';

export default function BackupModal({ isOpen, onClose, onRefreshSeatingChart }) {
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleExportJSON = () => {
    try {
      const data = {
        exported_at: new Date().toISOString(),
        config: getConfig(),
        benches: getBenches(),
        students: getStudents()
      };
      
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `bench_rotation_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage('Backup JSON downloaded successfully!');
    } catch (err) {
      setError('Failed to export configuration');
    }
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setMessage('');
    setError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);

        if (json.config) saveConfig(json.config);
        if (Array.isArray(json.benches)) saveBenches(json.benches);
        if (Array.isArray(json.students)) saveStudents(json.students);

        setMessage('Backup JSON imported successfully! Seating chart updated.');
        if (onRefreshSeatingChart) onRefreshSeatingChart();
      } catch (err) {
        setError('Invalid JSON file format');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="chalkboard-panel max-w-lg w-full rounded-2xl p-6 shadow-2xl relative border border-slate-700">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Database Backup & Restore</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
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

        <div className="space-y-6">
          {/* Export JSON Option */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">Export Full Configuration</h4>
            <p className="text-xs text-slate-400">
              Download a complete JSON snapshot of all benches, student accounts, and rotation start date settings.
            </p>
            <button
              onClick={handleExportJSON}
              className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 transition-colors mt-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup JSON</span>
            </button>
          </div>

          {/* Import JSON Option */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Import Backup JSON</h4>
            <p className="text-xs text-slate-400">
              Upload a previously exported JSON backup to restore benches, students, and start date configuration.
            </p>
            <label className="inline-flex items-center space-x-2 py-2 px-4 bg-emerald-700/60 hover:bg-emerald-600/80 text-emerald-100 font-bold rounded-xl text-xs cursor-pointer transition-colors mt-2">
              <Upload className="w-4 h-4" />
              <span>{importing ? 'Importing...' : 'Select JSON File to Restore'}</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
