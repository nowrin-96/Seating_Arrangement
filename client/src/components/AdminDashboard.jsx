import React, { useState, useEffect } from 'react';
import { Armchair, Users, Settings, Grid } from 'lucide-react';

import SeatingChart from './SeatingChart';
import BenchManager from './BenchManager';
import StudentManager from './StudentManager';
import ConfigManager from './ConfigManager';

import { getSeatingChart } from '../utils/storage';

export default function AdminDashboard({ onOpenPrint }) {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'benches' | 'students' | 'config'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [seatingData, setSeatingData] = useState(null);

  const fetchSeatingData = (dateStr) => {
    const data = getSeatingChart(dateStr);
    setSeatingData(data);
  };

  useEffect(() => {
    fetchSeatingData(selectedDate);
  }, [selectedDate]);

  const handlePrevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleCurrentWeek = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation Tabs Bar */}
      <div className="chalkboard-panel p-2 rounded-2xl flex flex-wrap gap-2 border border-slate-800">
        <button
          onClick={() => setActiveTab('chart')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chart'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Seating Chart</span>
        </button>

        <button
          onClick={() => setActiveTab('benches')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'benches'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Armchair className="w-4 h-4" />
          <span>Manage Benches</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'students'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manage Students</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'config'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Config & Rotation Date</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'chart' && (
        <SeatingChart
          seatingData={seatingData}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onCurrentWeek={handleCurrentWeek}
        />
      )}

      {activeTab === 'benches' && (
        <BenchManager onRefreshSeatingChart={() => fetchSeatingData(selectedDate)} />
      )}

      {activeTab === 'students' && (
        <StudentManager onRefreshSeatingChart={() => fetchSeatingData(selectedDate)} />
      )}

      {activeTab === 'config' && (
        <ConfigManager onRefreshSeatingChart={() => fetchSeatingData(selectedDate)} />
      )}
    </div>
  );
}
