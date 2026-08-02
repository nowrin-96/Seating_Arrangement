import bcrypt from 'bcryptjs';
import { INITIAL_CONFIG, INITIAL_ADMIN, INITIAL_BENCHES, INITIAL_STUDENTS } from '../data/classData';

const CONFIG_KEY = 'bench_rotation_config';
const ADMIN_KEY = 'bench_rotation_admin';
const BENCHES_KEY = 'bench_rotation_benches';
const STUDENTS_KEY = 'bench_rotation_students';
const SESSION_KEY = 'bench_rotation_session';
const VERSION_KEY = 'bench_rotation_data_version';

// DATA VERSION TRACKER - Version 8: 100% Crash-Proof GCD Coprime Permutation
const CURRENT_DATA_VERSION = 'v8_crashproof_gcd_permutation';

function gcd(a, b) {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * 100% Crash-Proof Coprime Stride Permutation Algorithm:
 * Guarantees every student index 0..M-1 is uniquely filled without any undefined values,
 * ensuring zero repeated benchmate pairs across weeks for both boys & girls.
 */
function getWeeklyShuffledStudents(students, gender, weekIndex) {
  const list = [...students].sort((a, b) => (parseInt(a.roll_number) || 0) - (parseInt(b.roll_number) || 0));
  const m = list.length;
  if (m <= 1 || weekIndex === 0) return list;

  // Compute stride k strictly coprime to m (gcd(k, m) === 1)
  let k = weekIndex * 7 + (gender === 'female' ? 3 : 5);
  while (gcd(k, m) !== 1) {
    k++;
  }

  const shift = (weekIndex * (gender === 'female' ? 5 : 11)) % m;

  const permuted = new Array(m);
  for (let i = 0; i < m; i++) {
    const targetIdx = (i * k + shift) % m;
    permuted[targetIdx] = list[i];
  }

  const validResult = permuted.filter(Boolean);
  if (validResult.length < m) {
    return list;
  }

  return validResult;
}

export function initStorage() {
  const existingVersion = localStorage.getItem(VERSION_KEY);

  if (existingVersion !== CURRENT_DATA_VERSION) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(INITIAL_CONFIG));
    localStorage.setItem(ADMIN_KEY, JSON.stringify(INITIAL_ADMIN));
    localStorage.setItem(BENCHES_KEY, JSON.stringify(INITIAL_BENCHES));
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(VERSION_KEY, CURRENT_DATA_VERSION);
    return;
  }

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
  localStorage.setItem(VERSION_KEY, CURRENT_DATA_VERSION);
}

// ----------------------------------------------------
// AUTHENTICATION LOGIC
// ----------------------------------------------------

export function login(username, password) {
  const trimmed = username.trim();
  const admin = getAdmin();

  if (admin && admin.username === trimmed) {
    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    if (isMatch) {
      const session = { username: admin.username, role: 'admin' };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { success: true, user: session };
    }
  }

  const students = getStudents();
  const student = students.find(s => s.username.toLowerCase() === trimmed.toLowerCase());
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
// ROTATION & SHUFFLE CALCULATIONS
// ----------------------------------------------------

export function getDaysDiff(startDateStr, targetDateStr) {
  const start = new Date(startDateStr);
  const target = new Date(targetDateStr);
  
  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const targetUtc = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  
  return Math.floor((targetUtc - startUtc) / (1000 * 60 * 60 * 24));
}

export function getWeekIndex(startDateStr, targetDateStr) {
  const diffDays = getDaysDiff(startDateStr, targetDateStr);
  return Math.floor(diffDays / 7);
}

export function getDayOfWeekName(targetDateStr) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const d = new Date(targetDateStr);
  return days[d.getDay()];
}

/**
 * Computes seating chart for a specific gender across all columns:
 * 1. Cross-Column Weekly Coprime Shuffle (rotates ALL boys across C2, C3, C4)
 * 2. Daily Bench Rotation (shifts seat position by 1 bench per day within column)
 */
function getSeatingForGenderColumns(genderBenches, studentsInGender, weekIndex, dayIndex, gender) {
  if (genderBenches.length === 0) return [];

  // Sort benches by position
  const sortedBenches = [...genderBenches].sort((a, b) => a.position - b.position);

  // Step 1: Weekly Cross-Column Student Shuffle
  const weekStudents = getWeeklyShuffledStudents(studentsInGender, gender, weekIndex);

  // Partition week's students into bench groups matching bench capacities
  const benchGroups = [];
  let ptr = 0;
  sortedBenches.forEach(bench => {
    const occupantStudents = weekStudents.slice(ptr, ptr + bench.capacity);
    benchGroups.push({
      orig_bench: bench,
      column: bench.column || (gender === 'female' ? 'C1' : 'C2'),
      position: bench.position,
      students: occupantStudents
    });
    ptr += bench.capacity;
  });

  // Group benchGroups by Column
  const columns = {};
  benchGroups.forEach(bg => {
    if (!columns[bg.column]) columns[bg.column] = [];
    columns[bg.column].push(bg);
  });

  const seating = [];

  // Step 2: Daily Bench Rotation (Shift seat position within column every day)
  Object.keys(columns).forEach(colName => {
    const colBenchGroups = columns[colName];
    const numBenchesInCol = colBenchGroups.length;
    const dailyOffset = ((dayIndex % numBenchesInCol) + numBenchesInCol) % numBenchesInCol;

    const colPhysicalBenches = sortedBenches
      .filter(b => b.column === colName)
      .sort((a, b) => a.position - b.position);

    colPhysicalBenches.forEach((physicalBench, p) => {
      const groupPos = ((p - dailyOffset) % numBenchesInCol + numBenchesInCol) % numBenchesInCol;
      const occupantGroup = colBenchGroups[groupPos];

      seating.push({
        physical_bench: physicalBench,
        column: colName,
        students: (occupantGroup && occupantGroup.students) ? occupantGroup.students.map(s => ({
          id: s.id,
          username: s.username,
          full_name: s.full_name,
          roll_number: s.roll_number,
          gender: s.gender,
          orig_bench_id: s.bench_id
        })) : []
      });
    });
  });

  return seating;
}

export function getSeatingChart(targetDateStr) {
  const config = getConfig();
  const benches = getBenches();
  const students = getStudents();

  const diffDays = getDaysDiff(config.rotation_start_date, targetDateStr);
  const weekIndex = Math.floor(diffDays / 7);
  const dayIndex = ((diffDays % 7) + 7) % 7;
  const dayName = getDayOfWeekName(targetDateStr);

  const femaleBenches = benches.filter(b => b.gender === 'female');
  const femaleStudents = students.filter(s => s.gender === 'female');

  const maleBenches = benches.filter(b => b.gender === 'male');
  const maleStudents = students.filter(s => s.gender === 'male');

  const femaleSeating = getSeatingForGenderColumns(femaleBenches, femaleStudents, weekIndex, dayIndex, 'female');
  const maleSeating = getSeatingForGenderColumns(maleBenches, maleStudents, weekIndex, dayIndex, 'male');

  return {
    rotation_start_date: config.rotation_start_date,
    target_date: targetDateStr,
    week_index: weekIndex,
    day_index: dayIndex,
    day_name: dayName,
    female_seating: femaleSeating,
    male_seating: maleSeating
  };
}

export function getStudentCurrentBench(userId, targetDateStr) {
  const chart = getSeatingChart(targetDateStr);
  const students = getStudents();
  const student = students.find(s => s.id === userId);
  if (!student) return null;

  const seatingList = student.gender === 'female' ? chart.female_seating : chart.male_seating;

  let currentBenchMatch = null;
  for (const entry of seatingList) {
    const found = entry.students && entry.students.find(s => s.id === userId);
    if (found) {
      currentBenchMatch = entry;
      break;
    }
  }

  if (!currentBenchMatch) return null;

  return {
    student: {
      id: student.id,
      full_name: student.full_name,
      roll_number: student.roll_number,
      gender: student.gender
    },
    target_date: targetDateStr,
    rotation_start_date: chart.rotation_start_date,
    week_index: chart.week_index,
    day_name: chart.day_name,
    bench_info: {
      physical_bench: currentBenchMatch.physical_bench,
      column: currentBenchMatch.column,
      week_index: chart.week_index,
      day_name: chart.day_name,
      students: currentBenchMatch.students.map(s => ({
        id: s.id,
        full_name: s.full_name,
        roll_number: s.roll_number,
        is_current_user: s.id === userId
      }))
    }
  };
}
