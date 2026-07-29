/**
 * Utility functions for weekly bench rotation logic.
 */

function getWeekIndex(startDateStr, targetDateStr) {
  const start = new Date(startDateStr);
  const target = new Date(targetDateStr);
  
  // Midnight UTC calculation for clean date diff without timezone skew
  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const targetUtc = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  
  const diffDays = Math.floor((targetUtc - startUtc) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7);
}

/**
 * Given all benches of a specific gender sorted by position, and weekIndex,
 * returns a mapping or updated list of physical benches with their current student groups.
 */
function getSeatingForGender(genderBenches, studentsInGender, weekIndex) {
  const n = genderBenches.length;
  if (n === 0) return [];

  const offset = ((weekIndex % n) + n) % n;

  // Create map of bench.id -> students who started at that bench (original week-zero group)
  const studentsByOrigBenchId = {};
  genderBenches.forEach(b => {
    studentsByOrigBenchId[b.id] = [];
  });
  
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

  // Physical position p gets student group from original position p_orig = (p - offset + n) % n
  return genderBenches.map((physicalBench, p) => {
    const origPos = ((p - offset) % n + n) % n;
    const origBench = genderBenches[origPos];
    const occupantStudents = origBench ? (studentsByOrigBenchId[origBench.id] || []) : [];

    return {
      physical_bench: physicalBench, // id, name, gender, capacity, position
      orig_bench: origBench,
      students: occupantStudents
    };
  });
}

/**
 * For a specific student, compute which physical bench they sit at this week,
 * and who their benchmates are.
 */
function getStudentCurrentBench(student, allGenderBenches, allGenderStudents, weekIndex) {
  const n = allGenderBenches.length;
  if (n === 0) return null;

  // Find original bench position
  const origBenchIndex = allGenderBenches.findIndex(b => b.id === student.bench_id);
  if (origBenchIndex === -1) return null;

  const offset = ((weekIndex % n) + n) % n;
  const currentPos = (origBenchIndex + offset) % n;
  const currentPhysicalBench = allGenderBenches[currentPos];

  // Benchmates are students who share the exact same original bench_id
  const benchmates = allGenderStudents.filter(s => s.bench_id === student.bench_id);

  return {
    physical_bench: currentPhysicalBench,
    week_index: weekIndex,
    students: benchmates.map(s => ({
      id: s.id,
      full_name: s.full_name,
      roll_number: s.roll_number,
      is_current_user: s.id === student.id
    }))
  };
}

module.exports = {
  getWeekIndex,
  getSeatingForGender,
  getStudentCurrentBench
};
