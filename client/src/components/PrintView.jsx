import React from 'react';
import { Printer, X } from 'lucide-react';

export default function PrintView({ seatingData, onClose }) {
  if (!seatingData) return null;

  const { rotation_start_date, target_date, week_index, day_name, female_seating, male_seating } = seatingData;

  const handleTriggerPrint = () => {
    window.print();
  };

  const columns = {
    C1: female_seating,
    C2: male_seating.filter(s => s.physical_bench.column === 'C2'),
    C3: male_seating.filter(s => s.physical_bench.column === 'C3'),
    C4: male_seating.filter(s => s.physical_bench.column === 'C4')
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md p-4 sm:p-8">
      {/* Top Toolbar (Hidden during print) */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between no-print">
        <h2 className="text-xl font-bold text-white">Print Preview - Seating Chart (4 Columns)</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTriggerPrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>Print Now</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Print Document Container */}
      <div className="max-w-6xl mx-auto bg-white text-slate-950 p-8 rounded-2xl shadow-2xl print-container">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
              Classroom Seating Arrangement (20 Benches)
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              Target Date: <strong className="text-slate-900">{target_date} ({day_name})</strong> — Week Index #{week_index}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <div>Rotation Base (Week 0): {rotation_start_date}</div>
            <div>Printed On: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* 4 Columns Layout */}
        <div className="grid grid-cols-4 gap-4">
          {Object.keys(columns).map(colName => (
            <div key={colName} className="space-y-3">
              <h2 className={`text-xs font-bold uppercase tracking-wider border-b pb-1 ${colName === 'C1' ? 'text-pink-700 border-pink-300' : 'text-blue-700 border-blue-300'}`}>
                Column {colName} ({colName === 'C1' ? 'Girls' : 'Boys'})
              </h2>

              <div className="space-y-2">
                {columns[colName].map(({ physical_bench, students }) => (
                  <div key={physical_bench.id} className="border border-slate-400 p-2 rounded bg-slate-50 print-bench-card">
                    <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-1">
                      <span className="font-extrabold text-xs text-slate-900">{physical_bench.name}</span>
                      <span className="text-[9px] text-slate-600">{students.length}/{physical_bench.capacity} Seats</span>
                    </div>
                    <div className="space-y-0.5">
                      {students.map(s => (
                        <div key={s.id} className="text-[11px] flex justify-between">
                          <span className="font-semibold text-slate-900 truncate pr-1">{s.full_name}</span>
                          <span className="text-[9px] font-mono text-slate-600">{s.roll_number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
