import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, User, Users, Armchair, CheckCircle2, ShieldCheck, Calendar, RotateCcw } from 'lucide-react';
import { getStudentCurrentBench } from '../utils/storage';

export default function StudentDashboard({ user }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);

  useEffect(() => {
    const seatingInfo = getStudentCurrentBench(user.id, selectedDate);
    setData(seatingInfo);
  }, [user, selectedDate]);

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Student Welcome Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-1">
          <Armchair className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Welcome, {user.full_name || user.username}!</h2>
        <p className="text-xs text-slate-400 flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Roll No: <strong className="text-slate-200 font-mono">{user.roll_number}</strong></span>
          <span className="mx-1.5">•</span>
          <span className="capitalize">{user.gender} Student</span>
        </p>
      </div>

      {/* Date Switcher Bar (Daily & Weekly Navigation) */}
      <div className="chalkboard-panel p-4 rounded-2xl flex items-center justify-between">
        <button
          onClick={handlePrevDay}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs flex items-center space-x-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev Day</span>
        </button>

        <div className="text-center">
          <div className="text-xs font-bold text-amber-300 flex items-center justify-center space-x-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{data ? `${data.day_name} (Week ${data.week_index})` : 'Target Date'}</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-none text-[11px] text-slate-300 font-mono text-center focus:outline-none cursor-pointer"
          />
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs flex items-center space-x-1"
        >
          <span className="hidden sm:inline">Next Day</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* My Bench Details Card */}
      {data && data.bench_info ? (
        <div className={`bench-wood-card rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ${user.gender === 'female' ? 'female-glow' : 'male-glow'}`}>
          
          {/* Card Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Physical Seat</span>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`text-4xl font-black font-mono ${user.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                  {data.bench_info.physical_bench.name}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${user.gender === 'female' ? 'bg-pink-950 text-pink-300 border border-pink-800/50' : 'bg-blue-950 text-blue-300 border border-blue-800/50'}`}>
                  {data.bench_info.column ? `Column ${data.bench_info.column}` : (user.gender === 'female' ? "Girls' Bench" : "Boys' Bench")}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Row Position</span>
              <span className="text-lg font-mono font-bold text-slate-200">
                Position #{data.bench_info.physical_bench.position + 1}
              </span>
            </div>
          </div>

          {/* Benchmates List */}
          <div className="mt-6 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Students Sitting With You Today ({data.day_name})</span>
            </h3>

            <div className="space-y-2.5">
              {data.bench_info.students.map((student) => (
                <div
                  key={student.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    student.is_current_user
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                      : 'bg-slate-900/90 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${student.is_current_user ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center space-x-2">
                        <span>{student.full_name}</span>
                        {student.is_current_user && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-normal">
                            (You)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold px-2 py-1 bg-slate-950 rounded border border-slate-800 text-slate-300">
                    Roll #{student.roll_number}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Rotation Info Footer */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Daily Seat Rotation: Moves down 1 bench every day.</span>
            </div>
            <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Weekly Student Shuffle: Partners change every week.</span>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}
