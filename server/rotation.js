/**
 * Crash-Proof Cross-Column Weekly Coprime Rotation & Daily Bench Shift Engine
 */

function gcd(a, b) {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

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
  const list = [...students].sort((a, b) => (parseInt(a.roll_number) || 0) - (parseInt(b.roll_number) || 0));
  const m = list.length;
  if (m <= 1 || weekIndex === 0) return list;

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

function getSeatingForGender(genderBenches, studentsInGender, weekIndex, dayIndex = 0, gender = 'male') {
  if (genderBenches.length === 0) return [];

  const sortedBenches = [...genderBenches].sort((a, b) => a.position - b.position);
  const weekStudents = getWeeklyShuffledStudents(studentsInGender, gender, weekIndex);

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

function getStudentCurrentBench(student, allGenderBenches, allGenderStudents, weekIndex, dayIndex = 0) {
  const seating = getSeatingForGender(allGenderBenches, allGenderStudents, weekIndex, dayIndex, student.gender);
  
  let currentMatch = null;
  for (const entry of seating) {
    const found = entry.students && entry.students.find(s => s.id === student.id);
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
