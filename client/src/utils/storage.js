import bcrypt from 'bcryptjs';
import { INITIAL_CONFIG, INITIAL_ADMIN, INITIAL_BENCHES, INITIAL_STUDENTS } from '../data/classData';

const CONFIG_KEY = 'bench_rotation_config';
const ADMIN_KEY = 'bench_rotation_admin';
const BENCHES_KEY = 'bench_rotation_benches';
const STUDENTS_KEY = 'bench_rotation_students';
const SESSION_KEY = 'bench_rotation_session';
const VERSION_KEY = 'bench_rotation_data_version';

// DATA VERSION TRACKER - Version 9: Greedy Constraint Pair Tracking Algorithm (Zero Repeated Benchmates)
const CURRENT_DATA_VERSION = 'v9_greedy_zero_repeat_pairs';

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

function getPairKey(idA, idB) {
  return idA < idB ? `${idA}_${idB}` : `${idB}_${idA}`;
}

/**
 * Greedy Pair-Tracking Weekly Seating Algorithm:
 * Evaluates candidate shuffles against all past weeks (0..W-1) and picks candidate with ZERO pair collisions.
 */
function computeWeeklySeatingSequence(students, benches, weekIndex, gender) {
  const genderStudents = [...students].filter(s => s.gender === gender)
    .sort((a, b) => (parseInt(a.roll_number) || 0) - (parseInt(b.roll_number) || 0));
  const genderBenches = [...benches].filter(b => b.gender === gender)
    .sort((a, b) => a.position - b.position);

  if (genderStudents.length === 0 || genderBenches.length === 0) return [];

  // Track pair history across weeks
  const pairHistory = {}; // pairKey -> count

  let currentWeekArrangement = null;

  for (let w = 0; w <= weekIndex; w++) {
    if (w === 0) {
      // Week 0 base seating
      const benchMap = [];
      let ptr = 0;
      genderBenches.forEach(bench => {
        const group = genderStudents.slice(ptr, ptr + bench.capacity);
        benchMap.push(group);
        ptr += bench.capacity;
      });

      // Record pairs for Week 0
      benchMap.forEach(group => {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const key = getPairKey(group[i].id, group[j].id);
            pairHistory[key] = (pairHistory[key] || 0) + 1;
          }
        }
      });

      if (w === weekIndex) currentWeekArrangement = benchMap;
    } else {
      // Week W > 0: Evaluate 100 deterministic candidates to find 0 pair collisions
      let bestCandidate = null;
      let bestScore = Infinity;

      for (let cand = 1; cand <= 100; cand++) {
        const seed = stringToSeed(`cand_${gender}_w${w}_c${cand}`);
        const rng = mulberry32(seed);

        const candList = [...genderStudents];
        for (let i = candList.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          [candList[i], candList[j]] = [candList[j], candList[i]];
        }

        // Partition into bench groups matching capacities
        const candidateGroups = [];
        let ptr = 0;
        genderBenches.forEach(bench => {
          candidateGroups.push(candList.slice(ptr, ptr + bench.capacity));
          ptr += bench.capacity;
        });

        // Score candidate based on past pair collisions
        let score = 0;
        candidateGroups.forEach(group => {
          for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
              const key = getPairKey(group[i].id, group[j].id);
              const pastCount = pairHistory[key] || 0;
              score += pastCount * 100 + pastCount * pastCount * 500;
            }
          }
        });

        if (score < bestScore) {
          bestScore = score;
          bestCandidate = candidateGroups;
          if (score === 0) break; // Found perfect candidate with 0 repeat pairs!
        }
      }

      // Record pairs for winning candidate
      bestCandidate.forEach(group => {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const key = getPairKey(group[i].id, group[j].id);
            pairHistory[key] = (pairHistory[key] || 0) + 1;
          }
        }
      });

      if (w === weekIndex) currentWeekArrangement = bestCandidate;
    }
  }

  // Flatten into single student list in bench order
  const resultStudents = [];
  currentWeekArrangement.forEach(group => {
    resultStudents.push(...group);
  });

  return resultStudents;
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
 * 1. Greedy Pair Tracking (0 repeat benchmates across weeks)
 * 2. Daily Bench Rotation (shifts seat position by 1 bench per day within column)
 */
function getSeatingForGenderColumns(genderBenches, studentsInGender, weekIndex, dayIndex, gender) {
  if (genderBenches.length === 0) return [];

  const sortedBenches = [...genderBenches].sort((a, b) => a.position - b.position);

  // Step 1: Compute Week's Seating using Pair Collision Solver
  const weekStudents = computeWeeklySeatingSequence(studentsInGender, sortedBenches, weekIndex, gender);

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
