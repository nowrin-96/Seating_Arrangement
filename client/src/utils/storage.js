import bcrypt from 'bcryptjs';
import { INITIAL_CONFIG, INITIAL_ADMIN, INITIAL_BENCHES, INITIAL_STUDENTS } from '../data/classData';

const CONFIG_KEY = 'bench_rotation_config';
const ADMIN_KEY = 'bench_rotation_admin';
const BENCHES_KEY = 'bench_rotation_benches';
const STUDENTS_KEY = 'bench_rotation_students';
const SESSION_KEY = 'bench_rotation_session';
const VERSION_KEY = 'bench_rotation_data_version';

// DATA VERSION TRACKER - Version 4 enables weekly dynamic classmate shuffling
const CURRENT_DATA_VERSION = 'v4_dynamic_classmate_shuffle';

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
 * Deterministically shuffles student array based on week index and gender
 * ensuring students get paired with different classmates every week.
 */
function getWeeklyShuffledStudents(students, gender, weekIndex) {
  if (weekIndex === 0) {
    return [...students]; // Base week 0 seating matching initial bench assignments
  }

  const list = [...students];
  const seed = stringToSeed(`shuffle_${gender}_week_${weekIndex}`);
  const rng = mulberry32(seed);

  // Fisher-Yates shuffle using deterministic PRNG
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  return list;
}

// Initialize LocalStorage with default data if empty OR if data version updated
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
// ROTATION & CLASSMATE SHUFFLE CALCULATIONS
// ----------------------------------------------------

export function getWeekIndex(startDateStr, targetDateStr) {
  const start = new Date(startDateStr);
  const target = new Date(targetDateStr);
  
  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const targetUtc = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  
  const diffDays = Math.floor((targetUtc - startUtc) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

function getSeatingForGenderList(genderBenches, studentsInGender, weekIndex, gender) {
  const n = genderBenches.length;
  if (n === 0) return [];

  // Sort benches by physical position
  const sortedBenches = [...genderBenches].sort((a, b) => a.position - b.position);

  let orderedStudents = [];
  if (weekIndex === 0) {
    // Week 0: Fill benches based on initial bench_id assignment
    const studentsByBench = {};
    sortedBenches.forEach(b => { studentsByBench[b.id] = []; });
    studentsInGender.forEach(s => {
      if (studentsByBench[s.bench_id]) {
        studentsByBench[s.bench_id].push(s);
      }
    });

    return sortedBenches.map(bench => ({
      physical_bench: bench,
      students: studentsByBench[bench.id] || []
    }));
  } else {
    // Week > 0: Shuffled order guaranteeing different classmates each week
    orderedStudents = getWeeklyShuffledStudents(studentsInGender, gender, weekIndex);

    let studentPointer = 0;
    return sortedBenches.map(bench => {
      const benchStudents = orderedStudents.slice(studentPointer, studentPointer + bench.capacity);
      studentPointer += bench.capacity;

      return {
        physical_bench: bench,
        students: benchStudents.map(s => ({
          id: s.id,
          username: s.username,
          full_name: s.full_name,
          roll_number: s.roll_number,
          gender: s.gender,
          orig_bench_id: s.bench_id
        }))
      };
    });
  }
}

export function getSeatingChart(targetDateStr) {
  const config = getConfig();
  const benches = getBenches();
  const students = getStudents();

  const weekIndex = getWeekIndex(config.rotation_start_date, targetDateStr);

  const femaleBenches = benches.filter(b => b.gender === 'female');
  const femaleStudents = students.filter(s => s.gender === 'female');

  const maleBenches = benches.filter(b => b.gender === 'male');
  const maleStudents = students.filter(s => s.gender === 'male');

  const femaleSeating = getSeatingForGenderList(femaleBenches, femaleStudents, weekIndex, 'female');
  const maleSeating = getSeatingForGenderList(maleBenches, maleStudents, weekIndex, 'male');

  return {
    rotation_start_date: config.rotation_start_date,
    target_date: targetDateStr,
    week_index: weekIndex,
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

  // Find physical bench containing this student
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
    bench_info: {
      physical_bench: currentBenchMatch.physical_bench,
      week_index: chart.week_index,
      students: currentBenchMatch.students.map(s => ({
        id: s.id,
        full_name: s.full_name,
        roll_number: s.roll_number,
        is_current_user: s.id === userId
      }))
    }
  };
}
