import bcrypt from 'bcryptjs';
import { INITIAL_CONFIG, INITIAL_ADMIN, INITIAL_BENCHES, INITIAL_STUDENTS } from '../data/classData';

const CONFIG_KEY = 'bench_rotation_config';
const ADMIN_KEY = 'bench_rotation_admin';
const BENCHES_KEY = 'bench_rotation_benches';
const STUDENTS_KEY = 'bench_rotation_students';
const SESSION_KEY = 'bench_rotation_session';

// Initialize LocalStorage with default data if empty
export function initStorage() {
  if (!localStorage.getItem(CONFIG_KEY)) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(INITIAL_CONFIG));
  }
  if (!localStorage.getItem(ADMIN_KEY)) {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(INITIAL_ADMIN));
  }
  if (!localStorage.getItem(BENCHES_KEY)) {
    localStorage.setItem(BENCHES_KEY, JSON.stringify(INITIAL_BENCHES));
  }
  if (!localStorage.getItem(STUDENTS_KEY)) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(INITIAL_STUDENTS));
  }
}

// Ensure init on module load
initStorage();

export function getConfig() {
  return JSON.parse(localStorage.getItem(CONFIG_KEY)) || INITIAL_CONFIG;
}

export function saveConfig(newConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
}

export function getBenches() {
  return JSON.parse(localStorage.getItem(BENCHES_KEY)) || INITIAL_BENCHES;
}

export function saveBenches(benches) {
  localStorage.setItem(BENCHES_KEY, JSON.stringify(benches));
}

export function getStudents() {
  return JSON.parse(localStorage.getItem(STUDENTS_KEY)) || INITIAL_STUDENTS;
}

export function saveStudents(students) {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

export function getAdmin() {
  return JSON.parse(localStorage.getItem(ADMIN_KEY)) || INITIAL_ADMIN;
}

export function reseedStorage() {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(INITIAL_CONFIG));
  localStorage.setItem(ADMIN_KEY, JSON.stringify(INITIAL_ADMIN));
  localStorage.setItem(BENCHES_KEY, JSON.stringify(INITIAL_BENCHES));
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(INITIAL_STUDENTS));
}

// ----------------------------------------------------
// AUTHENTICATION LOGIC
// ----------------------------------------------------

export function login(username, password) {
  const trimmed = username.trim();
  const admin = getAdmin();

  // 1. Check Admin
  if (admin && admin.username === trimmed) {
    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    if (isMatch) {
      const session = { username: admin.username, role: 'admin' };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { success: true, user: session };
    }
  }

  // 2. Check Student
  const students = getStudents();
  const student = students.find(s => s.username === trimmed);
  if (student) {
    const isMatch = bcrypt.compareSync(password, student.passwordHash);
    if (isMatch) {
      const session = {
        id: student.id,
        username: student.username,
        full_name: student.full_name,
        roll_number: student.roll_number,
        gender: student.gender,
        role: 'student'
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { success: true, user: session };
    }
  }

  // 3. Generic error
  return { success: false, error: 'Incorrect username or password' };
}

export function getCurrentSession() {
  const sess = localStorage.getItem(SESSION_KEY);
  return sess ? JSON.parse(sess) : null;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

// ----------------------------------------------------
// ROTATION CALCULATIONS
// ----------------------------------------------------

export function getWeekIndex(startDateStr, targetDateStr) {
  const start = new Date(startDateStr);
  const target = new Date(targetDateStr);
  
  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const targetUtc = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  
  const diffDays = Math.floor((targetUtc - startUtc) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

function getSeatingForGenderList(genderBenches, studentsInGender, weekIndex) {
  const n = genderBenches.length;
  if (n === 0) return [];

  const offset = ((weekIndex % n) + n) % n;

  const studentsByOrigBenchId = {};
  genderBenches.forEach(b => { studentsByOrigBenchId[b.id] = []; });
  
  studentsInGender.forEach(student => {
    if (studentsByOrigBenchId[student.bench_id]) {
      studentsByOrigBenchId[student.bench_id].push({
        id: student.id,
        username: student.username,
        full_name: student.full_name,
        roll_number: student.roll_number,
        gender: student.gender,
        orig_bench_id: student.bench_id
      });
    }
  });

  return genderBenches.map((physicalBench, p) => {
    const origPos = ((p - offset) % n + n) % n;
    const origBench = genderBenches[origPos];
    const occupantStudents = origBench ? (studentsByOrigBenchId[origBench.id] || []) : [];

    return {
      physical_bench: physicalBench,
      orig_bench: origBench,
      students: occupantStudents
    };
  });
}

export function getSeatingChart(targetDateStr) {
  const config = getConfig();
  const benches = getBenches();
  const students = getStudents();

  const weekIndex = getWeekIndex(config.rotation_start_date, targetDateStr);

  const femaleBenches = benches.filter(b => b.gender === 'female').sort((a, b) => a.position - b.position);
  const femaleStudents = students.filter(s => s.gender === 'female');

  const maleBenches = benches.filter(b => b.gender === 'male').sort((a, b) => a.position - b.position);
  const maleStudents = students.filter(s => s.gender === 'male');

  const femaleSeating = getSeatingForGenderList(femaleBenches, femaleStudents, weekIndex);
  const maleSeating = getSeatingForGenderList(maleBenches, maleStudents, weekIndex);

  return {
    rotation_start_date: config.rotation_start_date,
    target_date: targetDateStr,
    week_index: weekIndex,
    female_seating: femaleSeating,
    male_seating: maleSeating
  };
}

export function getStudentCurrentBench(userId, targetDateStr) {
  const config = getConfig();
  const benches = getBenches();
  const students = getStudents();

  const student = students.find(s => s.id === userId);
  if (!student) return null;

  const weekIndex = getWeekIndex(config.rotation_start_date, targetDateStr);

  const genderBenches = benches.filter(b => b.gender === student.gender).sort((a, b) => a.position - b.position);
  const n = genderBenches.length;
  if (n === 0) return null;

  const origBenchIndex = genderBenches.findIndex(b => b.id === student.bench_id);
  if (origBenchIndex === -1) return null;

  const offset = ((weekIndex % n) + n) % n;
  const currentPos = (origBenchIndex + offset) % n;
  const currentPhysicalBench = genderBenches[currentPos];

  const benchmates = students.filter(s => s.gender === student.gender && s.bench_id === student.bench_id);

  return {
    student: {
      id: student.id,
      full_name: student.full_name,
      roll_number: student.roll_number,
      gender: student.gender
    },
    target_date: targetDateStr,
    rotation_start_date: config.rotation_start_date,
    week_index: weekIndex,
    bench_info: {
      physical_bench: currentPhysicalBench,
      week_index: weekIndex,
      students: benchmates.map(s => ({
        id: s.id,
        full_name: s.full_name,
        roll_number: s.roll_number,
        is_current_user: s.id === student.id
      }))
    }
  };
}
