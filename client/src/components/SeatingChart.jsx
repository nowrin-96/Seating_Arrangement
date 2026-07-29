import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, RotateCcw, User, Users, Info } from 'lucide-react';

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

  const { rotation_start_date, week_index, female_seating, male_seating } = seatingData;

  return (
    <div className="space-y-8">
      {/* Date Navigation Toolbar */}
      <div className="chalkboard-panel p-4 sm:p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Week Info */}
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <Calendar className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white">Seating Chart</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {week_index === 0 ? 'Week 0 (Base Seating)' : `Week ${week_index > 0 ? `+${week_index}` : week_index}`}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Rotation Start Date (Week 0): <span className="text-slate-200 font-mono">{rotation_start_date}</span>
            </p>
          </div>
        </div>

        {/* Date Selector Controls */}
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

      {/* Rotation Notice Banner */}
      <div className="flex items-start space-x-3 p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300">
        <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Independent Gender Rotation Rule:</span> Physical bench desk identities (B1–B21) and capacities are fixed in position. Female benches rotate strictly within the female group, and male benches rotate strictly within the male group.
        </div>
      </div>

      {/* GIRLS' BENCHES SECTION */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <span className="px-3 py-1 bg-pink-500/20 text-pink-300 border border-pink-500/40 rounded-lg text-xs font-bold uppercase tracking-wider">
            Girls' Row ({female_seating.length} Benches)
          </span>
          <div className="h-px bg-pink-950 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {female_seating.map(({ physical_bench, orig_bench, students }) => (
            <div
              key={physical_bench.id}
              className="bench-wood-card female-glow rounded-xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform"
            >
              <div>
                {/* Bench Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-black text-pink-400 font-mono">{physical_bench.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-pink-950 text-pink-300 border border-pink-800/50 rounded">
                      Pos #{physical_bench.position + 1}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400 text-xs font-medium">
                    <Users className="w-3.5 h-3.5 text-pink-400" />
                    <span>{students.length}/{physical_bench.capacity}</span>
                  </div>
                </div>

                {/* Occupant Students */}
                <div className="space-y-2">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <div
                        key={student.id}
                        className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2 overflow-hidden">
                          <User className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {student.full_name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-pink-300 bg-pink-950/60 px-1.5 py-0.5 rounded border border-pink-900/40">
                          {student.roll_number}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2 text-center">Empty Bench</p>
                  )}
                </div>
              </div>

              {/* Orig Group Footer */}
              <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Group Originated:</span>
                <span className="text-pink-300 font-mono font-semibold">{orig_bench ? orig_bench.name : 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOYS' BENCHES SECTION */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-lg text-xs font-bold uppercase tracking-wider">
            Boys' Row ({male_seating.length} Benches)
          </span>
          <div className="h-px bg-blue-950 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {male_seating.map(({ physical_bench, orig_bench, students }) => (
            <div
              key={physical_bench.id}
              className="bench-wood-card male-glow rounded-xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform"
            >
              <div>
                {/* Bench Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-black text-blue-400 font-mono">{physical_bench.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-950 text-blue-300 border border-blue-800/50 rounded">
                      Pos #{physical_bench.position + 1}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400 text-xs font-medium">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>{students.length}/{physical_bench.capacity} Seats</span>
                  </div>
                </div>

                {/* Occupant Students */}
                <div className="space-y-2">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <div
                        key={student.id}
                        className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2 overflow-hidden">
                          <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {student.full_name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-900/40">
                          {student.roll_number}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic py-2 text-center">Empty Bench</p>
                  )}
                </div>
              </div>

              {/* Orig Group Footer */}
              <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Group Originated:</span>
                <span className="text-blue-300 font-mono font-semibold">{orig_bench ? orig_bench.name : 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
