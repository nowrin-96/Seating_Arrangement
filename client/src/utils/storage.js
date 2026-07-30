import bcrypt from 'bcryptjs';
import { INITIAL_CONFIG, INITIAL_ADMIN, INITIAL_BENCHES, INITIAL_STUDENTS } from '../data/classData';

const CONFIG_KEY = 'bench_rotation_config';
const ADMIN_KEY = 'bench_rotation_admin';
const BENCHES_KEY = 'bench_rotation_benches';
const STUDENTS_KEY = 'bench_rotation_students';
const SESSION_KEY = 'bench_rotation_session';
const VERSION_KEY = 'bench_rotation_data_version';

// DATA VERSION TRACKER - Version 6 updates Liya Reji spelling across all devices
const CURRENT_DATA_VERSION = 'v6_liya_reji_spelling_fix';

// Seeded PRNG for deterministic weekly classmate shuffling
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function stringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/**
 * Weekly Classmate Shuffle Algorithm:
 * Shuffles students deterministically based on weekIndex and gender,
 * maximizing unique seating combinations each week.
 */
function getWeeklyShuffledStudents(students, gender, weekIndex) {
  if (weekIndex === 0) {
    return [...students];
  }

  const list = [...students];
  const seed = stringToSeed(`shuffle_${gender}_week_${weekIndex}`);
  const rng = mulberry32(seed);

  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  return list;
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
 * Computes seating chart for a specific gender by column, combining:
 * 1. Weekly Student Classmate Shuffle (weekIndex)
 * 2. Daily Bench Rotation (dayIndex offset per column)
 */
function getSeatingForGenderColumns(genderBenches, studentsInGender, weekIndex, dayIndex, gender) {
  if (genderBenches.length === 0) return [];

  // Group benches by column
  const columns = {};
  genderBenches.forEach(b => {
    if (!columns[b.column]) columns[b.column] = [];
    columns[b.column].push(b);
  });

  const seating = [];

  // Process each column independently
  Object.keys(columns).forEach(colName => {
    const colBenches = columns[colName].sort((a, b) => a.position - b.position);
    const numBenches = colBenches.length;

    // Filter students belonging to this column/bench group initially
    // For girls (C1): all 13 girls shuffle in C1.
    // For boys (C2, C3, C4): boys assigned to benches in this column
    let colStudents = [];
    if (gender === 'female') {
      colStudents = [...studentsInGender];
    } else {
      const colBenchIds = new Set(colBenches.map(b => b.id));
      colStudents = studentsInGender.filter(s => colBenchIds.has(s.bench_id));
    }

    // Step 1: Weekly Student Classmate Shuffle
    const shuffledStudents = getWeeklyShuffledStudents(colStudents, `${gender}_${colName}`, weekIndex);

    // Form week's bench student groups
    const benchGroups = [];
    let ptr = 0;
    colBenches.forEach(bench => {
      benchGroups.push({
        orig_bench: bench,
        students: shuffledStudents.slice(ptr, ptr + bench.capacity)
      });
      ptr += bench.capacity;
    });

    // Step 2: Daily Bench Rotation (Shift seat position within column every day)
    // On day D, group k moves to physical bench position (k + dayIndex) % numBenches
    const dailyOffset = ((dayIndex % numBenches) + numBenches) % numBenches;

    colBenches.forEach((physicalBench, p) => {
      const groupPos = ((p - dailyOffset) % numBenches + numBenches) % numBenches;
      const occupantGroup = benchGroups[groupPos];

      seating.push({
        physical_bench: physicalBench,
        column: colName,
        students: occupantGroup ? occupantGroup.students.map(s => ({
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
    const found = entry.students.find(s => s.id === userId);
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
