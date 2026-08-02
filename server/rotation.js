/**
 * Cross-Column Weekly Coprime Rotation & Daily Bench Shift Engine
 */

const COPRIME_STRIDES = [
  5, 11, 13, 17, 19, 23, 25, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79,
  83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181,
  191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293,
  307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421
];

function getDaysDiff(startDateStr, targetDateStr) {
  const start = new Date(startDateStr);
  const target = new Date(targetDateStr);
  
  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const targetUtc = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  
  return Math.floor((targetUtc - startUtc) / (1000 * 60 * 60 * 24));
}

function getWeekIndex(startDateStr, targetDateStr) {
  const diffDays = getDaysDiff(startDateStr, targetDateStr);
  return Math.floor(diffDays / 7);
}

function getWeeklyShuffledStudents(students, gender, weekIndex) {
  if (weekIndex === 0) {
    return [...students].sort((a, b) => a.roll_number - b.roll_number);
  }

  const list = [...students].sort((a, b) => a.roll_number - b.roll_number);
  const m = list.length;
  if (m <= 1) return list;

  const stride = COPRIME_STRIDES[(weekIndex - 1) % COPRIME_STRIDES.length];
  const shift = (weekIndex * 11) % m;

  const permuted = new Array(m);
  for (let i = 0; i < m; i++) {
    const targetIdx = (i * stride + shift) % m;
    permuted[targetIdx] = list[i];
  }

  return permuted;
}

function getSeatingForGender(genderBenches, studentsInGender, weekIndex, dayIndex = 0, gender = 'male') {
  if (genderBenches.length === 0) return [];

  const sortedBenches = [...genderBenches].sort((a, b) => a.position - b.position);
  const weekStudents = getWeeklyShuffledStudents(studentsInGender, gender, weekIndex);

  const benchGroups = [];
  let ptr = 0;
  sortedBenches.forEach(bench => {
    benchGroups.push({
      orig_bench: bench,
      column: bench.column || 'C1',
      students: weekStudents.slice(ptr, ptr + bench.capacity)
    });
    ptr += bench.capacity;
  });

  const columns = {};
  benchGroups.forEach(bg => {
    if (!columns[bg.column]) columns[bg.column] = [];
    columns[bg.column].push(bg);
  });

  const seating = [];

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

function getStudentCurrentBench(student, allGenderBenches, allGenderStudents, weekIndex, dayIndex = 0) {
  const seating = getSeatingForGender(allGenderBenches, allGenderStudents, weekIndex, dayIndex, student.gender);
  
  let currentMatch = null;
  for (const entry of seating) {
    const found = entry.students.find(s => s.id === student.id);
    if (found) {
      currentMatch = entry;
      break;
    }
  }

  if (!currentMatch) return null;

  return {
    physical_bench: currentMatch.physical_bench,
    column: currentMatch.column,
    week_index: weekIndex,
    students: currentMatch.students.map(s => ({
      id: s.id,
      full_name: s.full_name,
      roll_number: s.roll_number,
      is_current_user: s.id === student.id
    }))
  };
}

module.exports = {
  getWeekIndex,
  getDaysDiff,
  getSeatingForGender,
  getStudentCurrentBench
};
