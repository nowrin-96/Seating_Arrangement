import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw, User, Users, Info, Layers } from 'lucide-react';

export default function SeatingChart({
  seatingData,
  selectedDate,
  onDateChange,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek
}) {
  if (!seatingData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { rotation_start_date, week_index, day_name, female_seating, male_seating } = seatingData;

  // Group seating by Column name
  const columns = {
    C1: female_seating,
    C2: male_seating.filter(s => s.physical_bench.column === 'C2'),
    C3: male_seating.filter(s => s.physical_bench.column === 'C3'),
    C4: male_seating.filter(s => s.physical_bench.column === 'C4')
  };

  return (
    <div className="space-y-8">
      {/* Date & Navigation Toolbar */}
      <div className="chalkboard-panel p-4 sm:p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <Calendar className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Classroom Seating Chart (20 Benches)</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {day_name || 'Today'} (Week {week_index})
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Rotation Base (Week 0): <span className="text-slate-200 font-mono">{rotation_start_date}</span>
            </p>
          </div>
        </div>

        {/* Date Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={onPrevWeek}
            className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev Week</span>
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />

          <button
            onClick={onNextWeek}
            className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            title="Next Week"
          >
            <span className="hidden sm:inline">Next Week</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onCurrentWeek}
            className="flex items-center space-x-1 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold border border-amber-500/40 transition-colors"
            title="Jump to Today"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Today</span>
          </button>
        </div>
      </div>

      {/* Rotation Rules Information Banner */}
      <div className="flex items-start space-x-3 p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300">
        <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div><strong className="text-white">Daily Seat Rotation:</strong> Benches in each column shift down 1 seat position every day.</div>
          <div><strong className="text-white">Weekly Student Shuffle:</strong> Classmate partners deterministically shuffle every Monday (C1 Girls among C1, C2–C4 Boys among C2–C4).</div>
        </div>
      </div>

      {/* 4 COLUMNS LAYOUT (C1 Girls, C2 Boys, C3 Boys, C4 Boys) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* COLUMN C1 (GIRLS - 5 BENCHES) */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-pink-500/40 pb-2">
            <Layers className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-bold text-pink-300 uppercase tracking-wider">
              Column C1 (Girls - 5 Benches)
            </h3>
          </div>

          <div className="space-y-3">
            {columns.C1.map(({ physical_bench, students }) => (
              <div
                key={physical_bench.id}
                className="bench-wood-card female-glow rounded-xl p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
                    <span className="text-base font-black text-pink-400 font-mono">{physical_bench.name}</span>
                    <div className="flex items-center space-x-1 text-slate-400 text-xs font-medium">
                      <Users className="w-3.5 h-3.5 text-pink-400" />
                      <span>{students.length}/{physical_bench.capacity} Seats</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="bg-slate-900/80 border border-slate-800 rounded-lg p-1.5 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-1.5 overflow-hidden">
                          <User className="w-3 h-3 text-pink-400 shrink-0" />
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {student.full_name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-pink-300 bg-pink-950/60 px-1 py-0.5 rounded border border-pink-900/40">
                          {student.roll_number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN C2 (BOYS - 5 BENCHES) */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-blue-500/40 pb-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider">
              Column C2 (Boys - 5 Benches)
            </h3>
          </div>

          <div className="space-y-3">
            {columns.C2.map(({ physical_bench, students }) => (
              <div
                key={physical_bench.id}
                className="bench-wood-card male-glow rounded-xl p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
                    <span className="text-base font-black text-blue-400 font-mono">{physical_bench.name}</span>
                    <div className="flex items-center space-x-1 text-slate-400 text-xs font-medium">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>{students.length}/{physical_bench.capacity} Seats</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="bg-slate-900/80 border border-slate-800 rounded-lg p-1.5 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-1.5 overflow-hidden">
                          <User className="w-3 h-3 text-blue-400 shrink-0" />
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {student.full_name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950/60 px-1 py-0.5 rounded border border-blue-900/40">
                          {student.roll_number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN C3 (BOYS - 5 BENCHES) */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-blue-500/40 pb-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider">
              Column C3 (Boys - 5 Benches)
            </h3>
          </div>

          <div className="space-y-3">
            {columns.C3.map(({ physical_bench, students }) => (
              <div
                key={physical_bench.id}
                className="bench-wood-card male-glow rounded-xl p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
                    <span className="text-base font-black text-blue-400 font-mono">{physical_bench.name}</span>
                    <div className="flex items-center space-x-1 text-slate-400 text-xs font-medium">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>{students.length}/{physical_bench.capacity} Seats</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="bg-slate-900/80 border border-slate-800 rounded-lg p-1.5 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-1.5 overflow-hidden">
                          <User className="w-3 h-3 text-blue-400 shrink-0" />
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {student.full_name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950/60 px-1 py-0.5 rounded border border-blue-900/40">
                          {student.roll_number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN C4 (BOYS - 5 BENCHES) */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-blue-500/40 pb-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wider">
              Column C4 (Boys - 5 Benches)
            </h3>
          </div>

          <div className="space-y-3">
            {columns.C4.map(({ physical_bench, students }) => (
              <div
                key={physical_bench.id}
                className="bench-wood-card male-glow rounded-xl p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
                    <span className="text-base font-black text-blue-400 font-mono">{physical_bench.name}</span>
                    <div className="flex items-center space-x-1 text-slate-400 text-xs font-medium">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      <span>{students.length}/{physical_bench.capacity} Seats</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="bg-slate-900/80 border border-slate-800 rounded-lg p-1.5 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-1.5 overflow-hidden">
                          <User className="w-3 h-3 text-blue-400 shrink-0" />
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {student.full_name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950/60 px-1 py-0.5 rounded border border-blue-900/40">
                          {student.roll_number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
