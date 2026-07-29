import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Edit3, Trash2, Key, Users, AlertCircle, Check, X } from 'lucide-react';
import bcrypt from 'bcryptjs';
import { getStudents, saveStudents, getBenches } from '../utils/storage';

export default function StudentManager({ onRefreshSeatingChart }) {
  const [students, setStudents] = useState([]);
  const [benches, setBenches] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal / Form state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    roll_number: '',
    gender: 'female',
    bench_id: ''
  });

  const fetchData = () => {
    const sList = getStudents();
    const bList = getBenches();
    setStudents(sList);
    setBenches(bList);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    const availableBenches = benches.filter(b => b.gender === 'female');
    setFormData({
      username: '',
      password: '',
      full_name: '',
      roll_number: '',
      gender: 'female',
      bench_id: availableBenches.length > 0 ? availableBenches[0].id : ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      username: student.username,
      password: '', // Blank unless resetting password
      full_name: student.full_name,
      roll_number: student.roll_number,
      gender: student.gender,
      bench_id: student.bench_id
    });
    setIsModalOpen(true);
  };

  const handleGenderChange = (gender) => {
    const availableBenches = benches.filter(b => b.gender === gender);
    setFormData({
      ...formData,
      gender,
      bench_id: availableBenches.length > 0 ? availableBenches[0].id : ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const sList = getStudents();

    // Check duplicate username or roll number
    const duplicate = sList.find(s =>
      (!editingStudent || s.id !== editingStudent.id) &&
      (s.username.toLowerCase() === formData.username.trim().toLowerCase() ||
       s.roll_number.toLowerCase() === formData.roll_number.trim().toLowerCase())
    );

    if (duplicate) {
      setError('Username or Roll Number already exists in the system.');
      return;
    }

    if (editingStudent) {
      const updated = sList.map(s => {
        if (s.id === editingStudent.id) {
          const pwdHash = formData.password && formData.password.trim().length > 0
            ? bcrypt.hashSync(formData.password.trim(), 10)
            : s.passwordHash;

          return {
            ...s,
            username: formData.username.trim(),
            full_name: formData.full_name.trim(),
            roll_number: formData.roll_number.trim(),
            gender: formData.gender,
            bench_id: parseInt(formData.bench_id),
            passwordHash: pwdHash
          };
        }
        return s;
      });

      saveStudents(updated);
    } else {
      const newStudent = {
        id: Date.now(),
        username: formData.username.trim(),
        full_name: formData.full_name.trim(),
        roll_number: formData.roll_number.trim(),
        gender: formData.gender,
        bench_id: parseInt(formData.bench_id),
        passwordHash: bcrypt.hashSync(formData.password.trim() || 'student123', 10)
      };

      saveStudents([...sList, newStudent]);
    }

    setIsModalOpen(false);
    fetchData();
    if (onRefreshSeatingChart) onRefreshSeatingChart();
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student "${name}"?`)) return;

    const sList = getStudents();
    const updated = sList.filter(s => s.id !== id);
    saveStudents(updated);

    fetchData();
    if (onRefreshSeatingChart) onRefreshSeatingChart();
  };

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  );

  const availableBenchesForGender = benches.filter(b => b.gender === formData.gender);

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="chalkboard-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Student User Directory ({students.length} Accounts)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage student user accounts, credentials, and week-zero bench group assignments.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, roll #..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shrink-0 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Student Accounts Table */}
      <div className="chalkboard-panel rounded-2xl overflow-hidden shadow-xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Roll Number</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Rotation Group Bench (Week 0)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const benchMatch = benches.find(b => b.id === student.bench_id);
                  return (
                    <tr key={student.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-amber-300">
                        {student.roll_number}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-100">
                        {student.full_name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {student.username}
                      </td>
                      <td className="px-4 py-3">
                        {student.gender === 'female' ? (
                          <span className="px-2 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-800/50 font-semibold text-[10px]">
                            Female
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50 font-semibold text-[10px]">
                            Male
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-200 border border-slate-700 font-bold">
                          {benchMatch ? benchMatch.name : 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(student)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                            title="Edit Student / Reset Password"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id, student.full_name)}
                            className="p-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-lg transition-colors"
                            title="Delete Student Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic">
                    No students match the search filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="chalkboard-panel max-w-lg w-full rounded-2xl p-6 shadow-2xl relative border border-slate-700">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>{editingStudent ? 'Edit Student Account' : 'Add New Student'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="e.g. Alice Johnson"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={formData.roll_number}
                    onChange={e => setFormData({ ...formData, roll_number: e.target.value })}
                    placeholder="e.g. F101"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. f_student1"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    {editingStudent ? 'Reset Password (Optional)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    required={!editingStudent}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingStudent ? 'Leave blank to keep' : '••••••••'}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => handleGenderChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="female">Female (Girls' Bench)</option>
                    <option value="male">Male (Boys' Bench)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Original Bench (Week 0)</label>
                  <select
                    value={formData.bench_id}
                    onChange={e => setFormData({ ...formData, bench_id: e.target.value })}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                  >
                    {availableBenchesForGender.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} (Position #{b.position + 1}, {b.capacity} Seats)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingStudent ? 'Save Changes' : 'Create Student'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
