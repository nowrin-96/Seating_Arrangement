import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Edit3, Save, X, Armchair, AlertCircle } from 'lucide-react';
import { getBenches, saveBenches } from '../utils/storage';

export default function BenchManager({ onRefreshSeatingChart }) {
  const [benches, setBenches] = useState([]);
  const [error, setError] = useState('');

  // New Bench Form State
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState('female');
  const [newCapacity, setNewCapacity] = useState(2);

  // Edit Mode State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', gender: 'female', capacity: 2 });

  const fetchBenches = () => {
    const list = getBenches();
    setBenches(list);
  };

  useEffect(() => {
    fetchBenches();
  }, []);

  const handleAddBench = (e) => {
    e.preventDefault();
    setError('');

    if (!newName.trim()) return;

    const list = getBenches();
    const maxPos = list.filter(b => b.gender === newGender).reduce((max, b) => Math.max(max, b.position), -1);
    const newBench = {
      id: Date.now(),
      name: newName.trim(),
      gender: newGender,
      capacity: parseInt(newCapacity),
      position: maxPos + 1
    };

    const updated = [...list, newBench];
    saveBenches(updated);

    setNewName('');
    fetchBenches();
    if (onRefreshSeatingChart) onRefreshSeatingChart();
  };

  const handleStartEdit = (bench) => {
    setEditingId(bench.id);
    setEditForm({ name: bench.name, gender: bench.gender, capacity: bench.capacity });
  };

  const handleSaveEdit = (id) => {
    const list = getBenches();
    const updated = list.map(b => b.id === id ? { ...b, ...editForm } : b);
    saveBenches(updated);

    setEditingId(null);
    fetchBenches();
    if (onRefreshSeatingChart) onRefreshSeatingChart();
  };

  const handleDeleteBench = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete bench "${name}"?`)) return;

    const list = getBenches();
    const updated = list.filter(b => b.id !== id);
    saveBenches(updated);

    fetchBenches();
    if (onRefreshSeatingChart) onRefreshSeatingChart();
  };

  const handleMovePosition = (gender, index, direction) => {
    const list = getBenches();
    const genderBenches = list.filter(b => b.gender === gender).sort((a, b) => a.position - b.position);
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= genderBenches.length) return;

    const tempPos = genderBenches[index].position;
    genderBenches[index].position = genderBenches[targetIndex].position;
    genderBenches[targetIndex].position = tempPos;

    // Update positions in full list
    const updated = list.map(b => {
      const match = genderBenches.find(gb => gb.id === b.id);
      return match ? { ...b, position: match.position } : b;
    });

    saveBenches(updated);
    fetchBenches();
    if (onRefreshSeatingChart) onRefreshSeatingChart();
  };

  const femaleBenches = benches.filter(b => b.gender === 'female').sort((a, b) => a.position - b.position);
  const maleBenches = benches.filter(b => b.gender === 'male').sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-8">
      {/* Header & Add Bench Form */}
      <div className="chalkboard-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Armchair className="w-5 h-5 text-amber-400" />
              <span>Physical Bench Management ({benches.length} Total Benches)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Add, edit capacity, or reorder physical benches in the front-to-back classroom layout.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Add Bench Form */}
        <form onSubmit={handleAddBench} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Bench Name</label>
            <input
              type="text"
              placeholder="e.g. B22"
              required
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Gender Group</label>
            <select
              value={newGender}
              onChange={e => setNewGender(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="female">Girls' Bench (Female)</option>
              <option value="male">Boys' Bench (Male)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Seat Capacity</label>
            <select
              value={newCapacity}
              onChange={e => setNewCapacity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value={2}>2 Seats</option>
              <option value={3}>3 Seats</option>
              <option value={4}>4 Seats</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bench</span>
            </button>
          </div>
        </form>
      </div>

      {/* Render Bench Lists by Gender */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Girls Benches Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-pink-300 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              <span>Girls' Benches ({femaleBenches.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Position 1 (Front) to Back</span>
          </div>

          <div className="space-y-3">
            {femaleBenches.map((b, idx) => (
              <div
                key={b.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between hover:border-pink-500/40 transition-colors"
              >
                {editingId === b.id ? (
                  <div className="flex items-center space-x-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded text-pink-300 font-bold w-20"
                    />
                    <select
                      value={editForm.capacity}
                      onChange={e => setEditForm({ ...editForm, capacity: parseInt(e.target.value) })}
                      className="bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded text-slate-200"
                    >
                      <option value={2}>2 Seats</option>
                      <option value={3}>3 Seats</option>
                    </select>
                    <button
                      onClick={() => handleSaveEdit(b.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                      title="Save"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-slate-400 hover:text-slate-300"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-pink-400 font-mono">{b.name}</span>
                        <span className="text-[10px] bg-pink-950 text-pink-300 px-2 py-0.5 rounded border border-pink-900/50">
                          {b.capacity} Seats
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleMovePosition('female', idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMovePosition('female', idx, 1)}
                    disabled={idx === femaleBenches.length - 1}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStartEdit(b)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBench(b.id, b.name)}
                    className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Boys Benches Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Boys' Benches ({maleBenches.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Position 1 (Front) to Back</span>
          </div>

          <div className="space-y-3">
            {maleBenches.map((b, idx) => (
              <div
                key={b.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between hover:border-blue-500/40 transition-colors"
              >
                {editingId === b.id ? (
                  <div className="flex items-center space-x-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded text-blue-300 font-bold w-20"
                    />
                    <select
                      value={editForm.capacity}
                      onChange={e => setEditForm({ ...editForm, capacity: parseInt(e.target.value) })}
                      className="bg-slate-950 border border-slate-700 text-xs px-2 py-1 rounded text-slate-200"
                    >
                      <option value={2}>2 Seats</option>
                      <option value={3}>3 Seats</option>
                    </select>
                    <button
                      onClick={() => handleSaveEdit(b.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                      title="Save"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-slate-400 hover:text-slate-300"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-950 px-2 py-1 rounded">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-bold text-blue-400 font-mono">{b.name}</span>
                        <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-900/50">
                          {b.capacity} Seats
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleMovePosition('male', idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMovePosition('male', idx, 1)}
                    disabled={idx === maleBenches.length - 1}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 rounded"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStartEdit(b)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBench(b.id, b.name)}
                    className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
